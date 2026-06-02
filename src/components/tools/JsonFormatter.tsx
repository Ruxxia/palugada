import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Copy, Check, FileJson, Columns, Trash2, RefreshCw, AlertCircle } from "lucide-react";

// ==========================================
// Types and Interfaces
// ==========================================

interface DiffNode {
  key: string;
  status: "added" | "removed" | "modified" | "unchanged";
  type: "object" | "array" | "primitive";
  leftVal?: any;
  rightVal?: any;
  children?: DiffNode[];
}

interface DiffRow {
  path: string;
  depth: number;
  type: "header" | "footer" | "primitive" | "collapsed";
  key: string;
  status: "added" | "removed" | "modified" | "unchanged";
  nodeType: "object" | "array" | "primitive";
  leftVal?: any;
  rightVal?: any;
  isLast: boolean;
  parentIsArray: boolean;
}

// ==========================================
// Helper Functions for JSON Comparison & Parsing
// ==========================================

function getType(val: any): "object" | "array" | "primitive" {
  if (val === null || val === undefined) return "primitive";
  if (Array.isArray(val)) return "array";
  if (typeof val === "object") return "object";
  return "primitive";
}

function buildSingleTree(val: any, key: string, status: "added" | "removed" | "unchanged"): DiffNode {
  const type = getType(val);
  if (type === "primitive") {
    return {
      key,
      status,
      type,
      leftVal: status !== "added" ? val : undefined,
      rightVal: status !== "removed" ? val : undefined,
    };
  } else if (type === "array") {
    const children = (val as any[]).map((item, idx) => buildSingleTree(item, String(idx), status));
    return {
      key,
      status,
      type,
      leftVal: status !== "added" ? val : undefined,
      rightVal: status !== "removed" ? val : undefined,
      children,
    };
  } else {
    const keys = Object.keys(val);
    const children = keys.map(k => buildSingleTree(val[k], k, status));
    return {
      key,
      status,
      type,
      leftVal: status !== "added" ? val : undefined,
      rightVal: status !== "removed" ? val : undefined,
      children,
    };
  }
}

