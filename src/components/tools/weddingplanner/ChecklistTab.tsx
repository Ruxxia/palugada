import { useState } from "react";
import { Plus, Trash2, Calendar, Check } from "lucide-react";
import { TodoItem } from "./types";

interface ChecklistTabProps {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onAddTodo: (title: string, dueDate: string, notes: string) => void;
}

export function ChecklistTab({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onAddTodo
}: ChecklistTabProps) {
  const [todoFilter, setTodoFilter] = useState<"all" | "completed" | "pending">("all");
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", due_date: "", notes: "" });

  const checklistTodos = todos.filter(t => !t.title.startsWith("LOGISTICS:"));

  const filteredTodos = checklistTodos.filter(t => {
    if (todoFilter === "completed") return t.is_completed;
    if (todoFilter === "pending") return !t.is_completed;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    onAddTodo(newTodo.title, newTodo.due_date, newTodo.notes);
    setNewTodo({ title: "", due_date: "", notes: "" });
    setShowTodoForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
        <div>
          <h3 className="font-display md:text-2xl uppercase">Tugas & Timeline</h3>
          <p className="text-xs text-foreground/60 mt-1">Daftar persiapan pernikahan terperinci berdasarkan deadline.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <select
            value={todoFilter}
            onChange={(e) => setTodoFilter(e.target.value as any)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground flex-1 sm:flex-initial min-h-[40px]"
          >
            <option value="all">Semua Tugas</option>
            <option value="pending">Belum Selesai</option>
            <option value="completed">Sudah Selesai</option>
          </select>
          <button
            onClick={() => setShowTodoForm(true)}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer ml-auto flex-1 sm:flex-initial justify-center min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Tambah Tugas
          </button>
        </div>
      </div>

      {/* Add Todo Form */}
      {showTodoForm && (
        <form onSubmit={handleSubmit} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Tambah Tugas Baru</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Tugas</label>
              <input
                type="text"
                required
                value={newTodo.title}
                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Fitting Baju Pengantin"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Batas Tanggal (Due Date)</label>
              <input
                type="date"
                value={newTodo.due_date}
                onChange={(e) => setNewTodo(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Catatan</label>
            <textarea
              value={newTodo.notes}
              onChange={(e) => setNewTodo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Tambahkan detail atau info kontak vendor jika ada..."
              rows={2}
              className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowTodoForm(false)}
              className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
            >
              Tambah Tugas
            </button>
          </div>
        </form>
      )}

      {/* Todos List */}
      <div className="space-y-3">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center justify-between border rounded-xl p-3 sm:p-4 transition-all ${
              todo.is_completed
                ? "bg-foreground/5 border-foreground/10 opacity-70"
                : "bg-background border-foreground/15 hover:border-foreground/30 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                  todo.is_completed
                    ? "bg-foreground border-foreground text-background"
                    : "border-foreground/30 bg-background hover:border-foreground"
                }`}
              >
                {todo.is_completed && <Check className="w-4 h-4" />}
              </button>
              <div
                onClick={() => onToggleTodo(todo.id)}
                className="cursor-pointer select-none flex-1 py-1"
              >
                <p className={`text-xs font-bold ${todo.is_completed ? "line-through text-foreground/50" : "text-foreground"}`}>
                  {todo.title}
                </p>
                {todo.due_date && (
                  <span className="text-[9px] font-mono text-foreground/45 mt-1 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Batas: {todo.due_date}
                  </span>
                )}
                {todo.notes && (
                  <p className="text-[10px] text-foreground/60 mt-1 italic leading-relaxed">
                    {todo.notes}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDeleteTodo(todo.id)}
              className="p-2 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {checklistTodos.length === 0 && (
          <p className="text-center text-xs text-foreground/50 py-12">Belum ada tugas dibuat. Klik "Tambah Tugas" untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

export default ChecklistTab;
