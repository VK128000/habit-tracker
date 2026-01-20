import React, { useMemo } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toYMD(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export default function Calendar({ year, month, cleanSet, relapseSet, onClickDay }) {
  const days = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startDay = first.getDay();
    const totalDays = new Date(year, month, 0).getDate();

    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="text-lg font-bold mb-3">
        Calendar <span className="text-gray-400 text-sm">({year}-{String(month).padStart(2, "0")})</span>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-gray-400">
        {week.map((w) => (
          <div key={w} className="text-center">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          if (!d) return <div key={idx} className="h-12" />;

          const date = toYMD(year, month, d);
          const isClean = cleanSet.has(date);
          const isRelapse = relapseSet.has(date);

          let cls =
            "h-12 rounded-xl flex items-center justify-center cursor-pointer border border-gray-800 hover:border-gray-500 transition text-sm";

          if (isClean) cls += " bg-green-700/80";
          if (isRelapse) cls += " bg-red-700/80";

          return (
            <div
              key={idx}
              className={cls}
              onClick={() => onClickDay(date)}
              title={isClean ? "Clean Day" : isRelapse ? "Relapse" : "Empty"}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-300 flex gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-700/80 inline-block rounded" />
          Clean
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-700/80 inline-block rounded" />
          Relapse
        </div>
      </div>
    </div>
  );
}
