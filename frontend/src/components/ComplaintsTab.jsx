import React, { useState } from "react";
import { FaCheckCircle, FaClock, FaTimesCircle, FaImage } from "react-icons/fa";

const ComplaintsTab = ({ complaints, handleWithdraw }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="bg-slate-800/90 border border-indigo-500/40 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-indigo-400 mb-6">
        Recent Complaints
      </h3>

      {/* Complaints Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {complaints.recent.map((comp, i) => (
          <div
            key={i}
            className="bg-slate-900/70 border border-slate-700 rounded-lg p-5 shadow-md hover:shadow-lg hover:border-indigo-500/60 transition-all duration-300"
          >
            {/* Complaint Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-indigo-300 font-medium">{comp.type}</span>
              {comp.status === "Resolved" ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <FaCheckCircle /> Resolved
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                  <FaClock /> Pending
                </span>
              )}
            </div>

            {/* Complaint Description */}
            <p className="text-slate-300 text-sm mb-3">
              {comp.description.length > 80
                ? comp.description.slice(0, 80) + "..."
                : comp.description}
            </p>

            {/* Date */}
            <p className="text-xs text-slate-500 mb-4">
              📅 {new Date(comp.created_at).toLocaleString()}
            </p>

            {/* Proof Image */}
            {comp.proof_image && (
              <button
                onClick={() => setSelectedImage(comp.proof_image)}
                className="flex items-center gap-2 text-indigo-400 text-sm hover:underline"
              >
                <FaImage /> View Proof
              </button>
            )}

            {/* Withdraw Button */}
            {comp.status === "Pending" && (comp.withdraw_count ?? 0) < 3 && (
              <button
                onClick={() => handleWithdraw(comp.cid)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow w-full"
              >
                Withdraw
              </button>
            )}

            {comp.withdraw_count >= 3 && (
              <p className="text-red-500 text-sm mt-3">
                ❌ Withdraw limit reached
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Proof"
            className="max-h-[80%] max-w-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintsTab;
