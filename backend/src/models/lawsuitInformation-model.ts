import { Schema, model, Document , Types } from 'mongoose';

// Interface for the Lawsuit Information schema
export interface ILawsuitInformation extends Document {
  fileNumber: Types.ObjectId; // Reference to LawsuitTracking schema
  court: string; // Mahkeme
  courtFileNumber: string; // Mahkeme Dosya No
  resultDescription?: string; // Sonucu Açıklama (optional)
  resultStage?: string; // Sonucu Aşama (optional)
  createdAt?: Date; // Automatically added timestamp
  updatedAt?: Date; // Automatically updated timestamp
}

// Define the Mongoose schema
const LawsuitInformationSchema = new Schema<ILawsuitInformation>(
  {
    fileNumber: {
        type: Schema.Types.ObjectId,
        ref: 'LawsuitTracking', // Reference to LawsuitTracking model
        required: true,
      }, // Dosya No, required and references LawsuitTracking  
    court: { type: String, required: true }, // Mahkeme, required
    courtFileNumber: { type: String, required: true }, // Mahkeme Dosya No, required
    resultDescription: { type: String, default: null }, // Sonucu Açıklama, optional
    resultStage: { type: String, default: null }, // Sonucu Aşama, optional
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const LawsuitInformationModel = model<ILawsuitInformation>('LawsuitInformation', LawsuitInformationSchema);
