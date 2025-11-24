import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RaiseComplaintTab = ({ setActiveTab, fetchData }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImagePreview = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-indigo-500/40 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto backdrop-blur-lg">
      <h3 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
        📝 Raise a New Complaint
      </h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const shid = localStorage.getItem("shid");
          const type = e.target.type.value;
          const description = e.target.description.value;
          const imageFile = e.target.proof_image.files[0];

          if (!type || !description || !imageFile) {
            alert("All fields including image are required.");
            return;
          }

          const toBase64 = (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result.split(",")[1]);
              reader.onerror = (error) => reject(error);
            });

          try {
            const proof_image = await toBase64(imageFile);
            const res = await fetch(`${API_BASE_URL}/complaint/add`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shid, type, description, proof_image }),
            });
            const result = await res.json();
            alert(result.message || "Complaint submitted.");
            e.target.reset();
            setPreviewImage(null);
            setActiveTab("complaints");
            fetchData();
          } catch (err) {
            console.error(err);
            alert("Error submitting complaint.");
          }
        }}
        className="space-y-5"
      >
        {/* Complaint Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Complaint Type</label>
          <input
            name="type"
            type="text"
            className="mt-2 p-3 w-full border border-slate-600 rounded-lg bg-slate-900/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="e.g., Water Leakage"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            className="mt-2 p-3 w-full border border-slate-600 rounded-lg bg-slate-900/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Describe the issue..."
            rows={4}
            required
          ></textarea>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Upload Proof Image
          </label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors">
            <input
              name="proof_image"
              type="file"
              accept="image/*"
              className="hidden"
              id="proof_image"
              onChange={(e) => handleImagePreview(e.target.files[0])}
              required
            />
            <label htmlFor="proof_image" className="cursor-pointer">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mx-auto max-h-40 rounded-lg shadow-md"
                />
              ) : (
                <div className="text-slate-400">
                  📂 Drag & Drop or Click to Upload
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md text-lg font-semibold transform hover:scale-[1.02] transition-all duration-300"
        >
          🚀 Submit Complaint
        </button>
      </form>
    </div>
  );
};

export default RaiseComplaintTab;
