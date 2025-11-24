import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line
} from "recharts";

const COLORS = ["#3b82f6", "#facc15", "#34d399", "#f87171"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-200 p-2 rounded shadow-lg border border-slate-700">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardTab = ({ student, complaints }) => {
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ month: "All", type: "All" });

  useEffect(() => {
    const shid = localStorage.getItem("shid");
    if (shid) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/student_analytics/${shid}`)
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(err => console.error("Analytics fetch error:", err));
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Greeting */}
      <h2 className="text-3xl font-bold text-indigo-400 mb-6">
        Welcome, {student?.name || "Student"}
      </h2>

      {/* Complaint summary cards */}
      {complaints && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/90 border border-indigo-500/40 p-6 rounded-lg shadow-md">
            <p className="text-slate-300">Total Complaints</p>
            <p className="text-2xl font-bold text-indigo-400">{complaints.total}</p>
          </div>
          <div className="bg-yellow-900/50 border border-yellow-500/40 p-6 rounded-lg shadow-md">
            <p className="text-yellow-300">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{complaints.pending}</p>
          </div>
          <div className="bg-green-900/50 border border-green-500/40 p-6 rounded-lg shadow-md">
            <p className="text-green-300">Resolved</p>
            <p className="text-2xl font-bold text-green-400">{complaints.resolved}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {analytics && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="bg-slate-800 text-slate-200 px-4 py-2 rounded"
            value={filters.month}
            onChange={e => handleFilterChange("month", e.target.value)}
          >
            <option value="All">All Months</option>
            {analytics.monthly_status.map((m, i) => (
              <option key={i} value={m.month}>{m.month}</option>
            ))}
          </select>
          <select
            className="bg-slate-800 text-slate-200 px-4 py-2 rounded"
            value={filters.type}
            onChange={e => handleFilterChange("type", e.target.value)}
          >
            <option value="All">All Types</option>
            {analytics.complaint_types.map((t, i) => (
              <option key={i} value={t.type}>{t.type}</option>
            ))}
          </select>
        </div>
      )}

      {/* Analytics charts */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Complaint Status Pie */}
          <div className="bg-slate-800/90 p-4 rounded-lg shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4">Complaint Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.complaint_status).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  label
                  isAnimationActive={true}
                >
                  {Object.entries(analytics.complaint_status).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Complaint Types Bar */}
          <div className="bg-slate-800/90 p-4 rounded-lg shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4">Complaint Types</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.complaint_types}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="type" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <ReTooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints Over Time */}
          <div className="bg-slate-800/90 p-4 rounded-lg shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4">Complaints Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.complaints_over_time}>
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <ReTooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Line type="monotone" dataKey="count" stroke="url(#colorLine)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Status Comparison */}
          <div className="bg-slate-800/90 p-4 rounded-lg shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4">Monthly Resolved vs Pending</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.monthly_status}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <ReTooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Legend />
                <Bar dataKey="Resolved" fill="#34d399" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Pending" fill="#facc15" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardTab;
