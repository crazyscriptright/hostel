/*  src/components/AdminSettings.jsx
    • "My Profile" – update own admin details (with confirm‑password)
    • "Add New Admin" – assign another admin (with confirm‑password)
    -------------------------------------------------------------- */
import React, { useEffect, useState } from "react";
import { adminAxios } from "../utils/axiosConfig";
import AdminSidebar from "../components/AdminSidebar";
import {
  FaUserCog,
  FaUserPlus,
  FaSave,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const AdminSettings = () => {
  /* sidebar open / margin sync */
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const contentML = isSidebarOpen ? "md:ml-64" : "md:ml-20";

  /* own profile */
  const [myForm, setMyForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  /* add‑admin form */
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  /* ui msgs */
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  /* fetch current profile on mount */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminAxios.get("/admin/profile");
        setMyForm({
          name: data.admin.name,
          email: data.admin.email,
          password: "",
          confirm: "",
        });
      } catch {
        setErr("Failed to load profile.");
      }
    })();
  }, []);

  /* form handlers */
  const handleMyChange = (e) =>
    setMyForm({ ...myForm, [e.target.name]: e.target.value });

  const handleNewChange = (e) =>
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });

  /* save own profile */
  const saveMyProfile = async () => {
    setMsg("");
    setErr("");

    if (myForm.password && myForm.password !== myForm.confirm) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      await adminAxios.put("/admin/admins/me", {
        name: myForm.name,
        email: myForm.email,
        password: myForm.password || undefined,
      });
      
      // Update local storage with new admin data for UI purposes
      const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
      adminData.name = myForm.name;
      adminData.email = myForm.email;
      localStorage.setItem("admin_data", JSON.stringify(adminData));
      
      setMsg("Profile updated ✔");
      setMyForm({ ...myForm, password: "", confirm: "" });
    } catch (e) {
      setErr(e.response?.data?.detail || "Failed to update profile.");
    }
  };

  /* create new admin */
  const addAdmin = async () => {
    setMsg("");
    setErr("");

    if (
      !newAdmin.name ||
      !newAdmin.email ||
      !newAdmin.password ||
      !newAdmin.confirm
    ) {
      setErr("All fields are required.");
      return;
    }
    if (newAdmin.password !== newAdmin.confirm) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      await adminAxios.post("/admin/admins", {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
      });
      setMsg("New admin added ✔");
      setNewAdmin({ name: "", email: "", password: "", confirm: "" });
    } catch (e) {
      setErr(e.response?.data?.detail || "Failed to add admin.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`flex-1 p-8 ${contentML} transition-all duration-300`}>
        <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>

        {/* Status Messages */}
        {msg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <FaCheckCircle className="mr-2" />
            {msg}
          </div>
        )}
        {err && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <FaTimesCircle className="mr-2" />
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserCog className="mr-2 text-blue-600" />
              My Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={myForm.name}
                  onChange={handleMyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={myForm.email}
                  onChange={handleMyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={myForm.password}
                  onChange={handleMyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={myForm.confirm}
                  onChange={handleMyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={saveMyProfile}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              >
                <FaSave className="mr-2" />
                Update Profile
              </button>
            </div>
          </div>

          {/* Add New Admin Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserPlus className="mr-2 text-green-600" />
              Add New Admin
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleNewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleNewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleNewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={newAdmin.confirm}
                  onChange={handleNewChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={addAdmin}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
              >
                <FaUserPlus className="mr-2" />
                Add Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
