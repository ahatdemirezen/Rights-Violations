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
        alert("Dava başarıyla arşive taşındı.");
        closeModal(); // Modalı kapat
      }
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
        Tüm Davalar
      </h1>

      {/* SearchBar Bileşeni */}
      <div className="mb-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Av, Baş.No, Mah. vs. Ara..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow rounded">
          {/* Tablo Başlığı */}
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-4 py-2 border-b">Başvuran Adı</th>
              <th className="text-left px-4 py-2 border-b">Avukat</th>
              <th className="text-left px-4 py-2 border-b">Başvuru No</th>
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
                  {lawsuit.applicationId?.lawyer?.name || "Avukat Belirtilmemiş"} {/* Lawyer ismi */}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-600">
                  {lawsuit.applicationNumber || "Başvuru Numarası Yok"}
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
                    <button
                      onClick={() => openModal(lawsuit._id)}
                      className="text-red-500 hover:underline"
                    >
                      Arşive Taşı
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Bileşeni */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Arşive Taşı Onayı"
        className="bg-white p-6 rounded shadow max-w-md mx-auto mt-10"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-bold mb-4">Arşive Taşı</h2>
        <p>Bu davayı arşive taşımak istediğinizden emin misiniz?</p>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            İptal
          </button>
          <button
            onClick={handleArchive}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Onayla
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LawsuitList;
