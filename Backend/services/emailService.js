import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Configure Nodemailer transporter (requires EMAIL_USER and EMAIL_PASS in .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (user, employee) => {
  // Generate a special 24-hour setup token
  const setupToken = jwt.sign(
    { _id: user._id, role: user.role, type: "setup" },
    process.env.JWT_KEY,
    { expiresIn: "24h" }
  );

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const setupLink = `${frontendUrl}/setup-password?token=${setupToken}`;

  const mailOptions = {
    from: `"Hakirush Portal" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Welcome to Hakirush Portal - Setup Your Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #7A2233; text-align: center;">Welcome to Hakirush, ${user.name}!</h2>
        <p>Your employee account has been successfully created.</p>
        <p><strong>Department:</strong> ${employee.department ? "Assigned" : "Pending"}</p>
        <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
        <br/>
        <p>To access the Hakirush Web Portal and Mobile App, please set up your secure password by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupLink}" style="background-color: #7A2233; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up My Password</a>
        </div>
        <p style="font-size: 12px; color: #888; text-align: center;">This link expires in 24 hours. If you did not expect this email, please contact your administrator.</p>
      </div>
    `,
  };

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("WARNING: EMAIL_USER or EMAIL_PASS not configured in .env. Skipping welcome email.");
    console.log("Mock Setup Link:", setupLink);
    return;
  }

  await transporter.sendMail(mailOptions);
};
