import { Schema, model, Document } from "mongoose";

// Interface for the Document schema
export interface IDocument extends Document {
  documents: Array<{
    _id: any;
    documentType: "files" | "link";
    documentSource?: string; // Eğer "link" seçilmişse link bilgisi
    documentUrl?: string; // Eğer "file" seçilmişse dosya URL bilgisi (örneğin, S3 linki)
    documentDescription: string; // Belgenin açıklaması
    type: "Media Screening" | "NGO Data" | "Bar Commissions" | "Public Institutions" | "Other";
  }>;
}

// Alt şema tanımı
const DocumentSubSchema = new Schema(
  {
    documentType: {
      type: String,
      enum: ["files", "link"], // Dosya mı yoksa link mi
      required: false,
    },
    documentSource: {
      type: String,
      required: function (this: any) {
        return this.documentType === "link"; // Eğer "link" seçilmişse "documentSource" zorunlu
      },
    },
    documentUrl: {
      type: String,
      required: function (this: any) {
        return this.documentType === "files"; // Eğer "file" seçilmişse "documentUrl" zorunlu
      },
    },
    documentDescription: {
      type: String,
      required: true, // Belgenin açıklaması zorunlu
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
      required: true,
    },
  },
  {
    _id: true, // Alt belgeler için otomatik _id oluştur
  }
);

// Ana şema
const DocumentSchema = new Schema<IDocument>(
  {
    documents: [DocumentSubSchema], // Alt şema olarak tanımlandı
  },
  {
    timestamps: true, // createdAt ve updatedAt alanları otomatik olarak eklenir
  }
);

// Modeli oluştur ve dışa aktar
export const DocumentModel = model<IDocument>("Document", DocumentSchema);
