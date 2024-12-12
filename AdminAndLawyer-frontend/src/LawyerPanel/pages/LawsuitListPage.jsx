import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLawsuitListForLawyerStore from "../../stores/LawsuitListForLawyerStore";

const LawsuitList = () => {
  const { lawsuits, loading, error, fetchLawsuits } = useLawsuitListForLawyerStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(""); // Arama için state
  const [filteredLawsuits, setFilteredLawsuits] = useState([]);

  useEffect(() => {
    // Davaları component mount edildiğinde getir
    fetchLawsuits();
  }, [fetchLawsuits]);

  useEffect(() => {
    // Filtreleme
    setFilteredLawsuits(
      lawsuits.filter((lawsuit) =>
          lawsuit.applicationNumber?.toString().includes(searchQuery)
    )
    );
  }, [searchQuery, lawsuits]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-r from-[#F3F4ED] via-[#E8E9E3] to-[#F3F4ED] rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-[#2C4E4A] mb-8">
        Davalar ({filteredLawsuits.length})
      </h1>

      {/* Arama Çubuğu */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Başvuru No'suna Göre Ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-[#6D8B74] rounded focus:outline-none focus:ring-2 focus:ring-[#6D8B74]"
        />
      </div>

      {/* Yüklenme veya hata durumu */}
      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredLawsuits.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden">
          <thead className="bg-[#6D8B74] text-white">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sıra</th>
              <th className="border border-gray-300 px-4 py-2">Başvuru No</th>
              <th className="border border-gray-300 px-4 py-2">Başvuru Sahibi</th>
              <th className="border border-gray-300 px-4 py-2">Esas Numarası</th>
              <th className="border border-gray-300 px-4 py-2">Mahkeme</th>
              <th className="border border-gray-300 px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredLawsuits.map((lawsuit, index) => (
              <tr key={lawsuit._id} className="hover:bg-[#E8E9E3]">
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {lawsuit.applicationNumber || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {lawsuit.applicantName || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {lawsuit.caseNumber || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {lawsuit.court || "Bilinmiyor"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => navigate(`/lawyer/lawsuitdetail/${lawsuit._id}`)}
                    className="bg-[#2C4E4A] text-white px-4 py-2 rounded hover:bg-[#6D8B74] transition"
                  >
                    Detay
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
