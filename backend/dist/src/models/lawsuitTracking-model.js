"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawsuitTrackingModel = void 0;
const mongoose_1 = require("mongoose");
//Çoğu değer geçici olarak false yapılmıştır!
// Define the Mongoose schema
const LawsuitTrackingSchema = new mongoose_1.Schema({
    applicationId: {
        type: mongoose_1.Schema.Types.ObjectId, // `ObjectId` olarak ayarlandı
        ref: 'Application', // `Application` modeline referans
        required: true,
    },
    applicationNumber: {
        type: Number, // Başvuru numarası, `Application` modelinden alınacak
        required: true,
    },
    applicantName: {
        type: String,
        required: false,
    },
    organizationName: {
        type: String,
        required: false,
        default: null,
    }, // Organization adı
    courtFileNo: { type: String, required: false },
    caseSubject: { type: String, required: false }, // Dava Konusu
    fileNumber: { type: String, required: false }, // Dosya No
    court: { type: String, required: false }, // Mahkeme
    files: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'File', // Reference to File model
        },
    ], // Dosyalar (birden fazla dosya referansı)
    lawsuitDate: { type: Date, required: false }, // Dava oluşturulma tarihi
    caseNumber: { type: String, required: false }, // Esas numarası
    resultDescription: { type: String, default: null }, // Sonucu Açıklama, optional
    resultStage: { type: String, default: null }, // Sonucu Aşama, optional
    archive: { type: Boolean, default: false }, // Arşiv durumu, varsayılan false
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
// Create and export the model
exports.LawsuitTrackingModel = (0, mongoose_1.model)('LawsuitTracking', LawsuitTrackingSchema);
