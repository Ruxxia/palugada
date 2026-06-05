-- =========================================================================
-- DATABASE SCHEMA: WEDDING PLANNER
-- Jalankan skrip DDL SQL ini di panel SQL Editor Supabase Anda.
-- =========================================================================

-- 1. Table: wedding_settings
-- Menyimpan pengaturan umum seperti tanggal pernikahan dan total anggaran target.
CREATE TABLE IF NOT EXISTS wedding_settings (
    user_id UUID PRIMARY KEY,
    wedding_date DATE NOT NULL,
    total_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;

-- Membuat Policy RLS agar user hanya bisa melihat & memodifikasi data miliknya sendiri
CREATE POLICY "Users can only manage their own wedding settings" 
ON wedding_settings FOR ALL TO authenticated USING (auth.uid() = user_id);


-- 2. Table: wedding_budgets
-- Menyimpan daftar anggaran biaya, estimasi, biaya nego riil, dan status pelunasan vendor.
CREATE TABLE IF NOT EXISTS wedding_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    estimated_cost NUMERIC(15, 2) DEFAULT 0.00,
    actual_cost NUMERIC(15, 2) DEFAULT 0.00,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE wedding_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage their own wedding budgets" 
ON wedding_budgets FOR ALL TO authenticated USING (auth.uid() = user_id);


-- 3. Table: wedding_guests
-- Menyimpan daftar tamu, kategori relasi, info kontak, catatan VIP/meja, dan status RSVP.
CREATE TABLE IF NOT EXISTS wedding_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Umum',
    rsvp_status VARCHAR(50) DEFAULT 'Pending', -- Nilai: Pending, Attending, Declined
    contact_info VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE wedding_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage their own wedding guests" 
ON wedding_guests FOR ALL TO authenticated USING (auth.uid() = user_id);


-- 4. Table: wedding_todos
-- Menyimpan daftar tugas persiapan pernikahan, batas waktu, status checklist, dan catatan.
CREATE TABLE IF NOT EXISTS wedding_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE wedding_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage their own wedding todos" 
ON wedding_todos FOR ALL TO authenticated USING (auth.uid() = user_id);
