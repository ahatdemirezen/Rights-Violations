import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApplicationListForLawyerStore from "../../stores/ApplicationListForLawyerStore";

const ApplicationList = () => {
  const { applications, loading, error, fetchApplications } =
    useApplicationListForLawyerStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Başvuru Listesi
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : error ? (
        <p className="text-center text-red-500">Hata: {error}</p>
      ) : applications.length > 0 ? (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Başvuru Sahibi</th>
              <th className="border border-gray-300 px-4 py-2">T.C. Kimlik No</th>
              <th className="border border-gray-300 px-4 py-2">Başvuru Tarihi</th>
              <th className="border border-gray-300 px-4 py-2">Başvuru Türü</th>
              <th className="border border-gray-300 px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {application.applicantName}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {application.nationalID}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(application.applicationDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {application.applicationType}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() =>
                      navigate(`/lawyer/applications/${application._id}`)
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">Henüz başvuru yok.</p>
      )}
    </div>
  );
};

export default ApplicationList;
  