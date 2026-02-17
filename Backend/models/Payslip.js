import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: {
      type: String,
      required: true,
    },

    /* ================= SALARY STRUCTURE ================= */
    basicSalary: {
      type: Number,
      required: true,
    },

    hra: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },

    /* ================= BONUS ================= */
    bonus: {
      type: Number,
      default: 0,
    },

    /* ================= OVERTIME ================= */
    overtimeHours: {
      type: Number,
      default: 0,
    },
    overtimeRate: {
      type: Number,
      default: 0,
    },
    overtimePay: {
      type: Number,
      default: 0,
    },

    /* ================= DEDUCTIONS ================= */
    providentFund: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    lossOfPay: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },

    /* ================= REIMBURSEMENTS ================= */
    reimbursements: {
      type: Number,
      default: 0,
    },

    /* ================= CALCULATED VALUES ================= */
    grossSalary: {
      type: Number,
      required: true,
    },

    totalDeductions: {
      type: Number,
      required: true,
    },

    netSalary: {
      type: Number,
      required: true,
    },

    /* ================= PAYMENT STATUS ================= */
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    paymentDate: {
      type: Date,
    },

    payslipFile: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Payslip", payslipSchema);
