import { FaEye } from "react-icons/fa";

const ComplaintTable = ({ complaints, handleStatusChange, handleViewProof }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-lg bg-gray-900/40">
      <table className="w-full text-left border-collapse">
        {/* ✅ Table Header */}
        <thead>
          <tr className="bg-gray-900/80">
            <Th>#</Th>
            <Th>Student</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th>Description</Th>
            <Th>Proof</Th>
            <Th>Date</Th>
          </tr>
        </thead>

        {/* ✅ Table Body */}
        <tbody>
          {complaints.map((c, index) => (
            <tr
              key={c.cid || index}
              className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200"
            >
              <Td>{index + 1}</Td>
              <Td>{c.studentName}</Td>
              <Td>{c.type || "—"}</Td>

              {/* ✅ Status Column with Badges & Dropdown */}
              <Td>
                {c.status === "Withdrawn" ? (
                  <StatusBadge status="Withdrawn" />
                ) : (
                  <select
                    value={c.status}
                    onChange={(e) =>
                      handleStatusChange(c.cid, c.status, e.target.value)
                    }
                    className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg border border-gray-700 hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                )}
              </Td>

              <Td className="max-w-xs truncate">{c.description || "—"}</Td>

              {/* ✅ Proof Button */}
              <Td>
                {c.proofImage ? (
                  <button
                    onClick={() => handleViewProof(c.cid)}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
                  >
                    <FaEye /> View
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">No Proof</span>
                )}
              </Td>

              {/* ✅ Date */}
              <Td className="text-gray-400">
                {new Date(c.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ✅ Reusable Table Cell Components for Cleaner Look */
const Th = ({ children }) => (
  <th className="p-3 text-gray-300 font-semibold uppercase tracking-wide text-sm">
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`p-3 text-gray-200 ${className}`}>{children}</td>
);

/* ✅ Status Badge with Colors */
const StatusBadge = ({ status }) => {
  let badgeColor =
    status === "Resolved"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : status === "Pending"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  return (
    <span
      className={`px-3 py-1 text-sm rounded-full border ${badgeColor}`}
    >
      {status}
    </span>
  );
};

export default ComplaintTable;
