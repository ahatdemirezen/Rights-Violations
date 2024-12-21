"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModel = exports.FileType = void 0;
const mongoose_1 = require("mongoose");
// Enum for file types
var FileType;
(function (FileType) {
    FileType["HearingReport"] = "Hearing Report";
    FileType["Petition"] = "Petition";
    FileType["HearingMinutes"] = "Hearing Minutes";
    FileType["Indictment"] = "Indictment";
})(FileType || (exports.FileType = FileType = {}));
// Define the Mongoose schema
const FileSchema = new mongoose_1.Schema({
    fileType: {
        type: String,
        enum: Object.values(FileType), // Restrict file type to specific values
        required: false,
    },
    fileUrl: { type: String, required: false }, // File URL (e.g., S3 link)
    description: { type: String, default: null }, // Optional description
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
// Create and export the model
exports.FileModel = (0, mongoose_1.model)('File', FileSchema);
