  import { Schema, model, Document , Types } from 'mongoose';
  import { IApplication } from "../models/application-model";

  // Interface for the case tracking schema
  export interface ILawsuitTracking extends Document {
    applicationId: Types.ObjectId | IApplication; // Referans veya populate sonrası detaylar
    applicationNumber: number; // Başvuru numarası
    applicantName: string;
    courtFileNo: string;
    caseSubject: string; // Dava Konusu
    fileNumber: string; // Dosya No
    court: string; // Mahkeme
    files?: Types.ObjectId[]; // Reference to File schema
    lawsuitDate?: Date; // Dava oluşturulma tarihi
    caseNumber?: string; // Esas numarası
    resultDescription?: string; // Sonucu Açıklama (optional)
    resultStage?: string; // Sonucu Aşama (optional)
    archive?: boolean; // Arşiv durumu (true veya false)
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
 
      fileNumber: { type: String, required: false }, // Dosya No
      court: { type: String, required: false }, // Mahkeme
      files: [
          {
            type: Schema.Types.ObjectId,
            ref: 'File', // Reference to File model
          },
        ], // Dosyalar (birden fazla dosya referansı)
        lawsuitDate: { type: Date, required: false }, // Dava oluşturulma tarihi
        caseNumber: { type: String, required: false }, // Esas numarası
        resultDescription: { type: String, default: null }, // Sonucu Açıklama, optional
        resultStage: { type: String, default: null }, // Sonucu Aşama, optional
        archive: { type: Boolean, default: false }, // Arşiv durumu, varsayılan false
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );

  // Create and export the model
  export const LawsuitTrackingModel = model<ILawsuitTracking>('LawsuitTracking', LawsuitTrackingSchema);
