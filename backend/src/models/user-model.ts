import { Schema, model, Document , Types} from 'mongoose';

// Enum for user roles
export enum UserRole {
  Admin = 'admin',
  Lawyer = 'lawyer',
}
export enum Gender {
  Male = 'male',
  Female = 'female',
}
// Interface for the user schema
export interface IUser extends Document {
  _id: Types.ObjectId; // or string
  roles: UserRole[]; // User roles (can have multiple roles)
  name: string; // Full name (name and surname)
  password: string; // Password for authentication
  createdAt?: Date; // Timestamp for creation
  updatedAt?: Date; // Timestamp for last update
  nationalID: string;
  gender: Gender; // Gender: Male or Female

}

// Define the Mongoose schema
const UserSchema = new Schema<IUser>(
  {
    roles: {
      type: [String], // Array of roles
      enum: Object.values(UserRole), // Restrict values to 'admin' or 'lawyer'
      required: true,
    },
    name: { type: String, required: true }, // User's full name, required
    password: { type: String, required: true }, // Password, required
    nationalID: { type: String, required: false, unique: true, minlength: 11, maxlength: 11 },
    gender: {
      type: String, // Gender field
      enum: Object.values(Gender), // Restrict values to 'male' or 'female'
      required: false, // Gender is required
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const UserModel = model<IUser>('User', UserSchema);
