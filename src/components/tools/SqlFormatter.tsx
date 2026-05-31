import { useState } from "react";

export function SqlFormatter() {
  const [input, setInput] = useState("select id, name, email from users left join profiles on users.id = profiles.user_id where users.status = 'active' and profiles.age > 21 group by users.status order by users.created_at desc limit 10;");
  const [output, setOutput] = useState("");
  const [caseMode, setCaseMode] = useState<"upper" | "lower">("upper");
  const [copied, setCopied] = useState(false);

  const keywords = [
    "select", "from", "where", "and", "or", "join", "left", "right", "inner", "outer", 
    "on", "group by", "order by", "having", "limit", "offset", "insert into", "values", 
    "update", "set", "delete", "create table", "alter table", "drop table", "as", "in", 
    "is", "null", "not", "between", "like", "exists", "union", "all", "desc", "asc"
  ];

  const formatSql = () => {
    let sql = input.trim();

    // Standardize spacing
    sql = sql.replace(/\s+/g, " ");

    // Standardize commas spacing
    sql = sql.replace(/\s*,\s*/g, ", ");

    // Handle case mode for keywords
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      sql = sql.replace(regex, (match) => {
        return caseMode === "upper" ? match.toUpperCase() : match.toLowerCase();
      });
    });

    // Formatting rules: break before major clauses
    const clauses = [
      "FROM", "from", "WHERE", "where", "LEFT JOIN", "left join", "RIGHT JOIN", "right join",
      "INNER JOIN", "inner join", "JOIN", "join", "GROUP BY", "group by", "ORDER BY", "order by",
      "HAVING", "having", "LIMIT", "limit", "OFFSET", "offset", "UNION", "union", "SET", "set",
      "VALUES", "values"
    ];

    clauses.forEach((clause) => {
      const regex = new RegExp(`\\s*\\b${clause}\\b`, "g");
      sql = sql.replace(regex, `\n${clause}`);
    });

    // Indent AND / OR conditions under WHERE
    const subClauses = ["AND", "and", "OR", "or"];
    subClauses.forEach((sub) => {
      const regex = new RegExp(`\\s*\\b${sub}\\b`, "g");
      sql = sql.replace(regex, `\n  ${caseMode === "upper" ? sub.toUpperCase() : sub.toLowerCase()}`);
    });

    // Indent fields after SELECT
    const selectRegex = new RegExp(`^\\b(SELECT|select)\\b\\s+`, "i");
    sql = sql.replace(selectRegex, (match) => {
      return `${match.trim()}\n  `;
    });

    setOutput(sql.trim());
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input pane */}
      <div className="space-y-4 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">SQL Input</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCaseMode("upper")}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                caseMode === "upper" ? "bg-foreground text-background" : "bg-background border-foreground/15"
              }`}
            >
              UPPERCASE
            </button>
            <button
              onClick={() => setCaseMode("lower")}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                caseMode === "lower" ? "bg-foreground text-background" : "bg-background border-foreground/15"
              }`}
            >
              lowercase
            </button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-80 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
          placeholder="Tulis SQL query di sini..."
        />

        <button
          onClick={formatSql}
          className="w-full bg-foreground text-background h-11 rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
        >
          Format SQL
        </button>
      </div>

      {/* Output pane */}
      <div className="space-y-4 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[380px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Formatted Output</h3>
            {output && (
              <button
                onClick={copyToClipboard}
                className="bg-foreground text-background text-xs font-mono px-3 py-1 rounded hover:opacity-95 transition-opacity"
              >
                {copied ? "Copied! ✓" : "Copy SQL"}
              </button>
            )}
          </div>

          {output ? (
            <div className="bg-background border border-foreground/10 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap">{output}</pre>
            </div>
          ) : (
            <div className="text-foreground/40 text-sm py-24 text-center">
              Hasil SQL yang diformat akan muncul di sini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
