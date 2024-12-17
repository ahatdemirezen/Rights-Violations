import React, { useEffect, useState } from "react";
import { FaFolder, FaFileAlt, FaLink } from "react-icons/fa"; // İkonlar
import useDocumentStore from "../stores/DocumentStore";
import SearchBar from "../components/SearchBar";

const DocumentList = () => {
  const { documents, fetchDocuments, loading, error } = useDocumentStore();
  const [filterType, setFilterType] = useState("");
  const [filterDocumentType, setFilterDocumentType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    let filtered = documents;

    if (filterType) {
      filtered = filtered.filter(
        (doc) => doc.documents[0]?.type === filterType
      );
    }

    if (filterDocumentType) {
      filtered = filtered.filter(
        (doc) => doc.documents[0]?.documentType === filterDocumentType
      );
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.documents[0]?.documentDescription
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm)
      );
    }

    setFilteredDocuments(filtered);
  }, [filterType, filterDocumentType, searchTerm, documents]);

  if (loading)
    return <p className="text-center text-[#123D3D]">Yükleniyor...</p>;

  if (error)
    return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-[#F8F1E8] min-h-screen p-4">
      {/* Başlık */}
      <h1 className="text-3xl font-bold text-[#123D3D] text-center mb-6">
        Döküman Listesi
      </h1>

      {/* Filtreleme ve Arama */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        {/* Tür Filtreleme */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-48 border border-[#D5C4A1] p-2 rounded bg-white text-[#123D3D]"
        >
          <option value="">Tüm Türler</option>
          <option value="Media Screening">Medya Taraması</option>
          <option value="NGO Data">STK Verileri</option>
          <option value="Bar Commissions">Baro Komisyonları</option>
          <option value="Public Institutions">Kamu Kurumları</option>
          <option value="Other">Diğer</option>
        </select>

        {/* Dosya Tipi Filtreleme */}
        <select
          value={filterDocumentType}
          onChange={(e) => setFilterDocumentType(e.target.value)}
          className="w-48 border border-[#D5C4A1] p-2 rounded bg-white text-[#123D3D]"
        >
          <option value="">Tüm Tipler</option>
          <option value="files">Dosya</option>
          <option value="link">Link</option>
        </select>

        {/* Arama Çubuğu */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Açıklamaya göre ara..."
        />
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDocuments.map((document, index) => (
          <div
            key={index}
            className="relative group border border-[#D5C4A1] rounded-lg shadow-lg hover:shadow-2xl transition bg-white p-3 flex flex-col items-center justify-between"
          >
            {/* Dosya İkonu */}
            <div className="text-[#e2be47] text-5xl mb-2">
              {document.documents[0]?.documentType === "files" ? (
                <FaFileAlt />
              ) : (
                <FaLink />
              )}
            </div>

            {/* Dosya Bilgileri */}
            <div className="text-center">
              {/* Açıklama */}
              <h2 className="text-md font-semibold text-[#123D3D] mb-1">
                Açıklama:{" "}
                <span className="font-normal text-gray-700">
                  {document.documents[0]?.documentDescription || "Açıklama Yok"}
                </span>
              </h2>
              {/* Tür */}
              <p className="text-sm text-gray-600 mt-1">
                Tür:{" "}
                <span className="font-normal">
                  {document.documents[0]?.type || "Tür Belirtilmemiş"}
                </span>
              </p>
            </div>

            {/* Hover Efekti */}
            <a
              href={
                document.documents[0]?.documentType === "files"
                  ? document.documents[0]?.documentUrl
                  : document.documents[0]?.documentSource
              }
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white font-medium text-sm rounded-lg transition-opacity"
            >
              Görmek için tıklayın
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
