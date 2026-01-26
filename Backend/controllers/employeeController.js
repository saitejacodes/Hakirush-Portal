import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Leave from "../models/Leave.js";
import uploadToImageKit from "../utils/uploadToImageKit.js";

/* ================= ADD EMPLOYEE ================= */
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      department,
      designation,
      salary,
      password,
      role,
      bloodGroup,
    } = req.body;

    if (!name || !email || !employeeId || !department || !designation || !salary || !password || !role) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImage = "";
    if (req.file?.buffer) {
      profileImage = await uploadToImageKit(req.file, "employees");
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage,
    });

    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      dob: dob ? new Date(dob) : undefined,
      gender,
      maritalStatus,
      department,
      designation,
      salary: Number(salary),
      bloodGroup,
      dateOfJoining: new Date(),
    });

    res.status(201).json({ success: true, employee });
  } catch (err) {
    console.error("ADD EMPLOYEE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET ALL EMPLOYEES ================= */
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "-password")
      .populate("department");

    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET SINGLE EMPLOYEE ================= */
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

    res.json({ success: true, employee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= UPDATE EMPLOYEE (ADMIN) ================= */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id).populate("userId");
    if (!employee) {
      employee = await Employee.findOne({ userId: id }).populate("userId");
    }

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const { name, maritalStatus, designation, salary } = req.body;

    if (name !== undefined) employee.userId.name = name;
    if (maritalStatus !== undefined) employee.maritalStatus = maritalStatus;
    if (designation !== undefined) employee.designation = designation;
    if (salary !== undefined) employee.salary = Number(salary);

    if (req.file?.buffer) {
      employee.userId.profileImage = await uploadToImageKit(req.file, "employees");
    }

    await employee.userId.save();
    await employee.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= EDIT EMPLOYEE PROFILE ================= */
const editEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, experience } = req.body;

    let employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ userId: id });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (name !== undefined) {
      await User.updateOne({ _id: employee.userId }, { $set: { name } });
    }

    if (req.file?.buffer) {
      const imageUrl = await uploadToImageKit(req.file, "employees");
      await User.updateOne(
        { _id: employee.userId },
        { $set: { profileImage: imageUrl } }
      );
    }

    if (experience !== undefined) {
      await Employee.updateOne(
        { _id: employee._id },
        { $set: { experience } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= DELETE EMPLOYEE ================= */
const deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false });

    await User.findByIdAndDelete(emp.userId);
    await Employee.findByIdAndDelete(emp._id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET EMPLOYEES BY DEPARTMENT ================= */
const getEmployeesByDepartment = async (req, res) => {
  try {
    const emp = await Employee.findOne({ userId: req.user._id });

    if (!emp) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const employees = await Employee.find({ department: emp.department })
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name description");

    res.json({
      success: true,
      department: emp.department,
      employees,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET NEW EMPLOYEES ================= */
const getNewEmployees = async (req, res) => {
  try {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

    const employees = await Employee.find({
      dateOfJoining: { $gte: THIRTY_DAYS_AGO },
    })
      .sort({ dateOfJoining: -1 })
      .populate("userId", "name email profileImage");

    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET LEAVE BALANCE ================= */
const getLeaveBalance = async (req, res) => {
  try {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) return res.status(404).json({ success: false });

    const used = await Leave.countDocuments({
      employeeId: emp._id,
      status: "Approved",
    });

    const total = 24;

    res.json({ success: true, total, used, balance: total - used });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export {
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  editEmployeeProfile,
  deleteEmployee,
  getEmployeesByDepartment,
  getNewEmployees,
  getLeaveBalance,
};
