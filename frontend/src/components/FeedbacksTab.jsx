import React, { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const FeedbackForm = () => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/current-user`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.status === "logged_in") {
          setLoggedIn(true);
          setCurrentUser(data.user);
        } else {
          setLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedIn) {
      alert("You must be logged in to submit feedback.");
      return;
    }

    setLoading(true);

    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important to send session cookie
        body: JSON.stringify({ title, description, rating }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Feedback submitted successfully.");
        setTitle("");
        setDescription("");
        setRating(5);
      } else {
        alert(data.detail || data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Error submitting feedback.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-slate-800/90 border border-blue-500/40 p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h3 className="text-2xl font-semibold text-blue-400 mb-4">
        Submit Feedback
      </h3>

      {loggedIn ? (
        <p className="text-green-400 mb-4">Logged in as: {currentUser}</p>
      ) : (
        <p className="text-red-400 mb-4">
          You must be logged in to submit feedback.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Title</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border border-slate-600 rounded bg-slate-900 text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short feedback title"
            disabled={loading || !loggedIn}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            className="mt-1 p-2 w-full border border-slate-600 rounded bg-slate-900 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Write your feedback here..."
            disabled={loading || !loggedIn}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Rating</label>
          <select
            className="mt-1 p-2 w-full border border-slate-600 rounded bg-slate-900 text-white"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            disabled={loading || !loggedIn}
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !loggedIn}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow ${
            loading || !loggedIn ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
