import { Request, Response } from "express";
import { ApplicationModel } from "../models/application-model";
import { DocumentModel } from "../models/document-model";
import { deleteFileFromS3, uploadToS3 } from "../controllers/S3-controller";
import { Types } from "mongoose"; // `Types` import edildi
import { EventCategoryModel } from "../models/eventCategory-model";

export const createApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        applicantName,
        nationalID,
        applicationType,
        applicationDate,
        address,
        phoneNumber,
        complaintReason,
        eventCategories,
        organizationName,
        links,
      } = req.body;
  
      const descriptions = req.body.description; // Doküman açıklamaları (array olarak gelmeli)
      const types = req.body.type; // Doküman türleri (array olarak gelmeli)
      const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar
  
      // Validasyon
      if (!applicantName || !nationalID || !applicationType || !applicationDate) {
        res.status(400).json({ error: "Başvuru için gerekli tüm alanları doldurmalısınız." });
        return;
      }
  
      if (applicationType === "organization" && !organizationName) {
        res.status(400).json({ error: "Kurum başvuruları için kurum adı zorunludur." });
        return;
      }
  
      if (!descriptions || !types || (Array.isArray(descriptions) && Array.isArray(types) && descriptions.length !== types.length)) {
        res.status(400).json({ error: "Açıklama ve tür alanları eksik veya uyumsuz." });
        return;
    }
    
      const applicationNumber = await ApplicationModel.countDocuments() + 1;
      const savedDocuments = await processDocuments(descriptions, types, files,links);

      
  // EventCategory isimlerini ObjectId'lere dönüştürme
  const categoryIds = await EventCategoryModel.find({
    name: { $in: eventCategories },
  }).select("_id name");
  
  if (!categoryIds || categoryIds.length === 0) {
    res.status(400).json({ error: "Hiçbir kategori ismi bulunamadı." });
    return;
  }

      const newApplication = new ApplicationModel({
        applicationNumber,
        applicantName,
        nationalID,
        applicationType,
        organizationName: applicationType === "organization" ? organizationName : undefined,
        applicationDate,
        address,
        phoneNumber,
        complaintReason,
      eventCategories: categoryIds.map((cat) => cat._id), // ObjectId'leri kullan
        documents: savedDocuments,
      });
  
      const savedApplication = await newApplication.save();
  
      res.status(201).json({ message: "Başvuru başarıyla oluşturuldu.", application: savedApplication });
    } catch (error: any) {
      console.error("Hata:", error.message);
      res.status(500).json({ error: "Başvuru oluşturulurken hata oluştu.", details: error.message });
    }
  };
  
// Tüm başvuruları listeleme (GET)
export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType } = req.query;

    const documentFilter = documentType ? { "documents.type": documentType } : {};
    const applications = await ApplicationModel.find(documentFilter)
      .populate("eventCategories")
      .populate({
        path: "documents",
        match: documentType ? { "documents.type": documentType } : {},
      });

    if (!applications.length) {
       res.status(404).json({ message: "Hiç başvuru bulunamadı." });
    }

    res.status(200).json({ applications });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Başvurular getirilirken hata oluştu." });
  }
};

// Tek başvuru getirme (GET)
export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const application = await ApplicationModel.findById(id)
      .populate("eventCategories")
      .populate("documents");

    if (!application) {
       res.status(404).json({ error: "Başvuru bulunamadı." });
    }

    res.status(200).json({ application });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Başvuru getirilirken hata oluştu." });
  }
};

