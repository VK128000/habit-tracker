import React, { useMemo, useRef } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function norm(s) {
  return String(s || "").slice(0, 10);
}

function toYMD(d) {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeekSunday(d) {
  const x = atMidnight(d);
  const day = x.getDay(); // 0=Sun
  x.setDate(x.getDate() - day);
  return x;
}

export default function Heatmap({ cleanDays = [], relapseDays = [] }) {
  const cleanSet = useMemo(() => new Set(cleanDays.map(norm)), [cleanDays]);
  const relapseSet = useMemo(() => new Set(relapseDays.map(norm)), [relapseDays]);

  const scRef = useRef(null);

  const weeks = useMemo(() => {
    const today = atMidnight(new Date());

    // last 365 days range
    const start = new Date(today);
    start.setDate(start.getDate() - 364);

    // align to Sunday
    const gridStart = startOfWeekSunday(start);

    const cols = [];
    let cur = new Date(gridStart);

    while (cur <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      cols.push(week);
    }

    return cols;
  }, []);

  // width per week column = 18px approx (3.5 * 4 = 14 + gap)
  const gridWidth = weeks.length * 18;

  const scrollToEnd = () => {
    if (!scRef.current) return;
    scRef.current.scrollLeft = scRef.current.scrollWidth;
  };

  const scrollToStart = () => {
    if (!scRef.current) return;
    scRef.current.scrollLeft = 0;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xl font-bold">Heatmap (Last 365 Days)</div>
          <div className="text-xs text-gray-400 mt-1">
            Debug → Clean: <b>{cleanSet.size}</b> | Relapse: <b>{relapseSet.size}</b>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-gray-400">
            Lime = Clean, Pink = Relapse
          </div>

          <div className="flex gap-2">
            <button
              onClick={scrollToStart}
              className="px-3 py-1 rounded-xl bg-gray-950 border border-gray-800 hover:bg-gray-800 text-xs"
            >
              Oldest
            </button>
            <button
              onClick={scrollToEnd}
              className="px-3 py-1 rounded-xl bg-gray-950 border border-gray-800 hover:bg-gray-800 text-xs"
            >
              Latest
            </button>
          </div>
        </div>
      </div>

      {/* SCROLLABLE AREA */}
      <div
        ref={scRef}
        className="overflow-x-auto overflow-y-hidden pb-2"
        style={{ scrollbarWidth: "thin" }}
      >
        <div
          className="flex gap-1"
          style={{
            width: `${gridWidth}px`
          }}
        >
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((d, j) => {
                const ymd = toYMD(d);

                const isClean = cleanSet.has(ymd);
                const isRelapse = relapseSet.has(ymd);

                let cls =
                  "w-3.5 h-3.5 rounded-sm border border-gray-800 bg-gray-950";

                if (isClean) cls = "w-3.5 h-3.5 rounded-sm bg-lime-400";
                if (isRelapse) cls = "w-3.5 h-3.5 rounded-sm bg-fuchsia-500";

                return (
                  <div
                    key={j}
                    className={cls}
                    title={`${ymd} ${isClean ? "Clean" : isRelapse ? "Relapse" : "Empty"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-950 border border-gray-800 inline-block rounded-sm" />
          Empty
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-lime-400 inline-block rounded-sm" />
          Clean
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-fuchsia-500 inline-block rounded-sm" />
          Relapse
        </div>
      </div>
    </div>
  );
}
