import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useApplicationListForLawyerStore from "../../stores/ApplicationListForLawyerStore";

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
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Dosya:</strong>{" "}
              {applicationDetails.file ? (
                <a
                  href={applicationDetails.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Dosyayı Görüntüle
                </a>
              ) : (
                "Dosya mevcut değil."
              )}
            </p>
            <p className="text-gray-900 text-lg">
              <strong className="text-[#2C4E4A]">Link:</strong>{" "}
              {applicationDetails.link ? (
                <a
                  href={applicationDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Linke Git
                </a>
              ) : (
                "Link mevcut değil."
              )}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500">Başvuru bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetails;
