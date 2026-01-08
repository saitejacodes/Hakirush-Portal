import Employee from "../models/Employee.js";
import Client from "../models/Client.js";
import Department from "../models/Department.js";
import Leave from "../models/Leave.js";
import Sponsor from "../models/Sponsor.js";

const getSummary = async (req, res) => {
  try {
    /* ========== BASIC COUNTS ========== */
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalSponsors = await Sponsor.countDocuments();

    const totalAnnual = await Client.countDocuments({ planType: "annual" });
    const totalQuarterly = await Client.countDocuments({ planType: "quarterly" });

    /* ========== LEAVE SUMMARY ========== */
    const employeeAppliedForLeave = await Leave.distinct("employeeId");

    const leaveStatus = await Leave.aggregate([
      {
        $group: {
          _id: { $toUpper: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const leaveSummary = {
      appliedFor: employeeAppliedForLeave.length,
      approved: leaveStatus.find(i => i._id === "APPROVED")?.count || 0,
      rejected: leaveStatus.find(i => i._id === "REJECTED")?.count || 0,
      pending: leaveStatus.find(i => i._id === "PENDING")?.count || 0,
    };

    /* ========== DEPARTMENT SUMMARY ========== */
    const departmentSummary = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
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

    /* ========== SPONSOR SUMMARY (FINAL FIX) ========== */
const sponsors = await Sponsor.find();

const totalSponsoredEvents = sponsors.reduce(
  (sum, s) => sum + Number(s.eventsSponsored || 0),
  0
);

const collaborationSummary = sponsors.reduce((acc, s) => {
  const key = s.collaboration || "Unknown";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const sponsorSummary = {
  totalSponsors,
  totalSponsoredEvents,
  collaborationSummary,
};


    /* ========== RESPONSE ========== */
    return res.status(200).json({
      success: true,

      totalEmployees,
      totalDepartments,
      totalClients,
      totalSponsors,

      totalAnnual,
      totalQuarterly,

      leaveSummary,
      departmentSummary,
      sponsorSummary,
    });

  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export { getSummary };