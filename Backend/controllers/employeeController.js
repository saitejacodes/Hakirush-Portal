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
      manager,
      aadharcard,
      pancard,
      pfNumber,
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
      manager: manager || null,
      dateOfJoining: new Date(),
      aadharcard: aadharcard || "",
      pancard: pancard || "",
      pfNumber: pfNumber || "",
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

    const { name, maritalStatus, department, designation, salary } = req.body;

    if (name !== undefined) employee.userId.name = name;
    if (maritalStatus !== undefined) employee.maritalStatus = maritalStatus;
    if (department !== undefined) employee.department = department;
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
    const {
      name,
      experience,
      dob,
      bloodGroup,
      maritalStatus,
      designation,
      salary,
      department,
      aadharcard,
      pancard,
      pfNumber,
    } = req.body;

    let employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ userId: id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    /* ================= UPDATE USER NAME ================= */
    if (name !== undefined) {
      await User.updateOne(
        { _id: employee.userId },
        { $set: { name } }
      );
    }

    /* ================= UPDATE PROFILE IMAGE ================= */
    if (req.file?.buffer) {
      const imageUrl = await uploadToImageKit(req.file, "employees");

      await User.updateOne(
        { _id: employee.userId },
        { $set: { profileImage: imageUrl } }
      );
    }

    /* ================= UPDATE EMPLOYEE FIELDS ================= */
    const updateFields = {};

    if (experience !== undefined) updateFields.experience = experience;
    if (dob !== undefined) updateFields.dob = dob;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (maritalStatus !== undefined) updateFields.maritalStatus = maritalStatus;
    if (designation !== undefined) updateFields.designation = designation;
    if (salary !== undefined) updateFields.salary = salary;
    if (department !== undefined) updateFields.department = department;
    if (aadharcard !== undefined) updateFields.aadharcard = aadharcard;
    if (pancard !== undefined) updateFields.pancard = pancard;
    if (pfNumber !== undefined) updateFields.pfNumber = pfNumber;

    if (Object.keys(updateFields).length > 0) {
      await Employee.updateOne(
        { _id: employee._id },
        { $set: updateFields }
      );
    }

    res.json({
      success: true,
      message: "Employee profile updated successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


/* ================= DELETE EMPLOYEE ================= */
const deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false });

    await Leave.deleteMany({ employeeId: emp._id });
    await User.findByIdAndDelete(emp.userId);
    await Employee.findByIdAndDelete(emp._id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET EMPLOYEES BY DEPARTMENT (excludes the logged-in employee) ================= */
const getEmployeesByDepartment = async (req, res) => { 
  try {
    const emp = await Employee.findOne({ userId: req.user._id });

    if (!emp) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const employees = await Employee.find({
      department: emp.department,
      userId: { $ne: req.user._id }, // exclude the logged-in employee from their own list
    })
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

/* ================= GET BIRTHDAYS (OPTIMIZED) ================= */
const getAllEmployeeBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    // Get date 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const employees = await Employee.find({ dob: { $ne: null } })
      .populate("userId", "name profileImage")
      .populate("department", "dep_name");

    const todayBirthdays = [];
    const upcomingBirthdays = [];

    employees.forEach(emp => {
      const d = new Date(emp.dob);
      const m = d.getMonth() + 1;
      const day = d.getDate();

      const age = today.getFullYear() - d.getFullYear();

      const result = {
        _id: emp._id,
        name: emp.userId?.name,
        profileImage: emp.userId?.profileImage,
        department: emp.department?.dep_name,
        age: age
      };

      if (m === todayMonth && day === todayDay) {
        todayBirthdays.push(result);
      } else {
        // Check if birthday falls within the next 7 days
        const bdayThisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());
        if (bdayThisYear > today && bdayThisYear <= nextWeek) {
          upcomingBirthdays.push({ ...result, dob: emp.dob });
        }
      }
    });

    res.json({ success: true, today: todayBirthdays, upcoming: upcomingBirthdays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getEmployeesByDepartmentId = async (req, res) => {
  try {
    const { id } = req.params;

    const employees = await Employee.find({ department: id })
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name");

    res.status(200).json({
      success: true,
      employees,
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
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

/* ================= GET ANNIVERSARIES ================= */
const getAllEmployeeAnniversaries = async (req, res) => {
  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const employees = await Employee.find({ dateOfJoining: { $ne: null } })
      .populate("userId", "name profileImage")
      .populate("department", "dep_name");

    const todayAnniversaries = [];
    const upcomingAnniversaries = [];

    employees.forEach(emp => {
      const joiningDate = new Date(emp.dateOfJoining);
      const m = joiningDate.getMonth() + 1;
      const day = joiningDate.getDate();

      const yearsCompleted = today.getFullYear() - joiningDate.getFullYear();

      if (yearsCompleted <= 0) return;

      const result = {
        _id: emp._id,
        name: emp.userId?.name,
        profileImage: emp.userId?.profileImage,
        department: emp.department?.dep_name,
        joiningDate: emp.dateOfJoining,
        years: yearsCompleted
      };

      if (m === todayMonth && day === todayDay) {
        todayAnniversaries.push(result);
      } else {
        const anniversaryThisYear = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
        
        if (anniversaryThisYear > today && anniversaryThisYear <= nextWeek) {
          upcomingAnniversaries.push(result);
        }
      }
    });

    res.json({ 
      success: true, 
      today: todayAnniversaries, 
      upcoming: upcomingAnniversaries 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET NEW EMPLOYEES (LAST 30 DAYS) ================= */
const getNewEmployees = async (req, res) => {
  try {
    const today = new Date();

    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(today.getDate() - 30);

    const employees = await Employee.find({
      dateOfJoining: { $gte: THIRTY_DAYS_AGO }
    })
      .sort({ dateOfJoining: -1 })
      .populate("userId", "name email profileImage")
      .populate("department", "dep_name");

    const formattedEmployees = employees.map(emp => {

      const joiningDate = new Date(emp.dateOfJoining);

      const daysAgo = Math.floor(
        (today - joiningDate) / (1000 * 60 * 60 * 24)
      );

      return {
        _id: emp._id,
        name: emp.userId?.name,
        email: emp.userId?.email,
        profileImage: emp.userId?.profileImage,
        department: emp.department?.dep_name,
        dateOfJoining: emp.dateOfJoining,
        joinedDaysAgo: daysAgo
      };
    });

    res.json({
      success: true,
      totalNewEmployees: formattedEmployees.length,
      employees: formattedEmployees
    });

  } catch (err) {
    console.error("NEW EMPLOYEES ERROR:", err);
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
  getEmployeesByDepartmentId,
  getNewEmployees,
  getLeaveBalance,
  getAllEmployeeBirthdays,
  getAllEmployeeAnniversaries,
};
