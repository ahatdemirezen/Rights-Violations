import { Schema, model, Document } from "mongoose";

// Interface for the Document schema
export interface IDocument extends Document {
  documents: Array<{
    _id: any;
    documentType: "files" | "link"; // Kullanıcının dosya mı yükleyeceği yoksa link mi ekleyeceği seçimi
    documentSource?: string; // Eğer "link" seçilmişse link bilgisi
    documentUrl?: string; // Eğer "file" seçilmişse dosya URL bilgisi (örneğin, S3 linki)
    documentDescription: string; // Belgenin açıklaması
    type: "Media Screening" | "NGO Data" | "Bar Commissions" | "Public Institutions" | "Other"; // Kullanıcının doküman türü seçimi
  }>;
}

// Define the Mongoose schema
const DocumentSchema = new Schema<IDocument>(
  {
    documents: [
      {
        
        documentSource: {
          type: String,
          required: function (this: { documentType: string }) {
            return this.documentType === "link"; // Eğer "link" seçilmişse "documentSource" zorunlu
          },
        },
        documentUrl: {
          type: String,
          required: function (this: { documentType: string }) {
            return this.documentType === "files"; // Eğer "file" seçilmişse "documentUrl" zorunlu
          },
        },
        documentDescription: { type: String, required: true }, // Her iki durumda da açıklama zorunlu
        type: {
          type: String,
          enum: [
            "Media Screening",
            "NGO Data",
            "Bar Commissions",
            "Public Institutions",
            "Other",
          ], // Doküman türleri
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt ve updatedAt alanları otomatik olarak eklenir
  }
);

// Create and export the model
export const DocumentModel = model<IDocument>("Document", DocumentSchema);