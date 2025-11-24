import { FaBars } from "react-icons/fa";

const Header = ({ warden, sidebarOpen, setSidebarOpen, logout }) => {
  return (
    <header
      className="fixed top-0 left-0 w-full h-16 z-50 
      flex justify-between items-center px-6 
      backdrop-blur-md bg-gray-900/60 border-b border-gray-800 shadow-md"
    >
      {/* Sidebar toggle for mobile */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-blue-400 text-2xl"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-white">🏠 Incharge Dashboard</h1>
      </div>

      {/* Right → Welcome + Logout */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-gray-300">
          Welcome, <span className="text-blue-400 font-semibold">{warden.name}</span>
        </span>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-md bg-red-600/80 hover:bg-red-500/90 transition text-white text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
