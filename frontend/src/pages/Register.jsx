import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { userAxios } from "../utils/axiosConfig";

const UserAuth = () => {
  const [mode, setMode] = useState("login"); // 'login', 'register', 'forgot'
  const [shid, setShid] = useState("");
  const [pswd, setPswd] = useState("");
  const [confirmPswd, setConfirmPswd] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetFields = () => {
    setShid("");
    setPswd("");
    setConfirmPswd("");
    setMessage("");
    setLoading(false);
  };

  const handleModeChange = (newMode) => {
    resetFields();
    setMode(newMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !shid ||
      (mode !== "forgot" && !pswd) ||
      (mode === "register" && !confirmPswd)
    ) {
      setMessage("❌ All required fields must be filled.");
      return;
    }

    if (mode === "register" && pswd !== confirmPswd) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    if (mode === "forgot") {
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shid }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("📨 Reset link sent to your email.");
        } else {
          setMessage(data.detail || "❌ Failed to send reset link.");
        }
      } catch (error) {
        setMessage("❌ Server error while sending reset link.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (mode === "login") {
        // Use userAxios for JWT authentication
        const response = await userAxios.post("/auth/user/login", {
          shid,
          pswd
        });

        const data = response.data;

        if (data.status === "success") {
          localStorage.setItem("shid", shid);
          localStorage.setItem("user_data", JSON.stringify(data.user));
          setMessage("✅ Login successful!");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else if (data.status === "invalid") {
          setMessage("❌ Invalid SHID or password.");
        } else {
          setMessage(data.message || "❌ Login failed.");
        }
      } else {
        // For registration, use regular fetch (non-JWT endpoint)
        const url = `${import.meta.env.VITE_API_BASE_URL}/userauth`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shid, pswd }),
          credentials: "include"
        });

        const data = await response.json();

        if (data.status === "not_found") {
          setMessage("❌ SHID not found.");
        } else if (data.status === "exists") {
          setMessage("⚠️ SHID already registered.");
        } else if (data.status === "success") {
          setMessage("✅ Registered successfully!");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setMessage("❌ Registration failed.");
        }
      }
    } catch (error) {
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg"
      >
        {/* Left Content Panel */}
        <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 text-white p-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {mode === "login" && (
                <>
                  <h2 className="text-4xl font-extrabold drop-shadow-lg">
                    Welcome to <span className="text-yellow-300">Hostel</span>
                  </h2>
                  <p className="text-lg text-slate-100">
                    Login to access your personal hostel dashboard and services.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-200">
                    <li>📢 View hostel announcements</li>
                    <li>📝 Raise and track complaints</li>
                    <li>🤝 Connect with wardens instantly</li>
                  </ul>
                </>
              )}
              {mode === "register" && (
                <>
                  <h2 className="text-4xl font-bold mb-4">Create Your Account</h2>
                  <p className="text-lg text-slate-100">
                    Register now and experience a seamless hostel experience.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-200">
                    <li>🔒 Secure complaint system</li>
                    <li>📊 Transparent tracking</li>
                    <li>🎯 Student-friendly dashboard</li>
                  </ul>
                </>
              )}
              {mode === "forgot" && (
                <>
                  <h2 className="text-4xl font-bold">Forgot Password?</h2>
                  <p className="text-lg text-slate-100">
                    Recover your login access easily by verifying your SHID.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Form Panel */}
        <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-3xl font-bold mb-6 text-gray-800 text-center capitalize">
                {mode === "login"
                  ? "Student Login"
                  : mode === "register"
                  ? "Student Registration"
                  : "Recover Password"}
              </h3>

              {/* Message box */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 px-4 py-3 rounded-md text-center font-medium ${
                    message.includes("✅")
                      ? "bg-green-100 text-green-700"
                      : message.includes("⚠️")
                      ? "bg-yellow-100 text-yellow-700"
                      : message.includes("📨")
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Student SHID
                  </label>
                  <input
                    type="text"
                    value={shid}
                    onChange={(e) => setShid(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. STU1ID001"
                  />
                </div>

                {mode !== "forgot" && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={pswd}
                      onChange={(e) => setPswd(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter password"
                    />
                  </div>
                )}

                {mode === "register" && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPswd}
                      onChange={(e) => setConfirmPswd(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Confirm password"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-2 rounded-lg transition duration-300 shadow-md ${
                    mode === "forgot"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : mode === "login" ? (
                    "Login"
                  ) : mode === "register" ? (
                    "Register"
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-sm text-center text-gray-600 space-y-2">
                {mode === "login" && (
                  <>
                    <p>
                      Don’t have an account?{" "}
                      <button
                        onClick={() => handleModeChange("register")}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Register
                      </button>
                    </p>
                    <button
                      onClick={() => handleModeChange("forgot")}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                    <div className="pt-4 flex justify-between text-sm text-gray-600">
                      <a
                        href="/admin/login"
                        className="text-indigo-600 hover:underline"
                      >
                        Admin Login
                      </a>
                      <a
                        href="/warden/login"
                        className="text-indigo-600 hover:underline"
                      >
                        Warden Login
                      </a>
                    </div>
                  </>
                )}
                {mode === "register" && (
                  <p>
                    Already registered?{" "}
                    <button
                      onClick={() => handleModeChange("login")}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Login
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <p>
                    Back to{" "}
                    <button
                      onClick={() => handleModeChange("login")}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default UserAuth;
