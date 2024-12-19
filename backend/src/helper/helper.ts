import { DocumentModel } from "../models/document-model";
import { Types } from "mongoose";
import { uploadToS3 } from "../controllers/S3-controller";

export const saveDocument = async (
  documentType: "files" | "link",
  documentData: {
    description: string;
    type: string;
    url?: string;
    source?: string;
  }
): Promise<Types.ObjectId> => {
  const { description, type, url, source } = documentData;

  const documentObject = {
    documentType,
    documentDescription: description,
    type,
    ...(documentType === "files" && url ? { documentUrl: url } : {}),
    ...(documentType === "link" && source ? { documentSource: source } : {}),
  };

  const newDocument = new DocumentModel({
    documents: [documentObject],
  });

  const savedDocument = await newDocument.save();
  return savedDocument._id as Types.ObjectId;
};



export const processDocuments = async (
  descriptions: { files: string[]; links: string[] },
  types: { files: string[]; links: string[] },
  files: Express.Multer.File[],
  links: string[] = []
): Promise<Types.ObjectId[]> => {
  const savedDocuments: Types.ObjectId[] = [];

  // Dosyaları işle
  for (let i = 0; i < files.length; i++) {
    const description = descriptions.files[i] || `Document ${i + 1}`;
    const type = types.files[i] || "Other";

    const s3Response = await uploadToS3(files[i]); // AWS S3'e yükle
    const documentUrl = s3Response.signedUrl;

    const newDocument = new DocumentModel({
      documents: [
        {
          documentType: "files", // Dosya türünü otomatik olarak 'files' yap
          documentUrl,
          documentDescription: description,
          type,
        },
      ],
    });

    const savedDocument = await newDocument.save();
    savedDocuments.push(savedDocument._id as Types.ObjectId);
  }

  // Linkleri işle
  for (let i = 0; i < links.length; i++) {
    const description = descriptions.links[i] || `Link ${i + 1}`;
    const type = types.links[i] || "Other";
    const documentSource = links[i];

    const newDocument = new DocumentModel({
      documents: [
        {
          documentType: "link",
          documentSource,
          documentDescription: description,
          type,
        },
      ],
    });

    const savedDocument = await newDocument.save();
    savedDocuments.push(savedDocument._id as Types.ObjectId);
  }

  return savedDocuments;
};