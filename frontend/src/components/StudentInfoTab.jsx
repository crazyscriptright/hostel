import React, { useState } from "react";

const StudentInfoTab = ({ student, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...student });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("hostel.")) {
      setFormData({
        ...formData,
        hostel: { ...formData.hostel, [name.split(".")[1]]: value },
      });
    } else if (name.startsWith("warden.")) {
      setFormData({
        ...formData,
        warden: { ...formData.warden, [name.split(".")[1]]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl shadow-xl p-6 max-w-3xl mx-auto my-10">
      {/* Title */}
      <h2 className="text-3xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
        <span className="material-icons text-3xl">person</span> Student Profile
      </h2>

      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 w-20 h-20 bg-indigo-800 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {student.name.charAt(0)}
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
            {/* Name */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Name</span>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p className="text-lg font-medium">{student.name}</p>
              )}
            </div>

            {/* SHID */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Student Hostel ID</span>
              <p className="text-lg font-medium">{student.shid}</p>
            </div>

            {/* Email */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  name="mail"
                  value={formData.mail}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.mail}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Phone</span>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.phone}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Date of Birth</span>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.dob}</p>
              )}
            </div>

            {/* Hostel Name */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Hostel</span>
              {isEditing ? (
                <input
                  type="text"
                  name="hostel.name"
                  value={formData.hostel?.name || ""}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.hostel.name} – {student.hostel.location}</p>
              )}
            </div>

            {/* Room Number */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Room Number</span>
              {isEditing ? (
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number || ""}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.room_number || "Not Assigned"}</p>
              )}
            </div>

            {/* Warden Name */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Warden</span>
              {isEditing ? (
                <input
                  type="text"
                  name="warden.name"
                  value={formData.warden?.name || ""}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.warden.name}</p>
              )}
            </div>

            {/* Warden Phone */}
            <div>
              <span className="block text-indigo-200 text-sm mb-1">Warden Phone</span>
              {isEditing ? (
                <input
                  type="text"
                  name="warden.phone"
                  value={formData.warden?.phone || ""}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-black rounded"
                />
              ) : (
                <p>{student.warden.phone}</p>
              )}
            </div>
          </div>
        </div>

       
        </div>
      </div>
  );
};

export default StudentInfoTab;
