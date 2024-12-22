import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaInfoCircle } from "react-icons/fa"; // İkonlar
import useApplicationListForLawyerStore from "../../stores/ApplicationListForLawyerStore";

const ApplicationList = () => {
  const { applications, loading, error, fetchApplications } =
    useApplicationListForLawyerStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(""); // Arama için state

  useEffect(() => {
    fetchApplications(); // Başvuruları fetch et
  }, [fetchApplications]);

  // Başvuru numarasına göre filtreleme
  const filteredApplications = applications.filter((application) =>
    application.applicationNumber
      ?.toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#F3F6F4] rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-[#2C4E4A] mb-8">
        Başvuru Listesi ({filteredApplications.length})
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Başvuru Numarasına Göre Ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-[#6D8B74] rounded-lg focus:outline-none focus:ring focus:ring-[#D6E4DC]"
        />
      </div>

      {/* Loading, Error ve Liste Kontrolü */}
      {loading ? (
        <p className="text-center text-[#6D8B74]">Yükleniyor...</p>
      ) : error ? (
        <p className="text-center text-red-500">Hata: {error}</p>
      ) : filteredApplications.length > 0 ? (
        <table className="w-full border-collapse border border-[#D0C9C0] bg-white rounded-lg overflow-hidden">
          <thead className="bg-[#D6E4DC] text-[#2C4E4A]">
            <tr>
              <th className="border border-[#D0C9C0] px-4 py-3">#</th>
              <th className="border border-[#D0C9C0] px-4 py-3">Başvuru Numarası</th>
              <th className="border border-[#D0C9C0] px-4 py-3">
                <FaUser className="inline mr-2" /> Başvuru Sahibi
              </th>
              <th className="border border-[#D0C9C0] px-4 py-3">T.C. Kimlik No</th>
              <th className="border border-[#D0C9C0] px-4 py-3">Başvuru Tarihi</th>
              <th className="border border-[#D0C9C0] px-4 py-3">Başvuru Türü</th>
              <th className="border border-[#D0C9C0] px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application, index) => (
              <tr key={index} className="hover:bg-[#F0F4F2]">
                <td className="border border-[#D0C9C0] px-4 py-3 text-center">
                  {index + 1}
                </td>
                <td className="border border-[#D0C9C0] px-4 py-3">
                  {application.applicationNumber}
                </td>
                <td className="border border-[#D0C9C0] px-4 py-3 flex items-center space-x-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#6D8B74] text-white">
                    <FaUser />
                  </div>
                  <span className="truncate max-w-xs">{application.applicantName || application.organizationName}</span>
                </td>
                
                <td className="border border-[#D0C9C0] px-4 py-3">
                  {application.nationalID}
                </td>
                <td className="border border-[#D0C9C0] px-4 py-3">
                  {new Date(application.applicationDate).toLocaleDateString()}
                </td>
                <td className="border border-[#D0C9C0] px-4 py-3">
                  {application.applicationType}
                </td>
                <td className="border border-[#D0C9C0] px-4 py-3 text-center">
                  <button
                    onClick={() =>
                      navigate(`/lawyer/applications/${application._id}`)
                    }
                    className="bg-[#2C4E4A] text-white px-4 py-2 rounded hover:bg-[#4A766E] transition flex items-center justify-center"
                  >
                    <FaInfoCircle className="mr-2" />
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-[#6D8B74]">
          {searchQuery
            ? "Eşleşen başvuru bulunamadı."
            : "Henüz başvuru yok."}
        </p>
      )}
    </div>
  );
};

export default ApplicationList;
