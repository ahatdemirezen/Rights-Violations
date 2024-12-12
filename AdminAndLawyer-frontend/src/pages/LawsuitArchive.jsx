import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useLawsuitListPageStore from "../stores/LawsuitListPageStore";
import SearchBar from "../components/SearchBar"; // SearchBar bileşenini içe aktar

const LawsuitList = () => {
  const {
    lawsuits,
    fetchLawsuits,
    updateLawsuitArchiveStatus,
    loading,
    error,
  } = useLawsuitListPageStore();
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi durumu
  const [filteredLawsuits, setFilteredLawsuits] = useState([]); // Filtrelenmiş davalar

  useEffect(() => {
    fetchLawsuits(); // Sayfa yüklendiğinde davaları getir
  }, [fetchLawsuits]);

  useEffect(() => {
    // Archive değeri false olan davaları filtrele
    const activeLawsuits = lawsuits.filter((lawsuit) => lawsuit.archive === true);

    // Davaları arama terimine göre filtrele
    const filtered = activeLawsuits.filter((lawsuit) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lawsuit.applicantName?.toLowerCase().includes(searchLower) ||
        lawsuit.lawyer?.toLowerCase().includes(searchLower) ||
        lawsuit.court?.toLowerCase().includes(searchLower) ||
        lawsuit.caseNumber?.toLowerCase().includes(searchLower) ||
        (lawsuit.lawsuitDate &&
          new Date(lawsuit.lawsuitDate)
            .toLocaleDateString()
            .includes(searchLower))
      );
    });
    setFilteredLawsuits(filtered);
  }, [searchTerm, lawsuits]);

  const handleArchive = async (lawsuitId) => {
    try {
      await updateLawsuitArchiveStatus(lawsuitId, true); // Archive değerini true yap
      alert("Dava başarıyla arşive taşındı.");
    } catch (error) {
      alert("Dava arşive taşınırken bir hata oluştu.");
      console.error(error);
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Arşivlenmiş Davalar
      </h1>

      {/* SearchBar Bileşeni */}
      <div className="mb-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Av, Mahkeme vs. Ara..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow rounded">
          {/* Tablo Başlığı */}
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-4 py-2 border-b">Başvuran Adı</th>
              <th className="text-left px-4 py-2 border-b">Avukat</th>
              <th className="text-left px-4 py-2 border-b">Mahkeme</th>
              <th className="text-left px-4 py-2 border-b">Esas No</th>
              <th className="text-left px-4 py-2 border-b">Dava Oluşturma Tarihi</th>
              <th className="text-left px-4 py-2 border-b">İşlemler</th>
            </tr>
          </thead>
          {/* Tablo Gövdesi */}
          <tbody>
            {filteredLawsuits.map((lawsuit) => (
              <tr key={lawsuit._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  {lawsuit.applicantName || "Başvuran Belirtilmemiş"}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  {lawsuit.lawyer || "Avukat Belirtilmemiş"}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  {lawsuit.court || "Mahkeme Belirtilmemiş"}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  {lawsuit.caseNumber || "Esas No Belirtilmemiş"}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  {lawsuit.lawsuitDate
                    ? new Date(lawsuit.lawsuitDate).toLocaleDateString()
                    : "Dava Tarihi Belirtilmemiş"}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/lawsuit/${lawsuit._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Detaylı Görüntüle
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LawsuitList;
