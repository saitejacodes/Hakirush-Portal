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

export const sendLeaveRequestToManagerEmail = async (managerUser, employee, leave) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const loginLink = `${frontendUrl}/login`;

  const mailOptions = {
    from: `"Hakirush Portal" <${process.env.EMAIL_USER}>`,
    to: managerUser.email,
    subject: `Leave Request: ${employee.name} (${leave.days} days)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #7A2233; text-align: center;">New Leave Request</h2>
        <p>Hello ${managerUser.name},</p>
        <p><strong>${employee.name}</strong> has requested a <strong>${leave.leaveType}</strong>.</p>
        <ul>
          <li><strong>Duration:</strong> ${leave.days} days</li>
          <li><strong>Reason:</strong> ${leave.reason || "N/A"}</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" style="background-color: #7A2233; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review in Portal</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions).catch(console.error);
};

export const sendLeaveRequestToAdminEmail = async (employee, leave) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const loginLink = `${frontendUrl}/login`;

  try {
    const User = (await import("../models/User.js")).default;
    const admins = await User.find({ role: "admin" }).select("email").lean();
    if (!admins.length) return;

    const mailOptions = {
      from: `"Hakirush Portal" <${process.env.EMAIL_USER}>`,
      to: admins.map((a) => a.email).join(","),
      subject: `Manager Leave FYI: ${employee.name} (${leave.days} days)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7A2233; text-align: center;">Manager Leave Taken</h2>
          <p>Hello Admin,</p>
          <p>This is an automated notification. The manager <strong>${employee.name}</strong> has applied for <strong>${leave.leaveType}</strong>.</p>
          <p><em>As a manager, this leave has been automatically approved.</em></p>
          <ul>
            <li><strong>Duration:</strong> ${leave.days} days</li>
            <li><strong>Reason:</strong> ${leave.reason || "N/A"}</li>
          </ul>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};

export const sendLeaveStatusEmail = async (employeeUser, leave, status, managerName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const color = status === "Approved" ? "#2E7D32" : "#C62828";
  
  const mailOptions = {
    from: `"Hakirush Portal" <${process.env.EMAIL_USER}>`,
    to: employeeUser.email,
    subject: `Leave Request ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: ${color}; text-align: center;">Leave ${status}</h2>
        <p>Hello ${employeeUser.name},</p>
        <p>Your request for <strong>${leave.leaveType}</strong> (${leave.days} days) has been <strong>${status}</strong> by ${managerName}.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions).catch(console.error);
};
