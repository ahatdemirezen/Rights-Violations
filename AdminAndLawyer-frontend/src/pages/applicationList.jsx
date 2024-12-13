import React, { useEffect, useState } from "react";
import useApplicationStore from "../stores/ApplicationStore";
import ApplicationEditModal from "../components/ApplicationPopUp"; // Mevcut detay modalı
import CreateLawsuitModal from "../components/CreateLawsuitPopUp"; // Yeni pop-up bileşeni
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

  useEffect(() => {
    fetchApplications();
  }, []);

  const applicationList = applications.applications || [];

  // Filtreleme fonksiyonu
  const filteredApplications =
    filterStatus === ""
      ? applicationList
      : applicationList.filter((app) => app.status === filterStatus);

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
    <div className="p-6">
      {/* Yeni Başvuru Butonu */}
      <button
        onClick={() => navigate("/admin/new-application")}
        className="bg-green-500 text-white px-4 py-2 mb-4 rounded"
      >
        + Yeni Başvuru
      </button>
      <h1 className="text-2xl font-bold mb-4">Başvuru Listesi</h1>

      {/* Filtreleme Butonları */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setFilterStatus("")}
          className={`px-4 py-2 rounded ${
            filterStatus === "" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Tüm Başvurular
        </button>
        <button
          onClick={() => setFilterStatus("approved")}
          className={`px-4 py-2 rounded ${
            filterStatus === "approved" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Onaylananlar
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 rounded ${
            filterStatus === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Bekleyenler
        </button>
        <button
          onClick={() => setFilterStatus("rejected")}
          className={`px-4 py-2 rounded ${
            filterStatus === "rejected" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Reddedilenler
        </button>
      </div>

      {/* Yükleniyor veya hata durumu */}
      {loading && <p>Yükleniyor...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Başvurular tablosu */}
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Başvuru Sahibi</th>
            <th className="border border-gray-300 px-4 py-2">Tür</th>
            <th className="border border-gray-300 px-4 py-2">Başvuru No</th>
            <th className="border border-gray-300 px-4 py-2">Tarih</th>
            <th className="border border-gray-300 px-4 py-2">Durum</th>
            <th className="border border-gray-300 px-4 py-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <tr key={app._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {app.applicantName || app.organizationName}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {app.applicationType}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {app.applicationNumber}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(app.applicationDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">{app.status}</td>
                <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(app)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Detay
                  </button>
                  {app.status === "approved" ? (
                    app.lawsuitCreated ? (
                      <span className="text-gray-500 italic">
                        Davası Oluşturulmuştur
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenLawsuitModal(app)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Dava Oluştur
                      </button>
                    )
                  ) : null}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Hiç başvuru bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
  );
};

export default ApplicationListPage;
