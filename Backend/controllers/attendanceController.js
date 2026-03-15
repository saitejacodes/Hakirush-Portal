import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";
import Leave from "../models/Leave.js";

/* ================= HELPERS ================= */
const formatToLocalYMD = (dateInput) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLocalDayRange = (dateString) => {
    const [year, month, day] = dateString.split("-");
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
};

const getStatusFromHours = (hours) => {
    if (hours >= 8) return "Present";
    if (hours >= 4) return "Half Day";
    return "Absent";
};

/* ================= GET ATTENDANCE (ADMIN) ================= */
const getAttendance = async (req, res) => {
    try {
        const today = new Date();
        const todayStr = formatToLocalYMD(today);
        const dayOfWeek = today.getDay(); 

        const holidays = await Holiday.find();
        const holidayMatch = holidays.find(h => formatToLocalYMD(h.date) === todayStr);

        // Define if today is an off-day but DON'T return yet
        let isOffDay = false;
        let reason = "";

        if (holidayMatch) {
            isOffDay = true;
            reason = holidayMatch.title;
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            isOffDay = true;
            reason = dayOfWeek === 0 ? "Sunday (Weekend)" : "Saturday (Weekend)";
        }

        // Always fetch employees so the list is never "blank"
        const employees = await Employee.find().populate("userId").populate("department");
        const todayAttendance = await Attendance.find({ date: todayStr }).populate({
            path: "employeeId",
            populate: ["userId", "department"],
        });

        const attendance = employees.map((emp) => {
            const record = todayAttendance.find((a) => String(a.employeeId?._id) === String(emp._id));
            
            if (record && record.date < todayStr && !record.checkOut) {
                return { ...record._doc, status: "Absent" };
            }

            return record || { 
                _id: null,
                date: todayStr,
                status: isOffDay ? "Holiday" : null, // Label as Holiday if it's an off-day
                workedHours: 0,
                checkIn: null,
                checkOut: null,
                isPaused: false,
                totalPausedMs: 0,
                employeeId: emp, 
            };
        });

        // Send both the attendance list AND the off-day status
        console.log('[DEBUG] getAttendance:', { isOffDay, reason, today: todayStr });
        return res.json({ 
            success: true, 
            attendance, 
            isOffDay, 
            reason 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= ADMIN TODAY SUMMARY ================= */
const getAdminTodaySummary = async (req, res) => {
    try {
        const today = new Date();
        const todayStr = formatToLocalYMD(today);
        const dayOfWeek = today.getDay();
        const { start, end } = getLocalDayRange(todayStr);

        const holidays = await Holiday.find();
        const holidayMatch = holidays.find(h => formatToLocalYMD(h.date) === todayStr);

        // --- UPDATED LOGIC HERE ---
        if (dayOfWeek === 0 || dayOfWeek === 6 || holidayMatch) {
            let reason = "";
            if (holidayMatch) {
                reason = holidayMatch.title;
            } else {
                reason = dayOfWeek === 0 ? "Sunday (Weekend)" : "Saturday (Weekend)";
            }
            return res.json({ success: true, isOffDay: true, reason: reason, activeToday: 0, onLeaveToday: 0, absentToday: 0 });
        }
        // --------------------------

        const totalEmployees = await Employee.countDocuments();
        const leaves = await Leave.find({
            status: "Approved",
            startDate: { $lte: end }, 
            endDate: { $gte: start },  
        });

        const attendance = await Attendance.find({ date: todayStr });
        const presentIds = attendance.filter((a) => a.checkIn).map((a) => String(a.employeeId));
        const leaveIds = leaves.map((l) => String(l.employeeId));
        
        const accountedFor = new Set([...presentIds, ...leaveIds]);
        const absentToday = Math.max(0, totalEmployees - accountedFor.size);

        return res.json({
            success: true,
            activeToday: presentIds.length,
            onLeaveToday: leaves.length,
            absentToday,
            lateLogins: attendance.filter(a => a.checkIn && new Date(a.checkIn).getHours() >= 10).length
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= ATTENDANCE REPORT (ADMIN) ================= */
const attendanceReport = async (req, res) => {
    try {
        const { date, search } = req.query;
        
        const filter = date ? { date } : {};
        const records = await Attendance.find(filter).populate({ 
            path: "employeeId", 
            populate: ["userId", "department"] 
        });
        
        const holidays = await Holiday.find();
        const holidayMap = {};
        holidays.forEach(h => holidayMap[formatToLocalYMD(h.date)] = h.title);

        let filtered = records;
        if (search) {
            const keyword = search.toLowerCase();
            filtered = records.filter(r => 
                r.employeeId?.userId?.name?.toLowerCase().includes(keyword) || 
                r.employeeId?.employeeId?.toLowerCase().includes(keyword)
            );
        }

        const groupData = {};
        filtered.forEach(r => {
            if (!groupData[r.date]) groupData[r.date] = [];
            let finalStatus = r.status || "Absent";
            groupData[r.date].push({
                _id: r._id,
                employeeId: r.employeeId?.employeeId || "N/A",
                employeeName: r.employeeId?.userId?.name || "Unknown",
                departmentName: r.employeeId?.department?.dep_name || "N/A",
                status: finalStatus,
                workedHours: r.workedHours,
                checkIn: r.checkIn,
                checkOut: r.checkOut,
            });
        });
        
        return res.json({ success: true, groupData, holidayMap });
    } catch (error) { 
        return res.status(500).json({ success: false, message: error.message }); 
    }
};

/* ================= CHECKIN ================= */
const checkIn = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        const date = formatToLocalYMD(new Date());
        let attendance = await Attendance.findOne({ employeeId: employee._id, date });
        if (attendance?.checkIn) return res.json({ success: true, attendance });

        attendance = await Attendance.findOneAndUpdate(
            { employeeId: employee._id, date },
            { $setOnInsert: { employeeId: employee._id, date, totalPausedMs: 0 }, checkIn: new Date(), isPaused: false },
            { upsert: true, new: true }
        );
        return res.json({ success: true, attendance });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

/* ================= CHECKOUT ================= */
const checkOut = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        const date = formatToLocalYMD(new Date());
        const attendance = await Attendance.findOne({ employeeId: employee._id, date });
        if (!attendance || !attendance.checkIn) return res.status(400).json({ success: false, message: "Check-in required" });

        if (attendance.isPaused) {
            attendance.totalPausedMs += (new Date() - attendance.pauseStartedAt);
            attendance.isPaused = false;
        }
        attendance.checkOut = new Date();
        const hours = Math.max(0, (attendance.checkOut - attendance.checkIn - (attendance.totalPausedMs || 0)) / (1000 * 60 * 60));
        attendance.workedHours = Number(hours.toFixed(2));
        attendance.status = getStatusFromHours(attendance.workedHours);
        await attendance.save();
        return res.json({ success: true, attendance });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

/* ================= PAUSE ================= */
const pauseAttendance = async (req, res) => {
    try {
        const date = formatToLocalYMD(new Date());
        console.log("Searching for attendance with date:", date); // DEBUG THIS

        const employee = await Employee.findOne({ userId: req.user._id });
        // Use findOneAndUpdate to avoid race conditions and ensure update
        const attendance = await Attendance.findOneAndUpdate(
            { 
                employeeId: employee._id, 
                date: date,
                checkOut: null // Can't pause if already checked out
            },
            { 
                $set: { 
                    isPaused: true, 
                    pauseStartedAt: new Date() 
                } 
            },
            { new: true }
        );

        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: "No active attendance record found for today." 
            });
        }

        return res.json({ success: true, attendance });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= RESUME ================= */
const resumeAttendance = async (req, res) => {
    try {
        const date = formatToLocalYMD(new Date());
        const employee = await Employee.findOne({ userId: req.user._id });
        
        // 1. Find the current record to get the pause timestamp
        const attendance = await Attendance.findOne({ employeeId: employee._id, date });
        
        if (!attendance || !attendance.isPaused || !attendance.pauseStartedAt) {
            return res.json({ success: true, attendance });
        }

        // 2. Calculate the duration of THIS specific break
        const sessionPauseTime = new Date() - new Date(attendance.pauseStartedAt);
        
        // 3. Use findOneAndUpdate to update the document safely
        const updatedAttendance = await Attendance.findOneAndUpdate(
            { _id: attendance._id },
            { 
                $inc: { totalPausedMs: sessionPauseTime }, // Increment total by the new break time
                $set: { 
                    isPaused: false, 
                    pauseStartedAt: null 
                } 
            },
            { new: true } // Return the updated document to the frontend
        );

        return res.json({ success: true, attendance: updatedAttendance });
    } catch (error) { 
        console.error("Resume Error:", error);
        return res.status(500).json({ success: false, message: error.message }); 
    }
};

/* ================= GET MY TODAY ATTENDANCE ================= */
const getMyTodayAttendance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        const attendance = await Attendance.findOne({ employeeId: employee._id, date: formatToLocalYMD(new Date()) });
        return res.json({ success: true, attendance: attendance || null });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

/* ================= GET USER MONTHLY ATTENDANCE ================= */
const getUserMonthlyAttendance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { month, year } = req.query;
        const employee = await Employee.findOne({ userId });
        const start = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        const records = await Attendance.find({ employeeId: employee._id, date: { $gte: start, $lte: end } }).sort({ date: 1 });
        return res.json({ success: true, attendance: records });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

/* ================= UPDATE ATTENDANCE ================= */
const updateAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status } = req.body;
        const date = formatToLocalYMD(new Date());
        let updateFields = { status, date, employeeId };
        if (status === "Absent" || status === "Leave") {
            updateFields.checkIn = null;
            updateFields.checkOut = null;
            updateFields.workedHours = 0;
        } else if (status === "Present") {
            updateFields.workedHours = 8;
        } else if (status === "Half Day") {
            updateFields.workedHours = 4;
        }
        const attendance = await Attendance.findOneAndUpdate(
            { employeeId, date },
            updateFields,
            { upsert: true, new: true }
        ).populate({ path: "employeeId", populate: ["userId", "department"] });
        return res.json({ success: true, attendance });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

export {
    getAttendance,
    getAdminTodaySummary,
    checkIn,
    checkOut,
    pauseAttendance,
    resumeAttendance,
    getMyTodayAttendance,
    getUserMonthlyAttendance,
    attendanceReport,
    updateAttendance
}