import React, { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#FBBF24", "#10B981", "#EF4444"]; // Yellow, Green, Red

const CustomTooltip = () => null; // ❌ Disables hover tooltip completely

const ComplaintChart = ({ complaints }) => {
    const [isLineChart, setIsLineChart] = useState(false);

    const data = [
        {
            name: "Pending",
            value: complaints.filter((c) => c.status === "Pending").length,
        },
        {
            name: "Resolved",
            value: complaints.filter((c) => c.status === "Resolved").length,
        },
        {
            name: "Withdrawn",
            value: complaints.filter((c) => c.status === "Withdrawn").length,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 shadow-md p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                    📊 Complaint Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <CustomTooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar/Line Chart with Toggle */}
            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 shadow-md p-6 relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                        📈 Bar Chart View
                    </h3>
                    <button
                        onClick={() => setIsLineChart(!isLineChart)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isLineChart
                                ? "bg-blue-700 text-white hover:bg-blue-800"
                                : "bg-gray-700 text-white hover:bg-gray-800"
                            }`}
                        title="Click to switch chart type"
                    >
                        {isLineChart ? (
                            <>
                                📊 <span>Bar Chart</span>
                            </>
                        ) : (
                            <>
                                📈 <span>Line Chart</span>
                            </>
                        )}
                    </button>

                </div>

                <ResponsiveContainer width="100%" height={250}>
                    {isLineChart ? (
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                            <XAxis dataKey="name" stroke="#cbd5e0" />
                            <YAxis stroke="#cbd5e0" allowDecimals={false} />
                            <CustomTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} />
                        </LineChart>
                    ) : (
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                            <XAxis dataKey="name" stroke="#cbd5e0" />
                            <YAxis stroke="#cbd5e0" allowDecimals={false} />
                            <CustomTooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ComplaintChart;
