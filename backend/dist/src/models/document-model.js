"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModel = void 0;
const mongoose_1 = require("mongoose");
// Alt şema tanımı
const DocumentSubSchema = new mongoose_1.Schema({
    documentType: {
        type: String,
        enum: ["files", "link"], // Dosya mı yoksa link mi
        required: false,
    },
    documentSource: {
        type: String,
        required: function () {
            return this.documentType === "link"; // Eğer "link" seçilmişse "documentSource" zorunlu
        },
    },
    documentUrl: {
        type: String,
        required: function () {
            return this.documentType === "files"; // Eğer "file" seçilmişse "documentUrl" zorunlu
        },
    },
    documentDescription: {
        type: String,
        required: false, // Belgenin açıklaması zorunlu
    },
    type: {
        type: String,
        enum: [
            "Media Screening",
            "NGO Data",
            "Bar Commissions",
            "Public Institutions",
            "Other",
        ],
        required: false,
    },
}, {
    _id: true, // Alt belgeler için otomatik _id oluştur
});
// Ana şema
const DocumentSchema = new mongoose_1.Schema({
    documents: [DocumentSubSchema], // Alt şema olarak tanımlandı
}, {
    timestamps: true, // createdAt ve updatedAt alanları otomatik olarak eklenir
});
// Modeli oluştur ve dışa aktar
exports.DocumentModel = (0, mongoose_1.model)("Document", DocumentSchema);
