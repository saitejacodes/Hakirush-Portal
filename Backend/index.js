import express from "express";
import cors from "cors";
import path from "path";
import connectToDatabase from "./db/db.js";
import { fileURLToPath } from "url";
import startAttendanceCron from "./utils/attendanceCron.js";

import authRouter from "./routes/authRoute.js";
import departmentRouter from "./routes/departmentRoute.js";
import employeeRouter from "./routes/employeeRoute.js";
import clientRouter from "./routes/clientRoute.js";
import leaveRouter from "./routes/leaveRoute.js";
import settingRouter from "./routes/settingRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js"
import dashboardRouter from "./routes/dashboardRoute.js";
import holidayRouter from "./routes/holidayRoute.js";
import sponsorRouter from "./routes/sponsorRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import stallRoutes from "./routes/stallRoutes.js";
import payslipRoutes from "./routes/payslipRoutes.js";
import attendanceRequestRouter from "./routes/attendanceRequestRoutes.js";
import notificationRoute from "./routes/notificationRoute.js";

connectToDatabase();

const app = express();

startAttendanceCron();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({
   origin: "https://hakirush-portal.vercel.app",
   credentials: true
}));

app.use(express.static(path.join(__dirname, "public")));  


app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/client", clientRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/setting", settingRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/holiday", holidayRouter);
app.use("/api/sponsors", sponsorRouter);
app.use("/api/stalls", stallRoutes);
app.use("/api/payslip", payslipRoutes);
app.use("/api/attendance-request", attendanceRequestRouter);
app.use("/api/notifications", notificationRoute);

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend is working!" });
});
app.use("/api/announcements", announcementRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on port ${process.env.PORT}`);
});
