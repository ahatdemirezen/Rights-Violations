import { DocumentModel } from "../models/document-model";
import { Types } from "mongoose";
import { uploadToS3 } from "../controllers/S3-controller";

// Yardımcı Fonksiyon: DocumentModel Kaydet
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

  // Dosyaları İşle
  for (let i = 0; i < files.length; i++) {
    const description = descriptions.files[i] || `Document ${i + 1}`;
    const type = types.files[i] || "Other";
    const s3Response = await uploadToS3(files[i]);
    const documentUrl = s3Response.files[0]?.url;

    const newDocument = new DocumentModel({
      documents: [{ documentDescription: description, type, documentUrl }],
    });

    const savedDocument = await newDocument.save();
    savedDocuments.push(savedDocument._id as Types.ObjectId);
  }

  // Linkleri İşle
  for (let i = 0; i < links.length; i++) {
    const description = descriptions.links[i] || `Link ${i + 1}`;
    const type = types.links[i] || "Other";

    const documentUrl = links[i];
    if (!documentUrl) continue; // Boş link varsa atla

    const newDocument = new DocumentModel({
      documents: [
        {
          documentType: "link",
          documentSource: documentUrl,
          documentUrl,
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
