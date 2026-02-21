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

        if (dayOfWeek === 0 || dayOfWeek === 6 || holidayMatch) {
            let reason = holidayMatch ? holidayMatch.title : (dayOfWeek === 0 ? "Sunday" : "Saturday");
            return res.json({ 
                success: true, 
                attendance: [], 
                isOffDay: true, 
                reason: reason 
            });
        }

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

            return record || { _id: null, date: todayStr, status: "Absent", workedHours: 0, employeeId: emp };
        });

        return res.json({ success: true, attendance });
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

        // Saturday (6) check included
        if (dayOfWeek === 0 || dayOfWeek === 6 || holidayMatch) {
            return res.json({ success: true, isOffDay: true, activeToday: 0, onLeaveToday: 0, absentToday: 0 });
        }

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
        const todayStr = formatToLocalYMD(new Date());
        
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
            
            let finalStatus = r.status;
            if (r.date < todayStr && !r.checkOut) {
                finalStatus = "Absent";
            }

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
        const employee = await Employee.findOne({ userId: req.user._id });
        const attendance = await Attendance.findOne({ employeeId: employee._id, date });
        if (!attendance || attendance.checkOut || attendance.isPaused) return res.json({ success: true, attendance });
        attendance.isPaused = true;
        attendance.pauseStartedAt = new Date();
        await attendance.save();
        return res.json({ success: true, attendance });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

/* ================= RESUME ================= */
const resumeAttendance = async (req, res) => {
    try {
        const date = formatToLocalYMD(new Date());
        const employee = await Employee.findOne({ userId: req.user._id });
        const attendance = await Attendance.findOne({ employeeId: employee._id, date });
        if (!attendance || !attendance.isPaused) return res.json({ success: true, attendance });
        attendance.totalPausedMs += (new Date() - attendance.pauseStartedAt);
        attendance.pauseStartedAt = null;
        attendance.isPaused = false;
        await attendance.save();
        return res.json({ success: true, attendance });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
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
        const attendance = await Attendance.findOneAndUpdate({ employeeId, date }, { employeeId, status, date }, { upsert: true, new: true }).populate({ path: "employeeId", populate: ["userId", "department"] });
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