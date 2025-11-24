const StatCard = ({ title, value, bgColor }) => (
  <div
    className={`bg-${bgColor} text-white p-4 shadow-md w-full text-center border border-gray-700`}
    style={{ borderRadius: "0px" }} // Square edges
  >
    <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-200">{title}</h3>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

export default StatCard;
