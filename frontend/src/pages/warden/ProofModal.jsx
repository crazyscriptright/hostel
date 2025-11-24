const ProofModal = ({ proofImage, setShowModal }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-4 rounded shadow-lg max-w-xl">
        <h2 className="text-white text-lg mb-3">Complaint Proof</h2>
        {proofImage ? (
          <img src={proofImage} alt="Proof" className="rounded max-h-[400px]" />
        ) : (
          <p className="text-gray-400">No proof image available</p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProofModal;
