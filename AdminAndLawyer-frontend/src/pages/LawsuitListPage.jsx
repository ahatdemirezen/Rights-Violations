import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal"; // React Modal
import useLawsuitListPageStore from "../stores/LawsuitListPageStore";
import SearchBar from "../components/SearchBar"; // SearchBar bileşenini içe aktar

Modal.setAppElement("#root"); // Accessibility için gerekli (React Modal)

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
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal durumu
  const [selectedLawsuitId, setSelectedLawsuitId] = useState(null); // Seçilen dava ID'si

  useEffect(() => {
    fetchLawsuits(); // Sayfa yüklendiğinde davaları getir
  }, [fetchLawsuits]);

  useEffect(() => {
    // Archive değeri false olan davaları filtrele
    const activeLawsuits = lawsuits.filter((lawsuit) => lawsuit.archive === false);

    // Davaları arama terimine göre filtrele
    const filtered = activeLawsuits.filter((lawsuit) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lawsuit.applicantName?.toLowerCase().includes(searchLower) ||
        lawsuit.organizationName?.toLowerCase().includes(searchLower) ||
        lawsuit.applicationId?.lawyer?.name?.toLowerCase().includes(searchLower) || // Lawyer ismini filtrele
        lawsuit.applicationNumber?.toString().includes(searchLower) || // Başvuru numarasını filtrele
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

  const openModal = (lawsuitId) => {
    setSelectedLawsuitId(lawsuitId); // Seçilen dava ID'sini ayarla
    setModalIsOpen(true); // Modalı aç
  };

  const closeModal = () => {
    setModalIsOpen(false); // Modalı kapat
    setSelectedLawsuitId(null); // Seçilen dava ID'sini sıfırla
  };

  const handleArchive = async () => {
    try {
      if (selectedLawsuitId) {
        await updateLawsuitArchiveStatus(selectedLawsuitId, true); // Archive değerini true yap
        closeModal(); // Modalı kapat
      }
    } catch (error) {
      console.error("Dava arşive taşınırken bir hata oluştu.", error); // Hata log'u
    }
  };
  
  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen py-10">
      <div className="max-w-screen-lg w-full p-6 bg-[#fdf8f0] rounded-lg shadow-lg">
        {/* Sayfa Başlığı ve Arama Alanı */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#123D3D]">Dava Listesi</h1>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Av, Baş.No, Mah. vs. Ara..."
          />
        </div>

        {loading && (
          <p className="text-center text-[#123D3D]">Yükleniyor...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Dava Tablosu */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[#D5C4A1] bg-[#F8F1E8] rounded-lg shadow-md">
              <thead>
                <tr className="bg-[#123D3D] text-[#F8F1E8]">
                  <th className="px-4 py-2">Başvuru Sahibi</th>
                  <th className="px-4 py-2">Avukat</th>
                  <th className="px-4 py-2">Başvuru No</th>
                  <th className="px-4 py-2">Mahkeme</th>
                  <th className="px-4 py-2">Esas No</th>
                  <th className="px-4 py-2">Dava Tarihi</th>
                  <th className="px-4 py-2">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredLawsuits.map((lawsuit) => (
                  <tr
                    key={lawsuit._id}
                    className="hover:bg-[#D5C4A1] text-[#123D3D] transition"
                  >
                    <td className="px-4 py-2 border-b">
                      {lawsuit.applicantName || lawsuit.organizationName ||  "Başvuran Belirtilmemiş"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {lawsuit.applicationId?.lawyer?.name || "Avukat Belirtilmemiş"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {lawsuit.applicationNumber || "Başvuru Numarası Yok"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {lawsuit.court || "Mahkeme Belirtilmemiş"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {lawsuit.caseNumber || "Esas No Belirtilmemiş"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {lawsuit.lawsuitDate
                        ? new Date(lawsuit.lawsuitDate).toLocaleDateString()
                        : "Dava Tarihi Belirtilmemiş"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/lawsuit/${lawsuit._id}`}
                          className="bg-[#123D3D] text-[#F8F1E8] px-2 py-1 rounded shadow hover:bg-[#D4AF37] hover:text-[#123D3D] transition duration-200 text-sm"
                        >
                          Detay
                        </Link>
                        <button
                          onClick={() => openModal(lawsuit._id)}
                          className="bg-[#D9534F] text-white px-2 py-1 rounded shadow hover:bg-[#C9302C] transition duration-200 text-sm"
                        >
                          Arşivle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Arşive Taşı Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Arşive Taşı Onayı"
          className="bg-white p-6 rounded shadow-lg max-w-md mx-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold text-[#123D3D] mb-4">Arşive Taşı</h2>
          <p className="text-[#123D3D]">
            Bu davayı arşive taşımak istediğinize emin misiniz?
          </p>
          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              İptal
            </button>
            <button
              onClick={handleArchive}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Onayla
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LawsuitList;
