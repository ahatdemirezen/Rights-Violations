/*import { Schema, model, Document } from "mongoose";

// Interface for the DigitalArchive schema
export interface IDigitalArchive extends Document {
  taramaDonemi?: string;
  olayKategorisi?: string;
  olayOzet?: string;
  link?: string;
  dosyaYukleme?: Array<{
    documentUrl: string;
    documentDescription: string;
  }>;
  kaynak?: string | null;
  goruntuLinki?: string | null;
  bildirimKurumu?: string | null;
  vakaninAlindigiKomisyon?: string | null;
  kamuKurumu?: string | null;
  tur: "Medya Taraması" | "STK Verileri" | "Baro Komisyonları" | "Kamu Kurumları";
}

const DigitalArchiveSchema = new Schema<IDigitalArchive>(
  {
    taramaDonemi: { type: String, required: false },
    olayKategorisi: { type: String, required: false },
    olayOzet: { type: String, required: false },
    link: { type: String, required: false },
    dosyaYukleme: [
      {
        documentUrl: { type: String, required: true },
        documentDescription: { type: String, required: true },
      },
    ],
    kaynak: { type: String, default: null },
    goruntuLinki: { type: String, default: null },
    bildirimKurumu: { type: String, default: null },
    vakaninAlindigiKomisyon: { type: String, default: null },
    kamuKurumu: { type: String, default: null },
    tur: {
      type: String,
      enum: ["Medya Taraması", "STK Verileri", "Baro Komisyonları", "Kamu Kurumları"],
      required: true,
    },
  },
  { timestamps: true } // createdAt and updatedAt will be added automatically
);

export const DigitalArchiveModel = model<IDigitalArchive>("DigitalArchive", DigitalArchiveSchema);
*/
// Interface for the DigitalArchive schema
import { Schema, model, Document, Types } from "mongoose";

export interface IDigitalArchive extends Document {
  screeningPeriod?: string;
  eventCategory?: Types.ObjectId; // EventCategory reference
  eventSummary?: string;
  link?: string;
  fileUploads?: Array<{
    documentUrl: string;
    documentDescription: string;
  }>;
  source?: string | null;
  imageLink?: string | null;
  notificationInstitution?: string | null;
  commissionReceived?: string | null;
  publicInstitution?: string | null;
  type: "Media Screening" | "NGO Data" | "Bar Commissions" | "Public Institutions";

  // Rights Violation Details
  rightsViolationDetails?: {
    caseDetails: {
      date?: Date;
      person?: string;
      eventCategory?: Types.ObjectId;
    };
    caseSummary?: string;
    sourceDetails?: {
      type: "Media" | "NGO" | "Public" | "Bar";
      detail: string;
    };
  };
}

const DigitalArchiveSchema = new Schema<IDigitalArchive>(
  {
    screeningPeriod: { type: String, required: false },
    eventCategory: { type: Schema.Types.ObjectId, ref: "EventCategory", required: false },
    eventSummary: { type: String, required: false },
    link: { type: String, required: false },
    fileUploads: [
      {
        documentUrl: { type: String, required: true },
        documentDescription: { type: String, required: true },
      },
    ],
    source: { type: String, default: null },
    imageLink: { type: String, default: null },
    notificationInstitution: { type: String, default: null },
    commissionReceived: { type: String, default: null },
    publicInstitution: { type: String, default: null },
    type: {
      type: String,
      enum: ["Media Screening", "NGO Data", "Bar Commissions", "Public Institutions"],
      required: true,
    },

    // Rights Violation Details
    rightsViolationDetails: {
      caseDetails: {
        date: { type: Date },
        person: { type: String },
        eventCategory: { type: String },
      },
      caseSummary: { type: String },
      sourceDetails: {
        type: {
          type: String,
          enum: ["Media", "NGO", "Public", "Bar"],
        },
        detail: { type: String },
      },
    },
  },
  { timestamps: true }
);

export const DigitalArchiveModel = model<IDigitalArchive>("DigitalArchive", DigitalArchiveSchema);