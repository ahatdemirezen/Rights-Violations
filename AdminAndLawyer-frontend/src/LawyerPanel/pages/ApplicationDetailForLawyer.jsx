import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useApplicationListForLawyerStore from "../../stores/ApplicationListForLawyerStore";
import { FaFileAlt, FaLink } from "react-icons/fa"; // Dosya ve link ikonları

const ApplicationDetails = () => {
  const { applicationId } = useParams(); // URL'den applicationId al
  const { applicationDetails, loading, error, fetchApplicationDetails } =
    useApplicationListForLawyerStore();

  useEffect(() => {
    // Application detaylarını getir
    if (applicationId) {
      fetchApplicationDetails(applicationId);
    }
  }, [applicationId, fetchApplicationDetails]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#F3F4ED] via-[#E8E9E3] to-[#F3F4ED] ">
      <div className="max-w-4xl w-full h-auto bg-white p-10 shadow-2xl rounded-lg border border-[#6D8B74] transform transition-transform hover:scale-105">
        <h1 className="text-4xl font-bold text-center text-[#2C4E4A] mb-8">
          Başvuru Detayları
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Yükleniyor...</p>
        ) : error ? (
          <p className="text-center text-red-500">Hata: {error}</p>
        ) : applicationDetails ? (
          <div className="space-y-6">
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Başvuru Sahibi:</strong>{" "}
              {applicationDetails.applicationType === "individual"
                ? applicationDetails.applicantName
                : applicationDetails.organizationName}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Başvuru Numarası:</strong>{" "}
              {applicationDetails.applicationNumber}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">T.C. Kimlik No:</strong>{" "}
              {applicationDetails.nationalID}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Başvuru Tarihi:</strong>{" "}
              {new Date(applicationDetails.applicationDate).toLocaleDateString()}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Başvuru Türü:</strong>{" "}
              {applicationDetails.applicationType}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Adres:</strong>{" "}
              {applicationDetails.address}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Telefon Numarası:</strong>{" "}
              {applicationDetails.phoneNumber}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Yakınma Nedeni:</strong>{" "}
              {applicationDetails.complaintReason}
            </p>

           {/* Dosya ve Link Listesi */}
<div className="space-y-4">
  <h2 className="text-2xl font-bold text-[#2C4E4A]">Dökümanlar:</h2>
  {applicationDetails.populatedDocuments.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {applicationDetails.populatedDocuments.map((doc, index) => (
        <div
          key={index}
          className="relative flex flex-col items-center bg-[#F3F4ED] p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 border border-[#6D8B74]"
        >
          {/* Dosya veya Link İkonu */}
          <div className="text-[#6D8B74] text-6xl mb-2">
            {doc.documentSource ? <FaLink /> : <FaFileAlt />}
          </div>
          {/* Dosya Bilgileri */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">
              {doc.documentDescription || "Açıklama Yok"}
            </p>
            <p className="text-xs text-gray-600">
              {doc.documentSource ? "Link" : "Dosya"}
            </p>
          </div>
          {/* Hover Efekti */}
          <a
            href={doc.documentSource || doc.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 text-white font-medium text-sm rounded-lg transition-opacity"
          >
            Görmek İçin Tıklayın
          </a>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">Hiçbir döküman mevcut değil.</p>
  )}
</div>




          </div>
        ) : (
          <p className="text-center text-gray-500">Başvuru bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetails;
