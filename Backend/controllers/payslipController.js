import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";
import uploadToImageKit from "../utils/uploadToImageKit.js";

/* ================= ADD PAYSLIP ================= */
export const addPayslip = async (req, res) => {
  try {
    const { employeeId, month, paymentStatus = "Paid" } = req.body;

    // 1. Sanitize all numeric inputs (Converts strings from form to actual Numbers)
    const basicSalary = Number(req.body.basicSalary || 0);
    const hra = Number(req.body.hra || 0);
    const conveyanceAllowance = Number(req.body.conveyanceAllowance || 0);
    const medicalAllowance = Number(req.body.medicalAllowance || 0);
    const otherAllowances = Number(req.body.otherAllowances || 0);
    const bonus = Number(req.body.bonus || 0);
    const overtimeHours = Number(req.body.overtimeHours || 0);
    const overtimeRate = Number(req.body.overtimeRate || 0);
    
    const providentFund = Number(req.body.providentFund || 0);
    const professionalTax = Number(req.body.professionalTax || 0);
    const incomeTax = Number(req.body.incomeTax || 0);
    const lossOfPay = Number(req.body.lossOfPay || 0); // <--- NEW FIELD
    const otherDeductions = Number(req.body.otherDeductions || 0);
    const reimbursements = Number(req.body.reimbursements || 0);

    // 2. Validations
    if (!employeeId || !month || basicSalary <= 0) {
      return res.status(400).json({ success: false, message: "Missing required fields: Employee ID, Month, or Basic Salary" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payslip PDF file is required" });
    }

    // 3. Final Calculations
    const overtimePay = overtimeHours * overtimeRate;

    const grossSalary = 
      basicSalary + hra + conveyanceAllowance + 
      medicalAllowance + otherAllowances + bonus + 
      overtimePay + reimbursements;

    const totalDeductions = 
      providentFund + professionalTax + incomeTax + lossOfPay + otherDeductions;

    const netSalary = grossSalary - totalDeductions;

    // 4. File Upload
    const payslipFile = await uploadToImageKit(req.file, "payslips");

    // 5. Create Record in MongoDB
    const payslip = await Payslip.create({
      employee: employeeId,
      month,
      basicSalary,
      hra,
      conveyanceAllowance,
      medicalAllowance,
      otherAllowances,
      bonus,
      overtimeHours,
      overtimeRate,
      overtimePay,
      providentFund,
      professionalTax,
      incomeTax,
      lossOfPay, // <--- SAVED TO DB
      otherDeductions,
      reimbursements,
      grossSalary,
      totalDeductions,
      netSalary,
      paymentStatus,
      paymentDate: paymentStatus === "Paid" ? new Date() : null,
      payslipFile,
    });

    res.status(201).json({ success: true, payslip });
  } catch (err) {
    console.error("ADD PAYSLIP 500 ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

/* ================= GET HISTORY ================= */
export const getPayslipsByEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const payslips = await Payslip.find({ employee: id }).sort({ createdAt: -1 });
    res.json({ success: true, payslips });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};