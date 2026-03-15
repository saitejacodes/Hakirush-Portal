import cron from "node-cron";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

/* ================= FORMAT DATE ================= */
const formatToLocalYMD = (dateInput) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ================= FIX MISSED CHECKOUT ================= */
const fixMissedCheckouts = async () => {
  try {
    const todayStr = formatToLocalYMD(new Date());

    const result = await Attendance.updateMany(
      {
        checkIn: { $ne: null },
        checkOut: null,
        date: { $lt: todayStr },
      },
      {
        $set: {
          status: "Absent",
          workedHours: 0,
          isPaused: false,
          pauseStartedAt: null,
          totalPausedMs: 0,
        },
      }
    );

    console.log(`[CRON] Missed checkouts updated: ${result.modifiedCount}`);

    // Mark employees as Absent if no attendance record exists for today
    const employees = await Employee.find();
    let absentCount = 0;
    for (const emp of employees) {
      const exists = await Attendance.exists({ employeeId: emp._id, date: todayStr });
      if (!exists) {
        await Attendance.create({
          employeeId: emp._id,
          date: todayStr,
          status: "Absent",
          checkIn: null,
          checkOut: null,
          workedHours: 0,
          isPaused: false,
          pauseStartedAt: null,
          totalPausedMs: 0,
        });
        absentCount++;
      }
    }
    console.log(`[CRON] Absent records created for employees with no attendance: ${absentCount}`);
  } catch (error) {
    console.error("[CRON ERROR]", error);
  }
};

/* ================= START CRON ================= */

const startAttendanceCron = () => {
  // Runs every day at 12:30 AM
  cron.schedule("30 0 * * *", async () => {
    console.log("Running Attendance Cleanup Job...");
    await fixMissedCheckouts();
  });
};

export default startAttendanceCron;