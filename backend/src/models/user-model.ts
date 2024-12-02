import { Schema, model, Document } from 'mongoose';

// Enum for user roles
export enum UserRole {
  Admin = 'admin',
  Lawyer = 'lawyer',
}

// Interface for the user schema
export interface IUser extends Document {
  roles: UserRole[]; // User roles (can have multiple roles)
  name: string; // Full name (name and surname)
  password: string; // Password for authentication
  createdAt?: Date; // Timestamp for creation
  updatedAt?: Date; // Timestamp for last update
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const UserModel = model<IUser>('User', UserSchema);
