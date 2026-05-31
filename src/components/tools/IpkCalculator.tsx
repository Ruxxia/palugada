import { useState, useEffect } from "react";

interface Course {
  id: string;
  name: string;
  sks: number;
  gradeValue: number; // e.g. 4.0 for A
}

export function IpkCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Mata Kuliah 1", sks: 3, gradeValue: 4.0 },
    { id: "2", name: "Mata Kuliah 2", sks: 3, gradeValue: 3.5 },
    { id: "3", name: "Mata Kuliah 3", sks: 2, gradeValue: 3.0 },
  ]);

  const [ipk, setIpk] = useState(0);
  const [totalSks, setTotalSks] = useState(0);

  const gradeOptions = [
    { label: "A (4.00)", value: 4.0 },
    { label: "A- (3.75)", value: 3.75 },
    { label: "B+ (3.50)", value: 3.5 },
    { label: "B (3.00)", value: 3.0 },
    { label: "B- (2.75)", value: 2.75 },
    { label: "C+ (2.50)", value: 2.5 },
    { label: "C (2.00)", value: 2.0 },
    { label: "D (1.00)", value: 1.0 },
    { label: "E (0.00)", value: 0.0 },
  ];

  useEffect(() => {
    let totalGradePoints = 0;
    let totalS = 0;

    courses.forEach((c) => {
      totalGradePoints += c.gradeValue * c.sks;
      totalS += c.sks;
    });

    setTotalSks(totalS);
    setIpk(totalS > 0 ? totalGradePoints / totalS : 0);
  }, [courses]);

  const addCourse = () => {
    const newId = (courses.length + 1).toString();
    setCourses([...courses, { id: newId, name: `Mata Kuliah ${newId}`, sks: 3, gradeValue: 4.0 }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(
      courses.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: value };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/75">Daftar Mata Kuliah</h3>
          <button
            onClick={addCourse}
            className="px-4 py-2 bg-foreground text-background text-xs font-bold rounded-lg hover:bg-foreground/90 transition-colors"
          >
            + Tambah Matkul
          </button>
        </div>

        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.id} className="flex gap-2 items-center flex-wrap sm:flex-nowrap bg-foreground/5 p-3 rounded-lg border border-foreground/10">
              <input
                type="text"
                value={course.name}
                onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                className="flex-1 min-w-[150px] p-2 border border-foreground/15 rounded bg-background text-sm"
                placeholder="Nama Matkul"
              />
              <div className="w-24">
                <input
                  type="number"
                  value={course.sks}
                  onChange={(e) => updateCourse(course.id, "sks", parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-foreground/15 rounded bg-background text-sm font-mono text-center"
                  placeholder="SKS"
                  min="1"
                />
              </div>
              <div className="w-36">
                <select
                  value={course.gradeValue}
                  onChange={(e) => updateCourse(course.id, "gradeValue", parseFloat(e.target.value))}
                  className="w-full p-2 border border-foreground/15 rounded bg-background text-sm"
                >
                  {gradeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeCourse(course.id)}
                disabled={courses.length <= 1}
                className="p-2 text-destructive hover:bg-destructive/10 rounded disabled:opacity-50 text-sm font-bold"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan IPK</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total SKS</span>
            <span className="text-2xl font-bold font-mono text-foreground">{totalSks} SKS</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Indeks Prestasi Kumulatif (IPK)</span>
            <span className="text-3xl font-bold font-mono text-primary">{ipk.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
