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
    <section className="min-h-screen bg-gradient-primary flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-strong backdrop-blur-lg"
      >
        {/* Left Content Panel */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-500 text-white p-10 flex flex-col justify-center">
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
                  <h2 className="text-4xl font-display font-extrabold drop-shadow-lg">
                    Welcome to <span className="text-accent-300">HostelCare</span>
                  </h2>
                  <p className="text-lg text-primary-100">
                    Login to access your personal hostel dashboard and services.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-primary-200">
                    <li>📢 View hostel announcements</li>
                    <li>📝 Raise and track complaints</li>
                    <li>🤝 Connect with wardens instantly</li>
                  </ul>
                </>
              )}
              {mode === "register" && (
                <>
                  <h2 className="text-4xl font-display font-bold mb-4">Create Your Account</h2>
                  <p className="text-lg text-primary-100">
                    Register now and experience a seamless hostel experience.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-primary-200">
                    <li>🔒 Secure complaint system</li>
                    <li>📊 Transparent tracking</li>
                    <li>🎯 Student-friendly dashboard</li>
                  </ul>
                </>
              )}
              {mode === "forgot" && (
                <>
                  <h2 className="text-4xl font-display font-bold">Forgot Password?</h2>
                  <p className="text-lg text-primary-100">
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
              <h3 className="text-3xl font-display font-bold mb-6 text-secondary-800 text-center capitalize">
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
                  className={`mb-4 px-4 py-3 rounded-xl text-center font-medium ${
                    message.includes("✅")
                      ? "alert-success"
                      : message.includes("⚠️")
                      ? "alert-warning"
                      : message.includes("📨")
                      ? "alert-info"
                      : "alert-error"
                  }`}
                >
                  {message}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="form-label">
                    Student SHID
                  </label>
                  <input
                    type="text"
                    value={shid}
                    onChange={(e) => setShid(e.target.value)}
                    className="form-input"
                    placeholder="e.g. STU1ID001"
                  />
                </div>

                {mode !== "forgot" && (
                  <div>
                    <label className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      value={pswd}
                      onChange={(e) => setPswd(e.target.value)}
                      className="form-input"
                      placeholder="Enter password"
                    />
                  </div>
                )}

                {mode === "register" && (
                  <div>
                    <label className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPswd}
                      onChange={(e) => setConfirmPswd(e.target.value)}
                      className="form-input"
                      placeholder="Confirm password"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5 ${
                    mode === "forgot"
                      ? "bg-accent-500 hover:bg-accent-600 text-white"
                      : "btn-primary"
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === "login" && "🔑 Sign In"}
                      {mode === "register" && "✨ Create Account"}
                      {mode === "forgot" && "📧 Send Reset Link"}
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switch Links */}
              <div className="mt-6 flex justify-center space-x-4 text-sm">
                {mode !== "login" && (
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                )}
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => handleModeChange("forgot")}
                    className="text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Decorative Element */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2.25c-.414 0-.75.336-.75.75v.379l-7.864 3.497A.75.75 0 003 7.25v1.065a.75.75 0 001.5 0V8.065l7.5-3.333 7.5 3.333v10.045H4.5v-3.06a.75.75 0 00-1.5 0v3.81c0 .414.336.75.75.75H9v1.5H6.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H15v-1.5h5.25a.75.75 0 00.75-.75v-11a.75.75 0 00-.444-.685l-8.25-3.667V3c0-.414-.336-.75-.75-.75zm.75 17.25v1.5h-1.5v-1.5h1.5z" clipRule="evenodd" />
              <path d="M8 10.5a1.5 1.5 0 113 0v1.5H8v-1.5zM5.5 14.25v-2.25A3 3 0 0111 12v2.25H5.5zm9-3.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
            </svg>
          </div>
        </div>
      </motion.div>
    </section>
  );
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === "login" && "🔑 Sign In"}
                      {mode === "register" && "✨ Create Account"}
                      {mode === "forgot" && "📧 Send Reset Link"}
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switch Links */}
              <div className="mt-6 flex justify-center space-x-4 text-sm">
                {mode !== "login" && (
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                )}
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => handleModeChange("forgot")}
                    className="text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Decorative Element */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2.25c-.414 0-.75.336-.75.75v.379l-7.864 3.497A.75.75 0 003 7.25v1.065a.75.75 0 001.5 0V8.065l7.5-3.333 7.5 3.333v10.045H4.5v-3.06a.75.75 0 00-1.5 0v3.81c0 .414.336.75.75.75H9v1.5H6.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H15v-1.5h5.25a.75.75 0 00.75-.75v-11a.75.75 0 00-.444-.685l-8.25-3.667V3c0-.414-.336-.75-.75-.75zm.75 17.25v1.5h-1.5v-1.5h1.5z" clipRule="evenodd" />
              <path d="M8 10.5a1.5 1.5 0 113 0v1.5H8v-1.5zM5.5 14.25v-2.25A3 3 0 0111 12v2.25H5.5zm9-3.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
            </svg>
          </div>
        </div>
      </motion.div>
    </section>
  );" "}
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
