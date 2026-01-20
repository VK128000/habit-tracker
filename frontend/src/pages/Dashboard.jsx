import React, { useEffect, useMemo, useState } from "react";
import { api, API_BASE } from "../api";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
import Heatmap from "../components/Heatmap";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard({ setTok}) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // modal
  const [open, setOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState("");
  const [mode, setMode] = useState("clean"); // clean | relapse
  const [actress, setActress] = useState("");
  const [note, setNote] = useState("");

  const fetchAll = async () => {
  try {
    const [s, l] = await Promise.all([api.get("/stats"), api.get("/relapse")]);
    setStats(s.data);
    setLogs(l.data);
  } catch (e) {
    if (e?.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTok(""); // redirect to login
    } else {
      alert("Failed to load dashboard");
    }
  }
};


  useEffect(() => {
    fetchAll();
  }, []);

  const cleanSet = useMemo(() => {
    if (!stats?.cleanDays) return new Set();
    return new Set(stats.cleanDays);
  }, [stats]);

  const relapseSet = useMemo(() => {
    return new Set(logs.map((x) => x.date));
  }, [logs]);

  const monthlyLabels = useMemo(() => {
    if (!stats) return [];
    return Object.keys(stats.monthlyCount).sort();
  }, [stats]);

  const monthlyValues = useMemo(() => {
    if (!stats) return [];
    return monthlyLabels.map((m) => stats.monthlyCount[m]);
  }, [stats, monthlyLabels]);

  const chartData = {
    labels: monthlyLabels,
    datasets: [{ label: "Relapses per month", data: monthlyValues }]
  };

 const exportCSV = () => {
  const t = localStorage.getItem("token");
  window.open(`${API_BASE}/relapse/export/csv?token=${t}`, "_blank");
};


  const resetStreak = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await api.post("/auth/reset-streak", { date: today });
    fetchAll();
  };

  const resetStreakCustom = async () => {
    const d = prompt("Enter reset date (YYYY-MM-DD)");
    if (!d) return;
    await api.post("/auth/reset-streak", { date: d });
    fetchAll();
  };

  const delRelapse = async (id) => {
    await api.delete(`/relapse/${id}`);
    fetchAll();
  };

  const openDayModal = (d) => {
    setPickedDate(d);
    setMode("clean");
    setActress("");
    setNote("");
    setOpen(true);
  };

  const saveModal = async () => {
    if (!pickedDate) return;

    if (mode === "clean") {
      await api.post("/clean", { date: pickedDate });
      setOpen(false);
      return fetchAll();
    }

    if (mode === "relapse") {
      if (!actress) return alert("Actress name required");
      await api.post("/relapse", { date: pickedDate, actress, note });
      setOpen(false);
      return fetchAll();
    }
  };

  const removeClean = async () => {
    await api.delete(`/clean/${pickedDate}`);
    setOpen(false);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      {/* TOP CARDS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-gray-400 text-sm">Total Relapses</div>
            <div className="text-3xl font-bold">{stats.totalRelapses}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-gray-400 text-sm">Streak (days clean)</div>
            <div className="text-3xl font-bold">{stats.streak}</div>

            <div className="text-xs text-gray-400 mt-2 space-y-1">
              <div>Base Date: {stats.baseDate || "-"}</div>
              <div>Last Relapse: {stats.lastRelapseDate || "-"}</div>
              <div>Reset Date: {stats.streakResetDate || "-"}</div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-gray-400 text-sm">Export</div>
            <button
              onClick={exportCSV}
              className="mt-2 px-3 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 w-full font-semibold"
            >
              Download CSV
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-gray-400 text-sm">Reset Streak</div>

            <button
              onClick={resetStreak}
              className="mt-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 w-full font-semibold"
            >
              Reset Today
            </button>

            <button
              onClick={resetStreakCustom}
              className="mt-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 w-full font-semibold"
            >
              Reset Custom Date
            </button>
          </div>
        </div>
      )}

      {/* HEATMAP */}
      <Heatmap
    cleanDays={stats?.cleanDays || []}
    relapseDays={logs.map((x) => x.date)}
    />



      {/* CALENDAR + CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-bold">Calendar</div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-sm"
                onClick={() => {
                  let m = month - 1;
                  let y = year;
                  if (m === 0) {
                    m = 12;
                    y--;
                  }
                  setMonth(m);
                  setYear(y);
                }}
              >
                Prev
              </button>

              <button
                className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-sm"
                onClick={() => {
                  let m = month + 1;
                  let y = year;
                  if (m === 13) {
                    m = 1;
                    y++;
                  }
                  setMonth(m);
                  setYear(y);
                }}
              >
                Next
              </button>
            </div>
          </div>

          <Calendar
            year={year}
            month={month}
            cleanSet={cleanSet}
            relapseSet={relapseSet}
            onClickDay={openDayModal}
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xl font-bold mb-3">Monthly Chart</div>
          <Bar data={chartData} />
        </div>
      </div>

      {/* ACTRESS COUNT */}
      {stats && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-xl font-bold mb-3">Top Triggers (Actress Count)</div>

          <div className="overflow-auto">
            <table className="w-full border border-gray-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-950">
                  <th className="p-3 text-left text-sm text-gray-300">Actress</th>
                  <th className="p-3 text-left text-sm text-gray-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.actressCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, cnt]) => (
                    <tr key={name} className="border-t border-gray-800">
                      <td className="p-3">{name}</td>
                      <td className="p-3">{cnt}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELAPSE TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="text-xl font-bold mb-3">Relapse Logs</div>

        <div className="overflow-auto">
          <table className="w-full border border-gray-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-950">
                <th className="p-3 text-left text-sm text-gray-300">Date</th>
                <th className="p-3 text-left text-sm text-gray-300">Actress</th>
                <th className="p-3 text-left text-sm text-gray-300">Note</th>
                <th className="p-3 text-left text-sm text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className="border-t border-gray-800">
                  <td className="p-3">{l.date}</td>
                  <td className="p-3">{l.actress}</td>
                  <td className="p-3 text-gray-300">{l.note}</td>
                  <td className="p-3">
                    <button
                      onClick={() => delRelapse(l._id)}
                      className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-400" colSpan="4">
                    No relapse logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        open={open}
        title={`Update: ${pickedDate}`}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              className={`flex-1 p-3 rounded-xl border ${
                mode === "clean"
                  ? "bg-green-600 border-green-500"
                  : "bg-gray-900 border-gray-800"
              } font-semibold`}
              onClick={() => setMode("clean")}
            >
              Mark Clean
            </button>

            <button
              className={`flex-1 p-3 rounded-xl border ${
                mode === "relapse"
                  ? "bg-red-600 border-red-500"
                  : "bg-gray-900 border-gray-800"
              } font-semibold`}
              onClick={() => setMode("relapse")}
            >
              Add Relapse
            </button>
          </div>

          {mode === "relapse" && (
            <div className="space-y-3">
              <input
                className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 outline-none focus:border-gray-500"
                placeholder="Actress name"
                value={actress}
                onChange={(e) => setActress(e.target.value)}
              />

              <input
                className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 outline-none focus:border-gray-500"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={saveModal}
            className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Save
          </button>

          {cleanSet.has(pickedDate) && (
            <button
              onClick={removeClean}
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 font-semibold"
            >
              Remove Clean Mark
            </button>
          )}

          <div className="text-xs text-gray-400">
            Tip: Clean day and relapse cannot exist on same date.
          </div>
        </div>
      </Modal>
    </div>
  );
}
