import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLawsuitListForLawyerStore from "../../stores/LawsuitListForLawyerStore";

const LawsuitList = () => {
  const { lawsuits, loading, error, fetchLawsuits } = useLawsuitListForLawyerStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Davaları component mount edildiğinde getir
    fetchLawsuits();
  }, [fetchLawsuits]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Davalar</h1>

      {/* Yüklenme veya hata durumu */}
      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : lawsuits.length > 0 ? (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Başvuru Sahibi</th>
              <th className="border border-gray-300 px-4 py-2">Esas Numarası</th>
              <th className="border border-gray-300 px-4 py-2">Mahkeme</th>
              <th className="border border-gray-300 px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {lawsuits.map((lawsuit, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {lawsuit.applicantName || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {lawsuit.caseNumber || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {lawsuit.court || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => navigate(`/lawyer/lawsuitdetail/${lawsuit._id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Detaylı Görüntüle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">Hiç dava bulunamadı.</p>
      )}
    </div>
  );
};

export default LawsuitList;
