import express, { Request, Response, NextFunction } from "express";
import connectDB from "./config/db";
import * as dotenv from "dotenv";
import cors from "cors";
import loginRoute from "./routes/baro-login-route";
import cookieParser from "cookie-parser"; // Cookie-parser'ı import ediyoruz
import lawyerRoute from "./routes/lawyer-route"
import lawsuitTrackingRoutes from "./routes/lawsuit-tracking-route"
import applicationRoutes from "./routes/application-route"
import applicationForLawyerRoutes from "./routes/applicationForLawyer-route"
import lawsuitTrackingLawyerRoutes from "./routes/lawsuit-trackingForLawyer-route"
import documentRoutes from "./routes/document-route"
import citizenApplicationRoute from "./routes/citizen-route";
import { authenticateAdmin } from "./middleware/admin-auth";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173" , process.env.WEB_URL || "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Credentials ile ilgili isteklere izin ver
  })
);


// Middleware: JSON body parsing
app.use(express.json()); // JSON verileri alabilmek için
app.use(cookieParser()); // Cookie'leri kullanabilmek için cookie parser middleware'i kullan

// Ana sayfa rotası
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Homepage!");
});

// API rotaları
app.use("/api/login", loginRoute);
app.use("/api/lawyer",  lawyerRoute);
app.use("/api/lawsuittracking" , authenticateAdmin , lawsuitTrackingRoutes)
app.use('/api/applications', authenticateAdmin , applicationRoutes);
app.use('/api/lawyerapplication', applicationForLawyerRoutes )
app.use("/api/citizen/create", citizenApplicationRoute);
app.use('/api/lawyer-lawsuits' , lawsuitTrackingLawyerRoutes)
app.use('/api/documents' , authenticateAdmin , documentRoutes )

// Hataları yakalayan middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Hatanın detaylarını konsola yazdır
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message, // Hatanın mesajını kullanıcıya dönebiliriz
  });
});

// 404 hatalarını yakalayan middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found.",
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5002;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
