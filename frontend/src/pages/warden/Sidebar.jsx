import { FaHome, FaUser, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, logout }) => {
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, key: "dashboard" },
    { name: "Profile", icon: <FaUser />, key: "profile" },
    { name: "Complaints", icon: <FaClipboardList />, key: "complaints" },
  ];

  return (
    <>
      {/* ✅ Dark overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 
          backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 
          border-r border-white/20 shadow-xl transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-5">
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-300
                  ${
                    activeTab === item.key
                      ? "bg-gradient-to-r from-blue-500/60 to-purple-500/60 text-white shadow-lg scale-[1.02]"
                      : "hover:bg-white/10 hover:scale-[1.02]"
                  }`}
              >
                {item.icon} <span className="font-medium">{item.name}</span>
              </button>
            ))}

            {/* ✅ Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 mt-10 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300"
            >
              <FaSignOutAlt /> Logout
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
