import Employee from "../models/Employee.js"
import Department from "../models/Department.js"
import Leave from "../models/Leave.js";

const getSummary = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();

        const totalDepartments = await Department.countDocuments();

        const employeeAppliedForLeave = await Leave.distinct('employeeId')

        const leaveStatus = await Leave.aggregate([
            {$group: {
                _id: "$status",
                count: {$sum: 1}
            }}
        ])

        const leaveSummary = {
            appliedFor: employeeAppliedForLeave.length,
            approved: leaveStatus.find(item => item._id === "Approved")?.count || 0,
            rejected: leaveStatus.find(item => item._id === "Rejected")?.count || 0,
            pending: leaveStatus.find(item => item._id === "Pending")?.count || 0,
        }

        return res.status(200).json({
            totalEmployees,
            totalDepartments,
            leaveSummary
        })
    } catch(error) {
        return res.status(500).json({success: false, error: error.message})
    }
}

export {getSummary}