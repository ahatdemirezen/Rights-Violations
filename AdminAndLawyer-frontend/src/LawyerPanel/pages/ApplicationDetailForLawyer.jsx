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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Başvuru Detayları
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : error ? (
        <p className="text-center text-red-500">Hata: {error}</p>
      ) : applicationDetails ? (
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            Başvuru Sahibi:{" "}
            {applicationDetails.applicationType === "individual"
              ? applicationDetails.applicantName
              : applicationDetails.organizationName}
          </h2>
          <p className="text-gray-700">
            <strong>Başvuru Numarası:</strong> {applicationDetails.applicationNumber}
          </p>
          <p className="text-gray-700">
            <strong>T.C. Kimlik No:</strong> {applicationDetails.nationalID}
          </p>
          <p className="text-gray-700">
            <strong>Başvuru Tarihi:</strong>{" "}
            {new Date(applicationDetails.applicationDate).toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            <strong>Başvuru Türü:</strong> {applicationDetails.applicationType}
          </p>
          <p className="text-gray-700">
            <strong>Adres:</strong> {applicationDetails.address}
          </p>
          <p className="text-gray-700">
            <strong>Telefon Numarası:</strong> {applicationDetails.phoneNumber}
          </p>
          <p className="text-gray-700">
            <strong>Yakınma Nedeni:</strong> {applicationDetails.complaintReason}
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500">Başvuru bulunamadı.</p>
      )}
    </div>
  );
};

export default ApplicationDetails;
