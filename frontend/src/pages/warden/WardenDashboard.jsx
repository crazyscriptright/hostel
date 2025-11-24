import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import ProfileCard from "./ProfileCard";
import ComplaintTable from "./ComplaintTable";
import ProofModal from "./ProofModal";
import ComplaintChart from "./ComplaintChart";
import { wardenAxios, clearWardenTokens } from "../../utils/axiosConfig";

const WardenDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [warden, setWarden] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [proofImage, setProofImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await wardenAxios.get("/auth/warden/profile");
        setWarden(profileRes.data.warden);

        const complaintsRes = await wardenAxios.get("/warden/complaints");
        setComplaints(complaintsRes.data.complaints);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const logout = async () => {
    try {
      // Determine if we're in production
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      // Use nuclear logout for production, regular logout for development
      const logoutEndpoint = isProduction 
        ? '/auth/warden/nuclear-logout'
        : '/auth/warden/logout';
      
      await wardenAxios.post(logoutEndpoint, {}, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    clearWardenTokens();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = `/warden/login?_t=${Date.now()}`;
  };

  const handleProofImage = async (cid) => {
    try {
      const res = await wardenAxios.get(`/warden/complaint/${cid}/proof`);
      const data = res.data;
      if (data.proofImage) {
        setProofImage(`data:image/png;base64,${data.proofImage}`);
        setShowModal(true);
      } else {
        alert("No proof image available");
      }
    } catch (err) {
      console.error("Error fetching proof image:", err);
      alert("Failed to load proof image");
    }
  };

  const handleStatusChange = async (cid, currentStatus, newStatus) => {
    if (currentStatus === "Withdrawn") {
      alert("⚠️ This complaint is Withdrawn and cannot be updated.");
      return;
    }
    if (currentStatus === newStatus) return;

    const confirmed = window.confirm(`Change status from '${currentStatus}' to '${newStatus}'?`);
    if (!confirmed) return;

    try {
      const res = await wardenAxios.patch(`/warden/complaint/${cid}/status`, {
        status: newStatus
      });

      if (res.status !== 200) {
        alert("❌ Failed to update status");
        return;
      }

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.cid === cid ? { ...complaint, status: newStatus } : complaint
        )
      );
      
      alert("✅ Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update status");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading...
      </div>
    );
  if (!warden)
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        ⚠ Not logged in.
      </div>
    );

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const withdrawn = complaints.filter((c) => c.status === "Withdrawn").length;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 to-black text-gray-100 relative">
      <Header
        warden={warden}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logout={logout}
      />
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />

      <main className="flex-1 pt-20 px-6 lg:ml-64 space-y-8">
        {activeTab === "dashboard" && (
          <>
            <h2 className="text-3xl font-bold">
              Welcome, <span className="text-blue-400">{warden.name}</span>
            </h2>

            {/* ✅ Updated 4 Square Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatCard title="Total" value={total} bgColor="blue-600" />
              <StatCard title="Pending" value={pending} bgColor="yellow-500" />
              <StatCard title="Resolved" value={resolved} bgColor="green-600" />
              <StatCard title="Withdrawn" value={withdrawn} bgColor="red-600" />
            </div>

            <div className="mt-10">
              <ComplaintChart complaints={complaints} />
            </div>
          </>
        )}

        {activeTab === "profile" && <ProfileCard warden={warden} />}

        {activeTab === "complaints" && (
          <div className="backdrop-blur-md bg-gray-900/50 border border-gray-800 rounded-xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">
              All Complaints
            </h3>
            {complaints.length === 0 ? (
              <p className="text-gray-400 text-center py-6">
                ✅ No complaints found for your hostel.
              </p>
            ) : (
              <ComplaintTable
                complaints={complaints}
                handleStatusChange={handleStatusChange}
                handleViewProof={handleProofImage}
              />
            )}
          </div>
        )}
      </main>

      {showModal && (
        <ProofModal proofImage={proofImage} setShowModal={setShowModal} />
      )}
    </div>
  );
};

export default WardenDashboard;
