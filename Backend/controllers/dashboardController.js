import Employee from "../models/Employee.js";
import Client from "../models/Client.js";
import Department from "../models/Department.js";
import Leave from "../models/Leave.js";

const getSummary = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalClients = await Client.countDocuments();

    const totalAnnual = await Client.countDocuments({ planType: "annual" });
    const totalQuarterly = await Client.countDocuments({ planType: "quarterly" });

    // ===== LEAVE SUMMARY =====
    const employeeAppliedForLeave = await Leave.distinct("employeeId");

    const leaveStatus = await Leave.aggregate([
      {
        $group: {
          _id: { $toUpper: "$status" }, // normalize status text
          count: { $sum: 1 },
        },
      },
    ]);

    const leaveSummary = {
      appliedFor: employeeAppliedForLeave.length,
      approved: leaveStatus.find((i) => i._id === "APPROVED")?.count || 0,
      rejected: leaveStatus.find((i) => i._id === "REJECTED")?.count || 0,
      pending: leaveStatus.find((i) => i._id === "PENDING")?.count || 0,
    };

    // ===== DEPARTMENT SUMMARY (employees per department) =====
    const departmentSummary = await Employee.aggregate([
      {
        $group: {
          _id: "$department", // field in Employee model
          employees: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "dep",
        },
      },
      { $unwind: "$dep" },
      {
        $project: {
          department: "$dep.dep_name",
          employees: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      totalEmployees,
      totalDepartments,
      totalClients,
      totalAnnual,
      totalQuarterly,

      leaveSummary,
      departmentSummary,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Summary failed" });
  }
};

export { getSummary };