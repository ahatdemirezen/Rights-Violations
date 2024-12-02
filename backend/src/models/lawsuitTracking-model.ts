import { Schema, model, Document , Types } from 'mongoose';

// Interface for the case tracking schema
export interface ILawsuitTracking extends Document {
  partyName: string; // Taraf Adı Soyadı
  oppositLawyer?: string | null; // Avukat (optional)
  applicationNumber: Types.ObjectId; // Reference to Application schema
  caseSubject: string; // Dava Konusu
  fileNumber: string; // Dosya No
  court: string; // Mahkeme
  indictmentUrl?: string | null; // İddianame için S3 URL (optional)
  createdAt?: Date; // Automatically added timestamp
  updatedAt?: Date; // Automatically updated timestamp
}

// Define the Mongoose schema
const LawsuitTrackingSchema = new Schema<ILawsuitTracking>(
    {
    partyName: { type: String, required: true }, // Taraf Adı Soyadı
    oppositLawyer: { type: String, default: null }, // Avukat
    applicationNumber: {
        type: Schema.Types.ObjectId, // ObjectId olarak ayarlandı
        ref: 'Application', // Reference to the Application model
        required: true,
      }, // Başvuru No (Reference to Application)    
    caseSubject: { type: String, required: true }, // Dava Konusu
    fileNumber: { type: String, required: true }, // Dosya No
    court: { type: String, required: true }, // Mahkeme
    indictmentUrl: { type: String, default: null }, // İddianame için S3 URL
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const LawsuitTrackingModel = model<ILawsuitTracking>('LawsuitTracking', LawsuitTrackingSchema);
