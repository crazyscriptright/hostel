import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { wardenAxios } from "../../utils/axiosConfig";

export default function WardenLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ mail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); // clear errors when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await wardenAxios.post("/auth/warden/login", formData);
      const data = response.data;

      if (data.status === "success" && data.warden) {
        // ✅ Save warden info in localStorage
        localStorage.setItem("warden", JSON.stringify(data.warden));

        // ✅ Redirect to warden dashboard
        navigate("/warden/dashboard");
      } else {
        setErrorMsg("❌ Login failed! Invalid response format.");
      }
    } catch (err) {
      console.error("❌ Warden login error:", err);

      if (err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else if (err.response?.status === 401) {
        setErrorMsg(
          "❌ Invalid credentials! Please check your email and password.",
        );
      } else if (err.message.includes("CORS")) {
        setErrorMsg(
          "❌ Network error! Please check your connection and try again.",
        );
      } else {
        setErrorMsg("⚠️ Something went wrong! Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-200">
      <div className="bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-md border border-gray-700">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
          🏢 Warden Login
        </h2>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-900/40 text-red-300 text-center p-2 rounded mb-4">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              placeholder="warden@example.com"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "⏳ Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          👉 Not registered? Contact admin.
        </div>
      </div>
    </div>
  );
}
