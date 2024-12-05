import React, { useEffect, useState } from "react";
import { FaUserTie, FaFemale, FaTrash, FaInfoCircle } from "react-icons/fa"; // Erkek, Kadın, Silme ve Bilgi ikonları
import PopupForm from "../components/LawyerPopUp"; // Daha önce yaptığımız pop-up form
import SearchBar from "../components/SearchBar"; // SearchBar bileşeni
import useLawyerListPageStore from "../stores/LawyerListPageStore"; // Zustand store'u içe aktar
import Modal from "react-modal"; // React Modal

// Modal için kök element ayarı
Modal.setAppElement("#root");

const LawyerList = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi durumu
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Silme modal durumu
  const [infoModalOpen, setInfoModalOpen] = useState(false); // Bilgi modal durumu
  const [selectedLawyerId, setSelectedLawyerId] = useState(null); // Seçilen avukatın ID'si

  const { lawyers, fetchLawyers, deleteLawyer, fetchLawyerById, selectedLawyer, loading, error } =
    useLawyerListPageStore(); // Zustand store fonksiyonları ve state

  // Avukatları API'den çekmek için useEffect kullanımı
  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  // Modal'ı açma ve ID'yi ayarlama (Bilgi için)
  const openInfoModal = async (id) => {
    setSelectedLawyerId(id);
    await fetchLawyerById(id); // Seçilen avukatın bilgilerini getir
    setInfoModalOpen(true);
  };

  // Modal'ı kapatma (Bilgi için)
  const closeInfoModal = () => {
    setInfoModalOpen(false);
    setSelectedLawyerId(null);
  };

  // Modal'ı açma (Silme için)
  const openDeleteModal = (id) => {
    setSelectedLawyerId(id);
    setDeleteModalOpen(true);
  };

  // Modal'ı kapatma (Silme için)
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedLawyerId(null);
  };

  // Avukat silme işlevi
  const confirmDelete = () => {
    if (selectedLawyerId) {
      deleteLawyer(selectedLawyerId); // Zustand fonksiyonunu çağır
    }
    closeDeleteModal(); // Modal'ı kapat
  };

  // Arama filtresi
  const filteredLawyers = lawyers.filter((lawyer) =>
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative max-w-6xl mx-auto mt-10 p-4">
      {/* Sağ Üst Köşe Buton */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Avukat Ekle
      </button>

      {/* Başlık */}
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Avukatlar Listesi
      </h1>

      {/* Arama Çubuğu */}
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Avukat Ara..."
        />
      </div>

      {/* Yükleniyor Mesajı */}
      {loading && <p className="text-center text-gray-500">Yükleniyor...</p>}

      {/* Hata Mesajı */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Avukatlar Listesi */}
      {!loading && !error && (
        <div className="grid grid-cols-4 gap-6">
          {filteredLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="flex flex-col items-center justify-center bg-gray-300 h-32 w-full rounded shadow-md hover:bg-gray-400 transition relative"
            >
              {/* Cinsiyete Göre İkon */}
              {lawyer.gender === "male" ? (
                <FaUserTie className="text-4xl text-blue-700 mb-2" /> // Erkek ikonu
              ) : (
                <FaFemale className="text-4xl text-pink-700 mb-2" /> // Kadın ikonu
              )}
              <span className="text-gray-800 font-medium text-center">
                {lawyer.name}
              </span>

              {/* Silme Butonu */}
              <button
                onClick={() => openDeleteModal(lawyer.id)}
                className="absolute top-2 right-2"
                title="Sil"
              >
                <FaTrash className="text-[#D9534F] hover:text-[#cc0000] text-lg" />
              </button>

              {/* Bilgi Butonu */}
              <button
                onClick={() => openInfoModal(lawyer.id)}
                className="absolute bottom-2 right-2"
                title="Bilgi"
              >
                <FaInfoCircle className="text-[#5bc0de] hover:text-[#31b0d5] text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bilgi Modal */}
      <Modal
        isOpen={infoModalOpen}
        onRequestClose={closeInfoModal}
        contentLabel="Avukat Bilgisi"
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Avukat Bilgisi</h2>
        {selectedLawyer ? ( 
          <div>
            <p><strong>İsim:</strong> {selectedLawyer.name}</p>
            <p><strong>Cinsiyet:</strong> {selectedLawyer.gender === "male" ? "Erkek" : "Kadın"}</p>
            <p><strong>TC Kimlik No:</strong> {selectedLawyer.nationalID}</p>
          </div>
        ) : (
          <p>Bilgiler yükleniyor...</p>
        )}
        <button
          onClick={closeInfoModal}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition mt-4"
        >
          Kapat
        </button>
      </Modal>

      {/* Silme Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Avukatı Sil"
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Avukatı Sil</h2>
        <p className="text-gray-600">Bu avukatı silmek istediğinize emin misiniz?</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={confirmDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition mr-2"
          >
            Evet
          </button>
          <button
            onClick={closeDeleteModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
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
