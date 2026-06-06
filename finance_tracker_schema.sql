-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WALLETS (Rekening & Dompet)
CREATE TABLE IF NOT EXISTS finance_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- e.g., 'BCA', 'GoPay', 'Cash'
  type VARCHAR(20) NOT NULL, -- 'Bank', 'E-Wallet', 'Tunai', 'Investasi'
  balance NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TRANSACTIONS (Mutasi Rekening)
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES finance_wallets(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL, -- 'income', 'expense', 'transfer'
  amount NUMERIC(15, 2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Jajan', 'Gaji', 'Transfer', etc.
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval VARCHAR(20), -- 'monthly', 'weekly' (null if false)
  transfer_to_wallet_id UUID REFERENCES finance_wallets(id) ON DELETE SET NULL, -- for transfers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUDGETS (Anggaran Bulanan)
CREATE TABLE IF NOT EXISTS finance_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  limit_amount NUMERIC(15, 2) NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- format 'YYYY-MM'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, category, month_year)
);

-- 4. GOALS (Target Tabungan)
CREATE TABLE IF NOT EXISTS finance_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., 'DP Rumah KPR'
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0.00,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE finance_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_goals ENABLE ROW LEVEL SECURITY;

-- Wallets Policy
CREATE POLICY "Allow individual read/write access to wallets" ON finance_wallets
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions Policy
CREATE POLICY "Allow individual read/write access to transactions" ON finance_transactions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budgets Policy
CREATE POLICY "Allow individual read/write access to budgets" ON finance_budgets
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals Policy
CREATE POLICY "Allow individual read/write access to goals" ON finance_goals
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- BALANCE TRIGGER (Otomatis Update Balance Dompet)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Handling DELETE / UPDATE (Subtracting old values)
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
    IF OLD.type = 'income' THEN
      UPDATE finance_wallets 
      SET balance = balance - OLD.amount
      WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE finance_wallets 
      SET balance = balance + OLD.amount
      WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'transfer' THEN
      -- Source wallet (returned)
      UPDATE finance_wallets 
      SET balance = balance + OLD.amount
      WHERE id = OLD.wallet_id;
      -- Target wallet (taken back)
      IF OLD.transfer_to_wallet_id IS NOT NULL THEN
        UPDATE finance_wallets 
        SET balance = balance - OLD.amount
        WHERE id = OLD.transfer_to_wallet_id;
      END IF;
    END IF;
  END IF;

  -- 2. Handling INSERT / UPDATE (Adding new values)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.type = 'income' THEN
      UPDATE finance_wallets 
      SET balance = balance + NEW.amount
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE finance_wallets 
      SET balance = balance - NEW.amount
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'transfer' THEN
      -- Source wallet (deducted)
      UPDATE finance_wallets 
      SET balance = balance - NEW.amount
      WHERE id = NEW.wallet_id;
      -- Target wallet (credited)
      IF NEW.transfer_to_wallet_id IS NOT NULL THEN
        UPDATE finance_wallets 
        SET balance = balance + NEW.amount
        WHERE id = NEW.transfer_to_wallet_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT OR UPDATE OR DELETE ON finance_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();
