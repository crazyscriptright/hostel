import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UserSideBar from "../components/UserSideBar";
import DashboardTab from "../components/DashboardTab";
import StudentInfoTab from "../components/StudentInfoTab";
import ComplaintsTab from "../components/ComplaintsTab";
import RaiseComplaintTab from "../components/RaiseComplaintTab";
import FeedbacksTab from "../components/FeedbacksTab";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchData = () => {
    const shid = localStorage.getItem("shid");
    if (!shid) return;

    fetch(`${API_BASE_URL}/dashboard/${shid}`)
      .then((res) => res.json())
      .then((resData) => {
        setData((prev) => ({ ...prev, student: resData.student }));
        localStorage.setItem("studentName", resData.student.name);
      })
      .catch(console.error);

    fetch(`${API_BASE_URL}/fetch_complaint/${shid}`)
      .then((res) => res.json())
      .then((resData) => {
        setData((prev) => ({
          ...prev,
          complaints: {
            total: resData.complaints.length,
            pending: resData.complaints.filter((c) => c.status === "Pending").length,
            resolved: resData.complaints.filter((c) => c.status === "Resolved").length,
            recent: resData.complaints,
          },
        }));
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (cid) => {
    if (!window.confirm("Are you sure you want to withdraw this complaint?")) return;

    const shid = localStorage.getItem("shid");
    if (!shid || !cid) {
      alert("Missing SHID or complaint ID.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/complaint/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shid, cid }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        fetchData();
      } else {
        alert("❌ Error: " + (result?.detail || result?.message));
      }
    } catch (err) {
      console.error("Withdraw error:", err);
      alert("Something went wrong while withdrawing the complaint.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  if (!data)
    return (
      <div className="p-8 text-center text-slate-300 bg-slate-900 min-h-screen">
        Loading...
      </div>
    );

  const { student, complaints } = data;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <UserSideBar active={activeTab} onSelect={setActiveTab} />

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="visible">
          {activeTab === "dashboard" && <DashboardTab student={student} complaints={complaints} />}
          {activeTab === "student" && <StudentInfoTab student={student} />}
          {activeTab === "complaints" && <ComplaintsTab complaints={complaints} handleWithdraw={handleWithdraw} />}
          {activeTab === "raise" && <RaiseComplaintTab setActiveTab={setActiveTab} fetchData={fetchData} />}
          {activeTab === "feedbacks" && <FeedbacksTab />}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
