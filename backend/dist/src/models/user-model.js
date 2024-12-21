"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.Gender = exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
// Enum for user roles
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["Lawyer"] = "lawyer";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender["Male"] = "male";
    Gender["Female"] = "female";
})(Gender || (exports.Gender = Gender = {}));
// Define the Mongoose schema
const UserSchema = new mongoose_1.Schema({
    roles: {
        type: [String], // Array of roles
        enum: Object.values(UserRole), // Restrict values to 'admin' or 'lawyer'
        required: true,
    },
    name: { type: String, required: true }, // User's full name, required
    password: { type: String, required: true }, // Password, required
    email: {
        type: String,
        required: function () { return this.roles.includes(UserRole.Lawyer); }, // Only required for lawyers
        unique: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter a valid email'],
    },
    nationalID: { type: String, required: false, unique: true, minlength: 11, maxlength: 11 },
    gender: {
        type: String, // Gender field
        enum: Object.values(Gender), // Restrict values to 'male' or 'female'
        required: false, // Gender is required
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
// Create and export the model
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
