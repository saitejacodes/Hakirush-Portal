import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String },
    maritalStatus: { type: String },
    dateOfJoining: { type: Date, default: Date.now },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null
    },
    designation: { type: String, required: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    salary: { type: Number, required: true },
    experience: { type: String, default: "" },
  },
  { timestamps: true }   
);

export default mongoose.model("Employee", employeeSchema);
