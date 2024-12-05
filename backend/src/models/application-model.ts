import { Schema, model, Document, Types } from "mongoose";

// Interface for the Application schema
export interface IApplication extends Document {
  applicationNumber: number; // Başvuru numarası
  receivedBy?: string 
  applicantName: string; // Başvuru sahibinin adı
  nationalID: string; // T.C. Kimlik No
  applicationType: "organization" | "individual"; // Başvuru türü
  applicationDate: Date; // Başvuru tarihi
  address: string; // Adres
  phoneNumber: string; // Telefon numarası
  complaintReason: string; // Yakınma veya ihlal nedenleri
  eventCategories: Types.ObjectId[]; // Olay kategorileri referansı
  documents: Types.ObjectId[]; // Doküman referansları (Document modeli)
  status: "approved" | "pending" | "rejected"; // Başvuru durumu
  organizationName?: string; // Kurum adı (Sadece "organization" türü için zorunlu)
}

// Define the Mongoose schema
const ApplicationSchema = new Schema<IApplication>(
  {
    applicationNumber: { type: Number, required: true, unique: true },
    receivedBy: { type: String, default: null },
    applicantName: { type: String, required: true },
    nationalID: { type: String, required: true, unique: true, minlength: 11, maxlength: 11 },
    applicationType: { type: String, enum: ["organization", "individual"], required: true },
    organizationName: {
      type: String,
      required: function (this: IApplication) {
        return this.applicationType === "organization"; // Kurum adı sadece "organization" türünde zorunlu
      },
    },
    applicationDate: { type: Date, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    complaintReason: { type: String, required: true },
    eventCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "EventCategory", // Olay kategorisi referansı
      },
    ],
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document", // Document modeline referans
      },
    ],
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" }, // Başvuru durumu
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik olarak eklenir
  }
);

export const ApplicationModel = model<IApplication>("Application", ApplicationSchema);
