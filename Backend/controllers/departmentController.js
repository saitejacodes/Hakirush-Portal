import Department from "../models/Department.js";

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Get department failed" });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;

    if (!dep_name || !description) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const newDep = await Department.create({ dep_name, description });

    return res.status(200).json({ success: true, department: newDep });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Add department failed" });
  }
};

const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    return res.status(200).json({ success: true, department });
  } catch {
    return res.status(500).json({ success: false, error: "Get department failed" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;

    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { dep_name, description },
      { new: true }
    );

    return res.status(200).json({ success: true, department: updated });
  } catch {
    return res.status(500).json({ success: false, error: "Edit department failed" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    console.log("DELETE CALLED FOR:", req.params.id);

    const deleted = await Department.findOneAndDelete({ _id: req.params.id });

    console.log("DELETED DOC:", deleted);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }

    return res.status(200).json({ success: true, department: deleted });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Delete failed" });
  }
};


export {
  addDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
