import { Schema, model, Document, Types } from "mongoose";

// Interface for the Application schema
export interface IApplication extends Document {
  applicationNumber: number; // Başvuru numarası
  receivedBy?: string 
  applicantName: string; // Başvuru sahibinin adı
  nationalID: string; // T.C. Kimlik No
  applicationType: "organization" | "individual"; // Başvuru türü
  applicationDate: Date; // Başvuru tarihi
  lawyer: Types.ObjectId | null; // Avukat referansı (User şemasına bağlanır)
  address: string; // Adres
  phoneNumber: string; // Telefon numarası
  email: string; // Yeni eklenen email alanı
  complaintReason: string; // Yakınma veya ihlal nedenleri
  eventCategories: string; // Olay kategorileri referansı
  documents: Types.ObjectId[]; // Doküman referansları (Document modeli)
  status: "approved" | "pending" | "rejected"; // Başvuru durumu
  organizationName?: string; // Kurum adı (Sadece "organization" türü için zorunlu)
  lawsuitCreated?: boolean; // Arşiv durumu (true veya false)
}

// Çoğu değer geçici olarak false yapılmıştır!
// Define the Mongoose schema
const ApplicationSchema = new Schema<IApplication>(
  {
    applicationNumber: { type: Number, required: true, unique: true },
    receivedBy: { type: String, default: null },
    applicantName: {
      type: String,
      required: false,
    },   
    nationalID: { type: String, required: false, unique: true, minlength: 11, maxlength: 11 }, //unique geçici olarak false yapılmıştır
    applicationType: { type: String, enum: ["organization", "individual"], required: false },
    organizationName: {
      type: String,
      required: false, // Her durumda zorunlu değil
    },
    
    applicationDate: { type: Date, required: false },
    address: { type: String, required: false },
    phoneNumber: {
      type: String,
      required: false,
      match: [/^(\+90|0)?\d{10}$/, "Geçerli bir telefon numarası giriniz. Örn: 5XXXXXXXXX"],
      minlength: 10,
      maxlength: 11,
    },
    email: {
      type: String,
      required: false,
      match: [/^\S+@\S+\.\S+$/, "Geçerli bir email adresi giriniz. Örn: example@mail.com"],
    },
    complaintReason: { type: String, required: false },
    eventCategories: {
      type: String, // Array of strings
      enum: [
        "Aile ve Özel Yaşam Hakkı",
        "Ayrımcılık",
        "Basın Özgürlüğü",
        "Kadına Karşı Şiddet ve Taciz",
        "Çocuğa Karşı Şiddet ve Taciz",
        "Örgütlenme Özgürlüğü",
        "İşkence ve Kötü Muamele",
        "Eğitim Hakkı",
        "Düşünce ve İfade Özgürlüğü",
      ],
      required: false,
    },    
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document", // Document modeline referans
      },
    ],
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" }, // Başvuru durumu
    lawyer: {
      type: Schema.Types.ObjectId, // `User` modeline referans
      ref: 'User', // `User` şemasına referans
      default: null, // Atama yapılmazsa null olabilir
    },
    lawsuitCreated: { type: Boolean, default: false }, // Dava oluşturulup oluşturulmadığını belirten alan
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik olarak eklenir
  }
);

export const ApplicationModel = model<IApplication>("Application", ApplicationSchema);
