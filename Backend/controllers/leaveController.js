import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";

const addLeave = async (req, res) => {
  try {
    console.log("REQ.USER ===>", req.user);
    console.log("REQ.BODY ===>", req.body);

    const { leaveType, startDate, endDate, reason } = req.body;

    const userId = req.user._id;

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found for this user" });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    return res.status(200).json({ success: true, leave });
  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
};

const getLeave = async (req, res) => {
    try {
        const {id, role} = req.params;
        let leaves
        if(role === "admin") {
           leaves = await Leave.find({employeeId: id})
        } else {
           const employee = await Employee.findOne({userId: id})
           leaves = await Leave.find({employeeId: employee._id})
        }
       
        return res.status(200).json({ success: true, leaves });
    } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
}

const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate({
           path: "employeeId",
           populate: [
              {
                 path: 'department',
                 select: 'dep_name'
              },
              {
                 path: 'userId',
                 select: 'name'
              }
           ]
        })
        return res.status(200).json({ success: true, leaves });
    } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
}

const getLeaveDetail = async (req, res) => {
   try {
        const {id} = req.params;
        const leave = await Leave.findById({_id:id}).populate({
           path: "employeeId",
           populate: [
              {
                 path: 'department',
                 select: 'dep_name'
              },
              {
                 path: 'userId',
                 select: 'name profileImage'
              }
           ]
        })
        return res.status(200).json({ success: true, leave });
    } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
}

const updateLeave = async (req, res) => {
  try {
        const {id} = req.params;
        const leave = await Leave.findByIdAndUpdate({_id: id}, {status: req.body.status})
        if(!leave) {
          return res.status(404).json({ success: false, error: "Leave not found" });
        }
        return res.status(200).json({ success: true, leave });
    } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
}

export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave };