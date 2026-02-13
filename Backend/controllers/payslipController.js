import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";
import uploadToImageKit from "../utils/uploadToImageKit.js";

/* ================= ADD PAYSLIP ================= */
const addPayslip = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      basicSalary,
      allowances,
      deductions,
    } = req.body;

    if (!employeeId || !month || !basicSalary) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "Payslip PDF is required",
      });
    }

    const payslipFile = await uploadToImageKit(req.file, "payslips");

    const netSalary =
      Number(basicSalary) +
      Number(allowances || 0) -
      Number(deductions || 0);

    const payslip = await Payslip.create({
      employee: employee._id,
      month,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      payslipFile,
    });

    res.status(201).json({
      success: true,
      payslip,
    });
  } catch (err) {
    console.error("ADD PAYSLIP ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ================= GET PAYSLIPS BY EMPLOYEE ================= */
const getPayslipsByEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const payslips = await Payslip.find({ employee: id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payslips,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export {
  addPayslip,
  getPayslipsByEmployee,
};