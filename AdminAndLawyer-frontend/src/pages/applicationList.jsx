import React, { useEffect, useState } from "react";
import useApplicationStore from "../stores/ApplicationStore";
import ApplicationEditModal from "../components/ApplicationPopUp"; // Mevcut detay modalı
import CreateLawsuitModal from "../components/CreateLawsuitPopUp"; // Yeni pop-up bileşeni
import SearchBar from "../components/SearchBar"; // SearchBar bileşenini ekledik
import { useNavigate } from "react-router-dom";

const ApplicationListPage = () => {
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error,
    fetchApplications,
    updateApplication,
  } = useApplicationStore();

  const [selectedApplication, setSelectedApplication] = useState(null); // Seçilen başvuru
  const [isModalOpen, setIsModalOpen] = useState(false); // Detay modal durumu
  const [isLawsuitModalOpen, setIsLawsuitModalOpen] = useState(false); // Dava oluştur modal durumu
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi durumu

  useEffect(() => {
    fetchApplications();
  }, []);

  const applicationList = applications.applications || [];

  // Filtreleme ve arama fonksiyonu
  const filteredApplications = applicationList.filter((app) => {
    const matchesFilter =
      filterStatus === "" || app.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      (app.applicantName &&
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.applicationNumber &&
        app.applicationNumber.toString().includes(searchTerm)) ||
      (app.applicationType &&
        app.applicationType.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenModal = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
    setIsModalOpen(false);
  };

  const handleOpenLawsuitModal = (application) => {
    setSelectedApplication(application);
    setIsLawsuitModalOpen(true); // Yeni modalı aç
  };

  const handleCloseLawsuitModal = () => {
    setSelectedApplication(null);
    setIsLawsuitModalOpen(false); // Yeni modalı kapat
  };

  const handleSave = async (updatedApplication) => {
    console.log("Updated Application:", updatedApplication);
    if (!updatedApplication || !updatedApplication._id) {
      console.error("Updated application is undefined or missing _id.");
      return;
    }

    try {
      await updateApplication(updatedApplication._id, updatedApplication);
      console.log("Başvuru başarıyla güncellendi.");

      // Güncellenen listeyi yeniden yükleyin
      await fetchApplications();
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen py-6">
      <div className="w-full max-w-7xl p-6 bg-[#fdf8f0] rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#123D3D]">Başvuru Listesi</h1>
          <button
            onClick={() => navigate("/admin/new-application")}
            className="bg-[#123D3D] border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded font-medium shadow-md hover:bg-[#D5C4A1] transition"
          >
            + Yeni Başvuru
          </button>
        </div>
  
        {/* SearchBar ve Filtreleme Butonları */}
        <div className="mb-6 flex flex-wrap justify-between items-center space-y-4 sm:space-y-0">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Başvuru Ara..."
          />
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterStatus("")}
              className={`px-4 py-2 rounded shadow-md border border-[#D4AF37] transition duration-300 ${
                filterStatus === "" ? "bg-[#123D3D] text-[#D4AF37]" : "bg-[#D5C4A1] text-[#123D3D]"
              }`}
            >
              Tüm Başvurular
            </button>
  
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded shadow-md border border-[#D4AF37] transition duration-300 ${
                filterStatus === "approved" ? "bg-[#123D3D] text-[#D4AF37]" : "bg-[#D5C4A1] text-[#123D3D]"
              }`}
            >
              Onaylananlar
            </button>
  
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded shadow-md border border-[#D4AF37] transition duration-300 ${
                filterStatus === "pending" ? "bg-[#123D3D] text-[#D4AF37]" : "bg-[#D5C4A1] text-[#123D3D]"
              }`}
            >
              Bekleyenler
            </button>
  
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded shadow-md border border-[#D4AF37] transition duration-300 ${
                filterStatus === "rejected" ? "bg-[#123D3D] text-[#D4AF37]" : "bg-[#D5C4A1] text-[#123D3D]"
              }`}
            >
              Reddedilenler
            </button>
          </div>
        </div>
  
        {/* Yükleniyor veya hata durumu */}
        {loading && <p className="text-center text-[#123D3D]">Yükleniyor...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
  
        {/* Başvurular Tablosu */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[#D5C4A1] bg-[#F8F1E8] rounded-lg shadow-md">
              <thead>
                <tr className="bg-[#123D3D] text-[#F8F1E8]">
                  <th className="px-4 py-2">Başvuru Sahibi</th>
                  <th className="px-4 py-2">Tür</th>
                  <th className="px-4 py-2">Başvuru No</th>
                  <th className="px-4 py-2">Tarih</th>
                  <th className="px-4 py-2">Durum</th>
                  <th className="px-4 py-2">Dava Durumu</th>
                  <th className="px-4 py-2">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-[#D5C4A1] text-[#123D3D] transition"
                  >
                    <td className="px-4 py-2 border-b">
                      {app.applicantName || app.organizationName}
                    </td>
                    <td className="px-4 py-2 border-b">{app.applicationType}</td>
                    <td className="px-4 py-2 border-b">{app.applicationNumber}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border-b">{app.status}</td>
                    <td className="px-4 py-2 border-b text-center">
                      {app.lawsuitCreated ? "Oluşmuştur" : ""}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(app)}
                          className="bg-[#123D3D] border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 rounded font-medium shadow-md hover:bg-[#D5C4A1] transition"
                        >
                          Detay
                        </button>
                        {app.status === "approved" && !app.lawsuitCreated && (
                          <button
                            onClick={() => handleOpenLawsuitModal(app)}
                            className="bg-[#123D3D] border border-[#D4AF37] text-[#D4AF37] px-3 py-1.5 rounded font-medium shadow-md hover:bg-[#D5C4A1] transition"
                          >
                            Dava Oluştur
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
  
        {/* Detay Modal */}
        {isModalOpen && selectedApplication && (
          <ApplicationEditModal
            application={selectedApplication}
            applicationId={selectedApplication._id}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
  
        {/* Dava Oluştur Modal */}
        {isLawsuitModalOpen && selectedApplication && (
          <CreateLawsuitModal
            application={selectedApplication}
            onClose={handleCloseLawsuitModal}
          />
        )}
      </div>
    </div>
  );  
};

export default ApplicationListPage;