function mergeKeysPreservingOrder(keysLeft: string[], keysRight: string[]): string[] {
  const result: string[] = [...keysLeft];
  let lastInsertedIdx = -1;

  for (let i = 0; i < keysRight.length; i++) {
    const key = keysRight[i];
    const idxInResult = result.indexOf(key);

    if (idxInResult !== -1) {
      lastInsertedIdx = idxInResult;
    } else {
      let inserted = false;
      for (let j = i - 1; j >= 0; j--) {
        const predKey = keysRight[j];
        const predIdx = result.indexOf(predKey);
        if (predIdx !== -1) {
          result.splice(predIdx + 1, 0, key);
          lastInsertedIdx = predIdx + 1;
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        const insertIdx = lastInsertedIdx + 1;
        result.splice(insertIdx, 0, key);
        lastInsertedIdx = insertIdx;
      }
    }
  }

  return result;
}

function buildDiffTree(left: any, right: any, key: string): DiffNode {
  const leftType = getType(left);
  const rightType = getType(right);

  // If types mismatch, mark as modified primitive to show side-by-side change
  if (leftType !== rightType) {
    return {
      key,
      status: "modified",
      type: "primitive",
      leftVal: left,
      rightVal: right,
    };
  }

  // Same type - Primitives
  if (leftType === "primitive") {
    const isEq = left === right;
    return {
      key,
      status: isEq ? "unchanged" : "modified",
      type: "primitive",
      leftVal: left,
      rightVal: right,
    };
  }

  // Same type - Arrays
  if (leftType === "array") {
    const arrLeft = left as any[];
    const arrRight = right as any[];
    const maxLen = Math.max(arrLeft.length, arrRight.length);
    const children: DiffNode[] = [];
    let hasChanges = false;

    for (let i = 0; i < maxLen; i++) {
      if (i >= arrLeft.length) {
        children.push(buildSingleTree(arrRight[i], String(i), "added"));
        hasChanges = true;
      } else if (i >= arrRight.length) {
        children.push(buildSingleTree(arrLeft[i], String(i), "removed"));
        hasChanges = true;
      } else {
        const childDiff = buildDiffTree(arrLeft[i], arrRight[i], String(i));
        children.push(childDiff);
        if (childDiff.status !== "unchanged") {
          hasChanges = true;
        }
      }
    }

    return {
      key,
      status: hasChanges ? "modified" : "unchanged",
      type: "array",
      leftVal: left,
      rightVal: right,
      children,
    };
  }

  // Same type - Objects
  const keysLeft = Object.keys(left);
  const keysRight = Object.keys(right);
  const allKeys = mergeKeysPreservingOrder(keysLeft, keysRight);
  const children: DiffNode[] = [];
  let hasChanges = false;


  for (const k of allKeys) {
    const inLeft = Object.prototype.hasOwnProperty.call(left, k);
    const inRight = Object.prototype.hasOwnProperty.call(right, k);

    if (inLeft && !inRight) {
      children.push(buildSingleTree(left[k], k, "removed"));
      hasChanges = true;
    } else if (!inLeft && inRight) {
      children.push(buildSingleTree(right[k], k, "added"));
      hasChanges = true;
    } else {
      const childDiff = buildDiffTree(left[k], right[k], k);
      children.push(childDiff);
      if (childDiff.status !== "unchanged") {
        hasChanges = true;
      }
    }
  }

  return {
    key,
    status: hasChanges ? "modified" : "unchanged",
    type: "object",
    leftVal: left,
    rightVal: right,
    children,
  };
}

function flattenDiffTree(
  node: DiffNode,
  path: string,
  depth: number,
  isLast: boolean,
  collapsedPaths: Record<string, boolean>,
  parentIsArray = false
): DiffRow[] {
  const isCollapsed = collapsedPaths[path];
  const hasChildren = node.children && node.children.length > 0;

  if (node.type === "primitive" || !hasChildren) {
    return [
      {
        path,
        depth,
        type: "primitive",
        key: node.key,
        status: node.status,
        nodeType: node.type,
        leftVal: node.leftVal,
        rightVal: node.rightVal,
        isLast,
        parentIsArray,
      },
    ];
  }

  if (isCollapsed) {
    return [
      {
        path,
        depth,
        type: "collapsed",
        key: node.key,
        status: node.status,
        nodeType: node.type,
        leftVal: node.leftVal,
        rightVal: node.rightVal,
        isLast,
        parentIsArray,
      },
    ];
  }

  const rows: DiffRow[] = [];

  // Header row
  rows.push({
    path,
    depth,
    type: "header",
    key: node.key,
    status: node.status,
    nodeType: node.type,
    leftVal: node.leftVal,
    rightVal: node.rightVal,
    isLast,
    parentIsArray,
  });

  // Children rows
  if (node.children) {
    const isArrayType = node.type === "array";
    node.children.forEach((child, idx) => {
      const childPath = path ? `${path}.${child.key}` : child.key;
      const childIsLast = idx === node.children!.length - 1;
      rows.push(...flattenDiffTree(child, childPath, depth + 1, childIsLast, collapsedPaths, isArrayType));
    });
  }

  // Footer row
  rows.push({
    path,
    depth,
    type: "footer",
    key: node.key,
    status: node.status,
    nodeType: node.type,
    leftVal: node.leftVal,
    rightVal: node.rightVal,
    isLast,
    parentIsArray,
  });

  return rows;
}

function getAllExpandablePaths(node: DiffNode, parentPath = ""): string[] {
  const currentPath = parentPath ? `${parentPath}.${node.key}` : node.key;
  const paths: string[] = [];

  if (node.type !== "primitive" && node.children && node.children.length > 0) {
    paths.push(currentPath);
    node.children.forEach(child => {
      paths.push(...getAllExpandablePaths(child, currentPath));
    });
  }

  return paths;
}

function countChanges(node: DiffNode): { added: number; removed: number; modified: number } {
  let added = 0;
  let removed = 0;
  let modified = 0;

  if (node.status === "added") {
    return { added: countPrimitives(node.rightVal), removed: 0, modified: 0 };
  }
  if (node.status === "removed") {
    return { added: 0, removed: countPrimitives(node.leftVal), modified: 0 };
  }
  if (node.status === "modified") {
    if (node.type === "primitive") {
      return { added: 0, removed: 0, modified: 1 };
    }
  }

  if (node.children) {
    node.children.forEach(child => {
      const childChanges = countChanges(child);
      added += childChanges.added;
      removed += childChanges.removed;
      modified += childChanges.modified;
    });
  }

  return { added, removed, modified };
}

function countPrimitives(val: any): number {
  if (val === null || val === undefined) return 1;
  if (Array.isArray(val)) {
    return val.reduce((acc, item) => acc + countPrimitives(item), 0);
  }
  if (typeof val === "object") {
    return Object.keys(val).reduce((acc, k) => acc + countPrimitives(val[k]), 0);
  }
  return 1;
}

const getLineNumbers = (rows: DiffRow[]) => {
  const lineNumbersA: (number | null)[] = [];
  const lineNumbersB: (number | null)[] = [];
  let currentA = 1;
  let currentB = 1;

  rows.forEach(row => {
    if (row.status === "added") {
      lineNumbersA.push(null);
      lineNumbersB.push(currentB++);
    } else if (row.status === "removed") {
      lineNumbersA.push(currentA++);
      lineNumbersB.push(null);
    } else {
      lineNumbersA.push(currentA++);
      lineNumbersB.push(currentB++);
    }
  });

  return { lineNumbersA, lineNumbersB };
};

// ==========================================
// Rendering Utilities
// ==========================================

function renderValue(val: any) {
  if (val === undefined) return null;
  if (val === null) return <span className="text-foreground/40 italic">null</span>;
  if (typeof val === "string") return <span className="text-emerald-600 dark:text-emerald-400 select-text">"{val}"</span>;
  if (typeof val === "number") return <span className="text-amber-600 dark:text-amber-400 select-text">{val}</span>;
  if (typeof val === "boolean") return <span className="text-purple-600 dark:text-purple-400 font-medium select-text">{String(val)}</span>;
  return <span className="select-text">{JSON.stringify(val)}</span>;
}

function getBgColor(status: string, side: "left" | "right"): string {
  if (status === "unchanged") return "hover:bg-foreground/5";
  if (status === "modified") return "bg-amber-500/10 hover:bg-amber-500/15";
  if (side === "left") {
    if (status === "removed") return "bg-destructive/10 text-destructive font-semibold hover:bg-destructive/15";
    if (status === "added") return "opacity-20 select-none pointer-events-none";
  } else {
    if (status === "added") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/15";
    if (status === "removed") return "opacity-20 select-none pointer-events-none";
  }
  return "";
}

// ==========================================
// Component Implementation
// ==========================================

export function JsonFormatter() {
  const [tab, setTab] = useState<"formatter" | "diff">("formatter");

  // ------------------------------------------
  // Formatter & Validator State
  // ------------------------------------------
  const [input, setInput] = useState(
    JSON.stringify(
      {
        name: "palugada",
        version: "1.0.3",
        active: true,
        stats: {
          downloads: 1420,
          rating: 4.9,
        },
        tags: ["utility", "formatter", "diff"],
      },
      null,
      2
    )
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [formatterView, setFormatterView] = useState<"text" | "tree">("text");
  const [formatterCollapsedPaths, setFormatterCollapsedPaths] = useState<Record<string, boolean>>({});

  // ------------------------------------------
  // Diff State
  // ------------------------------------------
  const [inputA, setInputA] = useState(
    JSON.stringify(
      {
        name: "Palugada Tool",
        version: "1.0.3",
        active: true,
        features: ["formatting", "validation", "minification"],
        settings: {
          theme: "dark",
          autoSave: true,
          timeout: 5000,
        },
        deprecated: "oldMethod",
      },
      null,
      2
    )
  );

  const [inputB, setInputB] = useState(
    JSON.stringify(
      {
        name: "Palugada Developer Suite",
        version: "1.1.0",
        active: true,
        features: ["formatting", "validation", "minification", "json diff"],
        settings: {
          theme: "brutalist",
          autoSave: true,
          indentSize: 2,
        },
        newFeature: "collapsible-tree",
      },
      null,
      2
    )
  );

  const [diffCollapsedPaths, setDiffCollapsedPaths] = useState<Record<string, boolean>>({});

  // ------------------------------------------
  // Formatter Logic
  // ------------------------------------------
  const format = (minify = false) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const clearFormatter = () => {
    setInput("");
    setOutput("");
    setError("");
    setFormatterCollapsedPaths({});
  };

  // Parse current format output for tree view reactively
  const formatterParsed = useMemo(() => {
    if (!output) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output]);

  const formatterTree = useMemo(() => {
    if (!formatterParsed) return null;
    return buildSingleTree(formatterParsed, "", "unchanged");
  }, [formatterParsed]);

  const formatterRows = useMemo(() => {
    if (!formatterTree) return [];
    return flattenDiffTree(formatterTree, "", 0, true, formatterCollapsedPaths);
  }, [formatterTree, formatterCollapsedPaths]);

  // ------------------------------------------
  // Diff Logic
  // ------------------------------------------
  const diffResult = useMemo(() => {
    if (!inputA || !inputB) return { tree: null, errorA: "", errorB: "" };

    let parsedA: any = null;
    let parsedB: any = null;
    let errorA = "";
    let errorB = "";

    try {
      parsedA = JSON.parse(inputA);
    } catch (e) {
      errorA = `JSON A: ${(e as Error).message}`;
    }

    try {
      parsedB = JSON.parse(inputB);
    } catch (e) {
      errorB = `JSON B: ${(e as Error).message}`;
    }

    if (errorA || errorB) {
      return { tree: null, errorA, errorB };
    }

    try {
      const tree = buildDiffTree(parsedA, parsedB, "");
      return { tree, errorA: "", errorB: "" };
    } catch (e) {
      return { tree: null, errorA: "Gagal membandingkan data JSON", errorB: "" };
    }
  }, [inputA, inputB]);

  const diffTree = diffResult.tree;
  const diffRows = useMemo(() => {
    if (!diffTree) return [];
    return flattenDiffTree(diffTree, "", 0, true, diffCollapsedPaths);
  }, [diffTree, diffCollapsedPaths]);

  const { lineNumbersA, lineNumbersB } = useMemo(() => {
    return getLineNumbers(diffRows);
  }, [diffRows]);

  const diffSummary = useMemo(() => {
    if (!diffTree) return { added: 0, removed: 0, modified: 0 };
    return countChanges(diffTree);
  }, [diffTree]);

  const toggleDiffPath = (path: string) => {
    setDiffCollapsedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const clearDiff = () => {
    setInputA("");
    setInputB("");
    setDiffCollapsedPaths({});
  };

  // ------------------------------------------
  // Content Render Helper
  // ------------------------------------------
  const renderRowContent = (row: DiffRow, side: "left" | "right") => {
    const isLeft = side === "left";
    const val = isLeft ? row.leftVal : row.rightVal;
    const exists = isLeft ? row.status !== "added" : row.status !== "removed";

    if (!exists) {
      return <div className="text-foreground/20 italic font-mono select-none">// empty</div>;
    }

    const openBracket = row.nodeType === "array" ? "[" : "{";
    const closeBracket = row.nodeType === "array" ? "]" : "}";
    const collapsedBracket = row.nodeType === "array" ? "[...]" : "{...}";
    const comma = row.isLast ? "" : ",";

    const renderKey = () => {
      if (row.depth === 0) return null;
      if (row.parentIsArray) return null;
      return (
        <>
          <span className="text-blue-600 dark:text-blue-400 font-semibold select-text">"{row.key}"</span>
          <span className="text-foreground/50">: </span>
        </>
      );
    };

    switch (row.type) {
      case "header":
        return (
          <div className="flex items-center gap-1">
            {renderKey()}
            <span className="text-foreground/80 font-bold">{openBracket}</span>
          </div>
        );
      case "footer":
        return (
          <div>
            <span className="text-foreground/80 font-bold">{closeBracket}</span>
            <span className="text-foreground/50">{comma}</span>
          </div>
        );
      case "collapsed":
        return (
          <div className="flex items-center gap-1">
            {renderKey()}
            <span className="text-foreground/40 font-mono italic select-none">{collapsedBracket}</span>
            <span className="text-foreground/50">{comma}</span>
          </div>
        );
      case "primitive":
        return (
          <div className="flex items-start flex-wrap gap-x-1">
            {renderKey()}
            {renderValue(val)}
            <span className="text-foreground/50">{comma}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-foreground/10">
        <button
          onClick={() => setTab("formatter")}
          className={`flex items-center gap-2 px-6 py-3 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            tab === "formatter"
              ? "border-foreground text-foreground"
              : "border-transparent text-foreground/50 hover:text-foreground hover:border-foreground/30"
          }`}
        >
          <FileJson size={14} />
          Formatter & Validator
        </button>
        <button
          onClick={() => setTab("diff")}
          className={`flex items-center gap-2 px-6 py-3 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            tab === "diff"
              ? "border-foreground text-foreground"
              : "border-transparent text-foreground/50 hover:text-foreground hover:border-foreground/30"
          }`}
        >
          <Columns size={14} />
          JSON Diff
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB: Formatter & Validator                 */}
      {/* ========================================== */}
      {tab === "formatter" && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
              placeholder="Paste atau ketik JSON di sini..."
              aria-label="JSON input"
            />
          </div>

          <div className="flex gap-2 flex-wrap justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => format(false)}
                className="bg-foreground text-background px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                Format
              </button>
              <button
                onClick={() => format(true)}
                className="bg-card border-2 border-foreground px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                Minify
              </button>
              <button
                onClick={clearFormatter}
                className="bg-card border border-foreground/15 px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            {output && (
              <div className="flex bg-card border border-foreground/15 rounded-lg p-0.5 font-mono text-xs">
                <button
                  onClick={() => setFormatterView("text")}
                  className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    formatterView === "text" ? "bg-foreground text-background" : "hover:bg-foreground/5 text-foreground/75"
                  }`}
                >
                  Raw Code
                </button>
                <button
                  onClick={() => setFormatterView("tree")}
                  className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    formatterView === "tree" ? "bg-foreground text-background" : "hover:bg-foreground/5 text-foreground/75"
                  }`}
                >
                  Interactive Tree
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm font-mono flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block font-bold">Invalid JSON:</strong>
                {error}
              </div>
            </div>
          )}

          {output && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-foreground/60 px-1 font-mono">
                <span className="text-emerald-500 font-bold">✓ JSON Valid & Terformat</span>
              </div>

              {formatterView === "text" ? (
                <div className="relative">
                  <pre className="font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-96 select-text">
                    {output}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 bg-foreground text-background px-3 py-1 rounded text-xs font-mono uppercase flex items-center gap-1.5 hover:bg-foreground/90 transition-colors cursor-pointer"
                  >
                    {copiedOutput ? <Check size={12} /> : <Copy size={12} />}
                    {copiedOutput ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : (
                <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background font-mono text-xs max-h-96 overflow-y-auto">
                  <div className="bg-card px-4 py-2.5 border-b border-foreground/10 flex justify-between items-center text-xs select-none">
                    <span className="text-foreground/50 uppercase tracking-wider font-bold">Interactive Tree View</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormatterCollapsedPaths({})}
                        className="hover:underline text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Expand All
                      </button>
                      <span className="text-foreground/20">|</span>
                      <button
                        onClick={() => {
                          if (formatterTree) {
                            const paths = getAllExpandablePaths(formatterTree, "");
                            const newCollapsed: Record<string, boolean> = {};
                            paths.forEach(p => {
                              newCollapsed[p] = true;
                            });
                            setFormatterCollapsedPaths(newCollapsed);
                          }
                        }}
                        className="hover:underline text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                  <div className="p-4 overflow-x-auto whitespace-pre font-mono select-none">
                    {formatterRows.map((row, idx) => (
                      <div key={idx} className="flex items-start group hover:bg-foreground/5 py-0.5 rounded-sm">
                        <div className="w-10 text-right pr-3 select-none text-foreground/30 font-mono text-[10px] pt-0.5">
                          {idx + 1}
                        </div>
                        <div style={{ width: `${row.depth * 16}px` }} className="flex-shrink-0" />
                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center mr-1">
                          {(row.type === "header" || row.type === "collapsed") && (
                            <button
                              onClick={() => {
                                setFormatterCollapsedPaths(prev => ({
                                  ...prev,
                                  [row.path]: !prev[row.path],
                                }));
                              }}
                              className="w-4 h-4 flex items-center justify-center hover:bg-foreground/10 rounded cursor-pointer text-foreground/60 transition-transform"
                            >
                              {row.type === "header" ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </button>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          {renderRowContent(row, "left")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: JSON Diff                             */}
      {/* ========================================== */}
      {tab === "diff" && (
        <div className="space-y-6">
          {/* Side-by-Side Editor Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="json-a-input" className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/50 block">
                Original JSON (A)
              </label>
              <textarea
                id="json-a-input"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                rows={8}
                className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
                placeholder="Paste original JSON..."
              />
              {diffResult.errorA && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-xs font-mono flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{diffResult.errorA}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="json-b-input" className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/50 block">
                Modified JSON (B)
              </label>
              <textarea
                id="json-b-input"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                rows={8}
                className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
                placeholder="Paste modified JSON..."
              />
              {diffResult.errorB && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-xs font-mono flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{diffResult.errorB}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex gap-2">
            <button
              onClick={clearDiff}
              className="bg-card border border-foreground/15 px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Inputs
            </button>
          </div>

          {/* Diff Result Rendering */}
          {diffTree && (
            <div className="space-y-4">
              {/* Summary and Legend */}
              <div className="bg-card border border-foreground/15 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4 text-xs font-mono select-none">
                <div className="flex gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-sm"></span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+{diffSummary.added}</strong> Added
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-destructive/15 border border-destructive/30 rounded-sm"></span>
                    <strong className="text-destructive font-bold">-{diffSummary.removed}</strong> Removed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/40 rounded-sm"></span>
                    <strong className="text-amber-500 font-bold">~{diffSummary.modified}</strong> Modified
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDiffCollapsedPaths({})}
                    className="hover:underline text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Expand All
                  </button>
                  <span className="text-foreground/20">|</span>
                  <button
                    onClick={() => {
                      const paths = getAllExpandablePaths(diffTree, "");
                      const newCollapsed: Record<string, boolean> = {};
                      paths.forEach(p => {
                        newCollapsed[p] = true;
                      });
                      setDiffCollapsedPaths(newCollapsed);
                    }}
                    className="hover:underline text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Side-by-Side Unified Scroll Pane */}
              <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background font-mono text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-foreground/10 max-h-[600px] overflow-y-auto">
                  {/* Left Column (Original A) */}
                  <div className="overflow-x-auto p-4 whitespace-pre select-none">
                    <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider mb-3 select-none">Original A</div>
                    {diffRows.map((row, idx) => {
                      const lineNum = lineNumbersA[idx];
                      return (
                        <div key={idx} className={`flex items-start py-0.5 rounded-sm ${getBgColor(row.status, "left")} group`}>
                          <div className="w-12 flex justify-between pr-3 select-none text-foreground/30 font-mono text-[10px] pt-0.5 border-r border-foreground/5 mr-2">
                            <span className="text-[9px] font-bold text-destructive/80">{row.status === "removed" ? "-" : row.status === "modified" ? "~" : " "}</span>
                            <span>{lineNum || ""}</span>
                          </div>
                          <div style={{ width: `${row.depth * 16}px` }} className="flex-shrink-0" />
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center mr-1">
                            {row.status !== "added" && (row.type === "header" || row.type === "collapsed") && (
                              <button
                                onClick={() => toggleDiffPath(row.path)}
                                className="w-4 h-4 flex items-center justify-center hover:bg-foreground/15 rounded cursor-pointer text-foreground/60 transition-transform"
                              >
                                {row.type === "header" ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                              </button>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            {renderRowContent(row, "left")}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column (Modified B) */}
                  <div className="overflow-x-auto p-4 whitespace-pre select-none">
                    <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider mb-3 select-none">Modified B</div>
                    {diffRows.map((row, idx) => {
                      const lineNum = lineNumbersB[idx];
                      return (
                        <div key={idx} className={`flex items-start py-0.5 rounded-sm ${getBgColor(row.status, "right")} group`}>
                          <div className="w-12 flex justify-between pr-3 select-none text-foreground/30 font-mono text-[10px] pt-0.5 border-r border-foreground/5 mr-2">
                            <span className="text-[9px] font-bold text-emerald-500/80">{row.status === "added" ? "+" : row.status === "modified" ? "~" : " "}</span>
                            <span>{lineNum || ""}</span>
                          </div>
                          <div style={{ width: `${row.depth * 16}px` }} className="flex-shrink-0" />
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center mr-1">
                            {row.status !== "removed" && (row.type === "header" || row.type === "collapsed") && (
                              <button
                                onClick={() => toggleDiffPath(row.path)}
                                className="w-4 h-4 flex items-center justify-center hover:bg-foreground/15 rounded cursor-pointer text-foreground/60 transition-transform"
                              >
                                {row.type === "header" ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                              </button>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            {renderRowContent(row, "right")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
