import { Schema, model, Document , Types } from 'mongoose';

// Interface for the case tracking schema
export interface ILawsuitTracking extends Document {
  applicationId: Types.ObjectId; // Reference to Application schema
  applicationNumber: number; // Başvuru numarası
  applicantName: string;
  courtFileNo: string;
  caseSubject: string; // Dava Konusu
  lawyer?: string | null; // Davayı Takip Eden Avukat
  fileNumber: string; // Dosya No
  court: string; // Mahkeme
  files?: Types.ObjectId[]; // Reference to File schema
  createdAt?: Date; // Automatically added timestamp
  updatedAt?: Date; // Automatically updated timestamp
}

// Define the Mongoose schema
const LawsuitTrackingSchema = new Schema<ILawsuitTracking>(
    {
      applicationId: {  
        type: Schema.Types.ObjectId, // `ObjectId` olarak ayarlandı
        ref: 'Application', // `Application` modeline referans
        required: true,
      },
      applicationNumber: {
        type: Number, // Başvuru numarası, `Application` modelinden alınacak
        required: true,
      },
      applicantName: {
        type : String,
        required: true,
      },
    courtFileNo: { type: String , required: false },
    caseSubject: { type: String, required: false }, // Dava Konusu
    lawyer: { type: String, default: null }, // Davayı Takip Eden Avukat

    fileNumber: { type: String, required: false }, // Dosya No
    court: { type: String, required: false }, // Mahkeme
    files: [
        {
          type: Schema.Types.ObjectId,
          ref: 'File', // Reference to File model
        },
      ], // Dosyalar (birden fazla dosya referansı)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const LawsuitTrackingModel = model<ILawsuitTracking>('LawsuitTracking', LawsuitTrackingSchema);
