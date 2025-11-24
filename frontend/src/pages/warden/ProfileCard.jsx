import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaBuilding } from "react-icons/fa";

const ProfileCard = ({ warden }) => {
  return (
    <div className="relative w-full max-w-md mx-auto p-6 rounded-xl 
        border border-gray-800 bg-gradient-to-br from-gray-950 to-gray-900 
        shadow-lg hover:shadow-blue-500/20 transition-all duration-300">

      {/* ✅ Header with Icon */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <FaUserCircle className="text-blue-400 text-5xl" />
        <div>
          <h2 className="text-2xl font-bold text-white">{warden.name}</h2>
          <p className="text-blue-400 text-sm">Warden • Hostel {warden.hid}</p>
        </div>
      </div>

      {/* ✅ Details List */}
      <div className="mt-5 space-y-4">
        <DetailRow icon={<FaEnvelope />} label="Email" value={warden.mail} />
        <DetailRow icon={<FaPhoneAlt />} label="Phone" value={warden.phone} />
        <DetailRow icon={<FaBuilding />} label="Hostel ID" value={`#${warden.hid}`} />
      </div>

      {/* ✅ Footer Bar */}
      <div className="mt-5 border-t border-gray-800 pt-4 text-center text-gray-500 text-sm">
        Logged in as <span className="text-blue-400 font-medium">Warden</span>
      </div>
    </div>
  );
};

// ✅ Reusable Row Component
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition">
    <div className="text-blue-400 text-lg">{icon}</div>
    <div className="flex flex-col">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  </div>
);

export default ProfileCard;
