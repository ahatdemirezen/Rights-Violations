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
    // Archive değeri true olan davaları filtrele
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

  if (loading) return <p className="text-center text-[#123D3D]">Yükleniyor...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen py-10">
      <div className="max-w-screen-lg w-full p-6 bg-[#fdf8f0] rounded-lg shadow-lg">
        {/* Sayfa Başlığı ve Arama Alanı */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#123D3D]">Arşivlenmiş Davalar</h1>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Av, Mahkeme vs. Ara..."
            className="w-1/3"
          />
        </div>

        {/* Dava Tablosu */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[#D5C4A1] bg-[#f8f1e8] rounded-lg shadow-md">
            {/* Tablo Başlığı */}
            <thead>
              <tr className="bg-[#123D3D] text-[#F8F1E8]">
                <th className="px-4 py-3 border-b">Başvuran Adı</th>
                <th className="px-4 py-3 border-b">Avukat</th>
                <th className="px-4 py-3 border-b">Başvuru No</th>
                <th className="px-4 py-3 border-b">Mahkeme</th>
                <th className="px-4 py-3 border-b">Esas No</th>
                <th className="px-4 py-3 border-b">Dava Tarihi</th>
                <th className="px-4 py-3 border-b">İşlemler</th>
              </tr>
            </thead>

            {/* Tablo Gövdesi */}
            <tbody>
              {filteredLawsuits.map((lawsuit) => (
                <tr
                  key={lawsuit._id}
                  className="hover:bg-[#D5C4A1] text-[#123D3D] transition"
                >
                  <td className="px-4 py-3 border-b">
                    {lawsuit.applicantName || "Başvuran Belirtilmemiş"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {lawsuit.lawyer || "Avukat Belirtilmemiş"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {lawsuit.applicationNumber || "Başvuru No Yok"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {lawsuit.court || "Mahkeme Belirtilmemiş"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {lawsuit.caseNumber || "Esas No Belirtilmemiş"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {lawsuit.lawsuitDate
                      ? new Date(lawsuit.lawsuitDate).toLocaleDateString()
                      : "Dava Tarihi Belirtilmemiş"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/lawsuit/${lawsuit._id}`}
                        className="bg-[#123D3D] text-[#F8F1E8] px-3 py-1 rounded shadow hover:bg-[#D4AF37] hover:text-[#123D3D] transition"
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

        {/* Alt Bilgi */}
        {filteredLawsuits.length === 0 && (
          <p className="text-center text-[#123D3D] mt-4">Arşivlenmiş dava bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default LawsuitList;
