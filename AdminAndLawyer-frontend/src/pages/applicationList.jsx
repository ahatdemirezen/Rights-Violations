import React from "react";

const Application = () => {
  const applications = [
    {
      name: "Ali Veli",
      email: "ali@example.com",
      date: "2024-12-01",
      message: "Pozisyon için başvuruyorum.",
    },
    {
      name: "Ayşe Fatma",
      email: "ayse@example.com",
      date: "2024-12-02",
      message: "Detayları konuşmak isterim.",
    },
  ];

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Başvurular
      </h1>
      {applications.length > 0 ? (
        applications.map((application, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-md"
          >
            <h2 className="text-lg font-semibold text-blue-600">
              {application.name}
            </h2>
            <p className="text-gray-700">
              <strong>E-posta:</strong> {application.email}
            </p>
            <p className="text-gray-700">
              <strong>Başvuru Tarihi:</strong> {application.date}
            </p>
            <p className="text-gray-700">
              <strong>Mesaj:</strong> {application.message}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">Henüz başvuru yok.</p>
      )}
    </div>
  );
};

export default Application;