export const updateApplication = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
  
    const {
      applicantName,
      nationalID,
      receivedBy,
      applicationType,
      applicationDate,
      address,
      phoneNumber,
      complaintReason,
      eventCategories,
      organizationName,
    } = req.body;
  
    const descriptions = req.body.description; // Doküman açıklamaları (array olarak gelmeli)
    const types = req.body.type; // Doküman türleri (array olarak gelmeli)
    const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar
  
    try {
      const updatedFields: any = {
        ...(applicantName && { applicantName }),
        ...(nationalID && { nationalID }),
        ...(receivedBy && { receivedBy }),
        ...(applicationType && { applicationType }),
        ...(applicationType === "organization" && organizationName && { organizationName }),
        ...(applicationType === "individual" && { organizationName: undefined }),
        ...(applicationDate && { applicationDate }),
        ...(address && { address }),
        ...(phoneNumber && { phoneNumber }),
        ...(complaintReason && { complaintReason }),
        ...(eventCategories && { eventCategories: JSON.parse(eventCategories) }),
      };
  
      if (descriptions && types && descriptions.length === types.length) {
        updatedFields.documents = await processDocuments(descriptions, types, files);
      }
  
      const updatedApplication = await ApplicationModel.findByIdAndUpdate(id, updatedFields, {
        new: true,
        runValidators: true,
      });
  
      res.status(200).json({ message: "Başvuru başarıyla güncellendi.", application: updatedApplication });
    } catch (error: any) {
      console.error("Hata:", error.message);
      res.status(500).json({ error: "Başvuru güncellenirken hata oluştu.", details: error.message });
    }
  };
  
// Başvuru silme (DELETE)
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const application = await ApplicationModel.findById(id).populate("documents");

    if (!application) {
       res.status(404).json({ error: "Başvuru bulunamadı." });
       return;
    }

    for (const documentId of application.documents) {
      const document = await DocumentModel.findById(documentId);

      if (document) {
        for (const doc of document.documents) {
          if (doc.documentUrl) {
            await deleteFileFromS3(doc.documentUrl);
          }
        }

        await DocumentModel.findByIdAndDelete(documentId);
      }
    }

    await ApplicationModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Başvuru ve ilgili dokümanlar başarıyla silindi." });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Başvuru silinirken hata oluştu.", details: error.message });
  }
};

const processDocuments = async (
    descriptions: string | string[],
    types: string | string[],
    files: Express.Multer.File[],
    links: string | string[] = [] // Linkler için ek bir parametre
): Promise<Types.ObjectId[]> => {
    const savedDocuments: Types.ObjectId[] = [];
    const descriptionsArray = Array.isArray(descriptions) ? descriptions : [descriptions];
    const typesArray = Array.isArray(types) ? types : [types];
    const linksArray = Array.isArray(links) ? links : [links];

    // Dosyaları işleyelim
    for (let i = 0; i < files.length; i++) {
        const description = descriptionsArray[i] || `Document ${i + 1}`;
        const type = typesArray[i] || "Other";

        if (!["Media Screening", "NGO Data", "Bar Commissions", "Public Institutions", "Other"].includes(type)) {
            throw new Error("Geçersiz doküman türü. Geçerli türler: Media Screening, NGO Data, Bar Commissions, Public Institutions, Other.");
        }

        const s3Response = await uploadToS3(files[i]);
        const documentUrl = s3Response.files[0]?.url;

        if (!documentUrl) {
            throw new Error("Dosya yükleme başarısız oldu.");
        }

        const newDocument = new DocumentModel({
            documents: [{ documentDescription: description, type, documentUrl }],
        });

        const savedDocument = await newDocument.save();
        savedDocuments.push(savedDocument._id as Types.ObjectId);
    }

    // Linkleri işleyelim
    for (let i = 0; i < linksArray.length; i++) {
        const description = descriptionsArray[files.length + i] || `Link ${i + 1}`;
        const type = typesArray[files.length + i] || "Other";

        if (!["Media Screening", "NGO Data", "Bar Commissions", "Public Institutions", "Other"].includes(type)) {
            throw new Error("Geçersiz doküman türü. Geçerli türler: Media Screening, NGO Data, Bar Commissions, Public Institutions, Other.");
        }

        const documentUrl = linksArray[i];

        const newDocument = new DocumentModel({
            documents: [{ documentDescription: description, type, documentUrl }],
        });

        const savedDocument = await newDocument.save();
        savedDocuments.push(savedDocument._id as Types.ObjectId);
    }

    return savedDocuments;
};