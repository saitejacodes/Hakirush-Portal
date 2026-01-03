import multer from "multer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import path from "path";
import Department from '../models/Department.js'


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
    console.log("BODY RECEIVED:", req.body);
    console.log("FILE RECEIVED:", req.file?.originalname);

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
      name, email, password: hashedPassword, role, profileImage: req.file ? req.file.filename : ""
    });

 
    const employee = await Employee.create({ 
      userId: user._id, employeeId, dob: dob ? new Date(dob) : null, gender, maritalStatus, department, 
      salary: Number(salary), bloodGroup
    });

    console.log("USER SAVED:", user);
    console.log("EMPLOYEE SAVED:", employee);

    return res.status(201).json({ success: true, message: "Employee created successfully", employee });

  } catch (error) {
    console.error("EMPLOYEE ADD ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("userId", "-password").populate("department");
    return res.status(200).json({ success: true, employees });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message
    });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    let employee = await Employee.findById(id).populate("userId", "-password").populate("department");

    if (!employee) {
      employee = await Employee.findOne({ userId: id }).populate("userId", "-password").populate("department");
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
      const {id} = req.params;
      const { name, maritalStatus, salary } = req.body;

      const employee = await Employee.findById({_id: id})
      if(!employee) {
        return res.status(201).json({ success: false, error: "employee not found" });
      }
      const user = await User.findById({_id: employee.userId})
      if(!user) {
        return res.status(201).json({ success: false, error: "user not found" });
      }

      const updateUser = await User.findByIdAndUpdate({_id: employee.userId}, {name})
      const updateEmployee = await Employee.findByIdAndUpdate({_id: id}, {
        maritalStatus, salary
      })

      if(!updateEmployee || !updateUser) {
         return res.status(404).json({ success: false, error: "document not found" });
      }

      return res.status(200).json({success: true})
   } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
   }
}

export { upload, addEmployee, getEmployees, getEmployee, updateEmployee };