import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaFemale,
  FaTrash,
  FaInfoCircle,
  FaPlusCircle,
} from "react-icons/fa"; // İkonlar
import PopupForm from "../components/LawyerPopUp"; // Pop-up form
import SearchBar from "../components/SearchBar"; // Arama çubuğu
import useLawyerListPageStore from "../stores/LawyerListPageStore"; // Zustand Store
import Modal from "react-modal"; // React Modal

// Modal için kök element ayarı
Modal.setAppElement("#root");

const LawyerList = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Silme modalı
  const [infoModalOpen, setInfoModalOpen] = useState(false); // Bilgi modalı
  const [selectedLawyerId, setSelectedLawyerId] = useState(null); // Seçilen avukatın ID'si

  const {
    lawyers,
    fetchLawyers,
    deleteLawyer,
    fetchLawyerById,
    selectedLawyer,
    loading,
    error,
  } = useLawyerListPageStore();

  useEffect(() => {
    fetchLawyers(); // Avukat listesini çek
  }, [fetchLawyers]);

  const openInfoModal = async (id) => {
    setSelectedLawyerId(id);
    await fetchLawyerById(id); // Seçilen avukatın bilgilerini getir
    setInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setInfoModalOpen(false);
    setSelectedLawyerId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedLawyerId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedLawyerId(null);
  };

  const confirmDelete = () => {
    if (selectedLawyerId) {
      deleteLawyer(selectedLawyerId); // Avukatı sil
    }
    closeDeleteModal();
  };

  const filteredLawyers = lawyers.filter((lawyer) =>
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-[#F8F1E8] rounded-lg shadow-lg">
      {/* Başlık ve Ekle Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#123D3D]">Avukat Listesi</h1>
        <button
  onClick={() => setIsPopupOpen(true)}
  className="flex items-center bg-[#123D3D] border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded-lg shadow-md hover:bg-[#C39C2D] transition"
>
  <FaPlusCircle className="mr-2" />
  Avukat Ekle
</button>

      </div>

      {/* Arama Çubuğu */}
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Avukat Ara..."
        />
      </div>

      {/* Yükleniyor ve Hata Mesajları */}
      {loading && <p className="text-center text-[#123D3D]">Yükleniyor...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Avukatlar Listesi */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-[#D5C4A1] text-[#123D3D] p-4 rounded-lg shadow-md hover:shadow-lg transition relative"
            >
              {/* Cinsiyet İkonu */}
              <div className="flex items-center justify-center mb-2">
                {lawyer.gender === "male" ? (
                  <FaUserTie className="text-4xl text-[#123D3D]" />
                ) : (
                  <FaFemale className="text-4xl text-[#D9534F]" />
                )}
              </div>
              <h3 className="text-center font-bold">{lawyer.name}</h3>

              {/* Butonlar */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => openDeleteModal(lawyer.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Sil"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => openInfoModal(lawyer.id)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Bilgi"
                >
                  <FaInfoCircle />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bilgi Modal */}
      <Modal
        isOpen={infoModalOpen}
        onRequestClose={closeInfoModal}
        contentLabel="Avukat Bilgisi"
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold text-[#123D3D] mb-4">Avukat Bilgisi</h2>
        {selectedLawyer ? (
          <div>
            <p>
              <strong>İsim:</strong> {selectedLawyer.name}
            </p>
            <p>
              <strong>Cinsiyet:</strong>{" "}
              {selectedLawyer.gender === "male" ? "Erkek" : "Kadın"}
            </p>
            <p>
              <strong>TC Kimlik No:</strong> {selectedLawyer.nationalID}
            </p>
          </div>
        ) : (
          <p>Bilgiler yükleniyor...</p>
        )}
        <button
          onClick={closeInfoModal}
          className="mt-4 bg-[#D4AF37] text-[#123D3D] px-4 py-2 rounded-lg hover:bg-[#C39C2D] transition"
        >
          Kapat
        </button>
      </Modal>

      {/* Silme Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Avukatı Sil"
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold text-[#123D3D] mb-4">Avukatı Sil</h2>
        <p className="text-[#123D3D]">
          Bu avukatı silmek istediğinize emin misiniz?
        </p>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={confirmDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Evet
          </button>
          <button
            onClick={closeDeleteModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Hayır
          </button>
        </div>
      </Modal>

      {/* Pop-up Form */}
      <PopupForm isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};

export default LawyerList;
