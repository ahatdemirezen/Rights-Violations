import { ApplicationModel } from "../models/application-model";

export const getApplicationsByLawyer = async (lawyerId: string) => {
  if (!lawyerId) {
    throw new Error("Lawyer ID is required");
  }

  // ApplicationModel üzerinde `lawyer` alanı userId ile eşleşen başvuruları getir
  const applications = await ApplicationModel.find({ lawyer: lawyerId });

  if (!applications || applications.length === 0) {
    throw new Error("No applications found for this lawyer");
  }

  return applications;
};

export const getApplicationDetails = async (lawyerId: string, applicationId: string) => {
    if (!lawyerId) {
      throw new Error("Lawyer ID is required");
    }
  
    if (!applicationId) {
      throw new Error("Application ID is required");
    }
  
    // ApplicationModel üzerinde `lawyer` alanı userId ile eşleşen ve `_id` değerine sahip başvuruyu getir
    const application = await ApplicationModel.findOne({
      _id: applicationId,
      lawyer: lawyerId,
    });
  
    if (!application) {
      throw new Error("No application found with the given ID for this lawyer");
    }
  
    return application;
  };