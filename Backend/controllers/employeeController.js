import multer from "multer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import path from "path";
import Leave from "../models/Leave.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const addEmployee = async (req, res) => {
  try {
    const { name, email, employeeId, dob, gender, maritalStatus, department, salary, password, role, bloodGroup } = req.body;

    if (!name || !email || !employeeId || !department || !salary || !password || !role) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage: req.file?.filename || ""
    });

    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      dob: dob ? new Date(dob) : undefined,
      gender,
      maritalStatus,
      department,
      salary: Number(salary),
      bloodGroup,
      dateOfJoining: new Date()
    });

    return res.status(201).json({ success: true, message: "Employee created successfully", employee });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "-password")
      .populate("department");

    return res.status(200).json({ success: true, employees });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id)
      .populate("userId", "-password")
      .populate("department");

    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate("userId", "-password")
        .populate("department");
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, employee });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, maritalStatus, salary } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    await User.findByIdAndUpdate(employee.userId, { name });
    await Employee.findByIdAndUpdate(id, { maritalStatus, salary });

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await User.findByIdAndDelete(employee.userId);
    await Employee.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getEmployeesByDepartment = async (req, res) => {
  try {
    const emp = await Employee.findOne({ userId: req.user._id });

    if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });

    const employees = await Employee.find({ department: emp.department })
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name");

    return res.status(200).json({ success: true, employees });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getNewEmployees = async (req, res) => {
  try {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

    const employees = await Employee.find({
      $or: [
        { dateOfJoining: { $gte: THIRTY_DAYS_AGO } },     
        { createdAt: { $gte: THIRTY_DAYS_AGO } }          
      ]
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return res.status(200).json({
      success: true,
      employees
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getLeaveBalance = async (req, res) => {
  try {
    const emp = await Employee.findOne({ userId: req.user._id });

    const approved = await Leave.countDocuments({
      employeeId: emp._id,
      status: "Approved"
    });

    const total = 24;
    const balance = total - approved;

    return res.status(200).json({
      success: true,
      total,
      used: approved,
      balance
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  upload,
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getNewEmployees,
  getLeaveBalance
};
