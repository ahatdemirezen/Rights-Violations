import React from "react";

const ThankYouPage = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-r from-[#123D3D] to-[#2C7873]">
      <div
        className="bg-white shadow-lg rounded-lg p-8 text-center"
        style={{
          width: "90%",
          maxWidth: "500px",
          border: "1px solid rgba(213, 196, 161, 0.5)",
          borderRadius: "12px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h1 className="text-3xl font-bold text-[#D5C4A1] mb-4">
          Başvurunuz Başarıyla Alındı!
        </h1>
        <p className="text-gray-700">
          Başvurunuzu aldık ve kısa süre içinde işleme koyacağız. Teşekkür ederiz!
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
