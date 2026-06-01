import { useState, useEffect, useCallback, useRef } from "react";

type Grid = number[][];

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => getEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("2048_best") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function getEmptyGrid(): Grid {
    return Array.from({ length: 4 }).map(() => Array(4).fill(0));
  }

  const addRandomTile = useCallback((currentGrid: Grid): Grid => {
    const emptyCells: { r: number; c: number }[] = [];
    currentGrid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell === 0) emptyCells.push({ r: rIdx, c: cIdx });
      });
    });

    if (emptyCells.length === 0) return currentGrid;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }, []);

  const initializeGame = useCallback(() => {
    let newGrid = getEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, [addRandomTile]);

  // Handle slide & merge logic for a single line (row/column)
  const slideLine = (line: number[]): { line: number[]; scoreGained: number } => {
    // 1. Filter out zeros
    let filtered = line.filter((val) => val !== 0);
    let scoreGained = 0;

    // 2. Merge adjacent identical elements
    const merged: number[] = [];
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const double = filtered[i] * 2;
        merged.push(double);
        scoreGained += double;
        i++; // skip next element
      } else {
        merged.push(filtered[i]);
      }
    }

    // 3. Fill the rest with zeros
    while (merged.length < 4) {
      merged.push(0);
    }

    return { line: merged, scoreGained };
  };

  const moveLeft = useCallback((currentGrid: Grid): { grid: Grid; scoreGained: number; changed: boolean } => {
    let scoreGained = 0;
    let changed = false;

    const newGrid = currentGrid.map((row) => {
      const { line, scoreGained: s } = slideLine(row);
      scoreGained += s;
      if (JSON.stringify(row) !== JSON.stringify(line)) {
        changed = true;
      }
      return line;
    });

    return { grid: newGrid, scoreGained, changed };
  }, []);

  const rotateGridRight = (currentGrid: Grid): Grid => {
    const newGrid = getEmptyGrid();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newGrid[c][3 - r] = currentGrid[r][c];
      }
    }
    return newGrid;
  };

  const rotateGridLeft = (currentGrid: Grid): Grid => {
    const newGrid = getEmptyGrid();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newGrid[3 - c][r] = currentGrid[r][c];
      }
    }
    return newGrid;
  };

  const handleMove = useCallback((direction: "left" | "right" | "up" | "down") => {
    setGrid((prevGrid) => {
      let tempGrid = prevGrid.map((row) => [...row]);
      let rotations = 0;

      // Rotate grid to reduce all directions to "moveLeft"
      if (direction === "up") {
        tempGrid = rotateGridLeft(tempGrid);
        rotations = 1;
      } else if (direction === "right") {
        tempGrid = rotateGridRight(rotateGridRight(tempGrid));
        rotations = 2;
      } else if (direction === "down") {
        tempGrid = rotateGridRight(tempGrid);
        rotations = 3;
      }

      const { grid: movedGrid, scoreGained, changed } = moveLeft(tempGrid);

      // Rotate back
      let finalGrid = movedGrid;
      if (rotations === 1) {
        finalGrid = rotateGridRight(finalGrid);
      } else if (rotations === 2) {
        finalGrid = rotateGridRight(rotateGridRight(finalGrid));
      } else if (rotations === 3) {
        finalGrid = rotateGridLeft(finalGrid);
      }

      if (changed) {
        setScore((prevScore) => {
          const nextScore = prevScore + scoreGained;
          if (nextScore > bestScore) {
            setBestScore(nextScore);
            try {
              localStorage.setItem("2048_best", String(nextScore));
            } catch (e) {}
          }
          return nextScore;
        });
        const gridWithNew = addRandomTile(finalGrid);
        
        // Check game over
        if (checkGameOver(gridWithNew)) {
          setGameOver(true);
        }
        return gridWithNew;
      }

      return prevGrid;
    });
  }, [moveLeft, addRandomTile, bestScore]);

  const checkGameOver = (currentGrid: Grid): boolean => {
    // 1. Check for empty cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) return false;
      }
    }

    // 2. Check for mergeable adjacent cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = currentGrid[r][c];
        if (r < 3 && val === currentGrid[r + 1][c]) return false;
        if (c < 3 && val === currentGrid[r][c + 1]) return false;
      }
    }

    return true;
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      const key = e.key.toLowerCase();
      if (key === "arrowleft" || key === "a") {
        e.preventDefault();
        handleMove("left");
      } else if (key === "arrowright" || key === "d") {
        e.preventDefault();
        handleMove("right");
      } else if (key === "arrowup" || key === "w") {
        e.preventDefault();
        handleMove("up");
      } else if (key === "arrowdown" || key === "s") {
        e.preventDefault();
        handleMove("down");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove, gameOver]);

  // Touch Swipe listeners (Mobile support)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameOver) return;

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) > 30) {
      // minimum 30px swipe
      if (absX > absY) {
        if (diffX > 0) handleMove("right");
        else handleMove("left");
      } else {
        if (diffY > 0) handleMove("down");
        else handleMove("up");
      }
    }

    touchStartRef.current = null;
  };

  // Initialize
  useEffect(() => {
    initializeGame();
  }, []);

  const getTileColors = (val: number) => {
    switch (val) {
      case 2:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-foreground/10";
      case 4:
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-100 border border-foreground/10";
      case 8:
        return "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-100 border border-orange-500/20";
      case 16:
        return "bg-orange-200 dark:bg-orange-900/60 text-orange-900 dark:text-orange-50 border border-orange-500/30";
      case 32:
        return "bg-amber-400 text-black font-extrabold border border-amber-500";
      case 64:
        return "bg-amber-500 text-white font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.4)]";
      case 128:
        return "bg-yellow-400 text-black font-extrabold shadow-[0_0_10px_rgba(250,204,21,0.5)]";
      case 256:
        return "bg-yellow-500 text-white font-black shadow-[0_0_12px_rgba(234,179,8,0.6)]";
      case 512:
        return "bg-rose-500 text-white font-black shadow-[0_0_14px_rgba(244,63,94,0.6)]";
      case 1024:
        return "bg-purple-500 text-white font-black shadow-[0_0_16px_rgba(168,85,247,0.7)]";
      case 2048:
        return "bg-primary text-white font-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.8)]";
      default:
        return "bg-rose-600 text-white font-black"; // > 2048
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        {/* Scoreboard and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <div className="bg-background border border-foreground/10 px-4 py-2 rounded-lg text-center min-w-[70px]">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Skor</span>
              <span className="text-base font-bold font-mono text-primary">{score}</span>
            </div>
            <div className="bg-background border border-foreground/10 px-4 py-2 rounded-lg text-center min-w-[70px]">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Terbaik</span>
              <span className="text-base font-bold font-mono text-primary">{bestScore}</span>
            </div>
          </div>

          <button
            onClick={initializeGame}
            className="h-10 px-5 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
          >
            🎮 Game Baru
          </button>
        </div>

        {/* 2048 Sliding Grid Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-[320px] mx-auto aspect-square bg-background border border-foreground/15 rounded-xl p-3 grid grid-cols-4 grid-rows-4 gap-2.5 shadow-inner touch-none"
        >
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-full h-full rounded-lg flex items-center justify-center font-mono transition-all duration-100 font-bold select-none ${
                  cell === 0
                    ? "bg-foreground/5"
                    : `${getTileColors(cell)} text-base sm:text-lg animate-scaleIn`
                }`}
              >
                {cell !== 0 ? cell : ""}
              </div>
            ))
          )}

          {/* Game Over modal overlay inside Grid */}
          {gameOver && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-center p-4 space-y-3 animate-fadeIn">
              <span className="text-4xl block">💀</span>
              <h4 className="text-lg font-black uppercase tracking-wider">Game Over!</h4>
              <p className="text-xs opacity-60">Tidak ada lagi langkah tersisa.</p>
              <button
                onClick={initializeGame}
                className="h-9 px-5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] font-mono text-foreground/45 max-w-[280px] mx-auto leading-relaxed">
          Gunakan tombol <strong>WASD</strong>, tombol <strong>Arah Panah</strong> pada Keyboard, atau geser layar (swipe) di HP untuk menggeser ubin.
        </div>
      </div>
    </div>
  );
}
