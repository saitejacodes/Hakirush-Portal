import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";
import Leave from "../models/Leave.js";
import { buildAttendanceForEmployee } from "../utils/attendanceStatus.js";

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

const isIncompleteCheckout = (rec) => {
    return (
        !!rec.checkIn &&
        !rec.checkOut &&
        !["Present", "Half Day", "Leave"].includes(rec.status)
    );
};

/* ================= GET ATTENDANCE (ADMIN) ================= */
const getAttendance = async (req, res) => {
    try {
        const today = new Date();
        const todayStr = formatToLocalYMD(today);
        const dayOfWeek = today.getDay(); 

        const holidays = await Holiday.find();
        const holidayMatch = holidays.find(h => formatToLocalYMD(h.date) === todayStr);

        let isOffDay = false;
        let reason = "";

        if (holidayMatch) {
            isOffDay = true;
            reason = holidayMatch.title;
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            isOffDay = true;
            reason = dayOfWeek === 0 ? "Sunday (Weekend)" : "Saturday (Weekend)";
        }

        const employees = await Employee.find().populate("userId").populate("department");
        const todayAttendance = await Attendance.find({ date: todayStr }).populate({
            path: "employeeId",
            populate: ["userId", "department"],
        });

        const approvedLeaves = await Leave.find({
            status: "Approved",
            startDate: { $lte: today },
            endDate: { $gte: today },
        }).lean();

        const leaveByEmployeeId = new Map(
            approvedLeaves.map((leave) => [String(leave.employeeId), leave])
        );

        const attendance = employees.map((emp) => {
            const record = todayAttendance.find((a) => String(a.employeeId?._id) === String(emp._id));
            return buildAttendanceForEmployee({
                employee: emp,
                record,
                isOffDay,
                leaveByEmployeeId,
                todayStr,
            });
        });

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

        if (dayOfWeek === 0 || dayOfWeek === 6 || holidayMatch) {
            let reason = "";
            if (holidayMatch) {
                reason = holidayMatch.title;
            } else {
                reason = dayOfWeek === 0 ? "Sunday (Weekend)" : "Saturday (Weekend)";
            }
            return res.json({
                success: true,
                isHoliday: true,
                holidayName: reason,
                presentToday: 0,
                activeToday: 0,
                halfDayToday: 0,
                onLeaveToday: 0,
                absentToday: 0,
                lateLogins: 0,
            });
        }

        const employees = await Employee.find();

        const leaves = await Leave.find({
            status: "Approved",
            startDate: { $lte: end }, 
            endDate: { $gte: start },  
        });

        const attendance = await Attendance.find({ date: todayStr });

        const presentIds = attendance
            .filter(a => a.checkIn)
            .map(a => String(a.employeeId));

        const leaveIds = leaves.map(l => String(l.employeeId));

        const absentEmployees = employees.filter(emp => {
            return !presentIds.includes(String(emp._id)) &&
                !leaveIds.includes(String(emp._id));
        });

        const absentToday = absentEmployees.length;

        const halfDayToday = attendance.filter(a => (a.status === "Half Day") || (a.workedHours && a.workedHours >= 4 && a.workedHours < 8)).length;
        const presentToday = attendance.filter(a => a.status === "Present" || (a.checkIn && a.workedHours >= 8)).length || presentIds.length;
        const activeToday = presentToday;

        return res.json({
            success: true,
            presentToday,
            activeToday,
            halfDayToday,
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
        const { date, search, month, year } = req.query;

        const employees = await Employee.find().populate("userId").populate("department");

        let startDate, endDate;
        if (month && year) {
            // full month export
            const lastDay = new Date(year, month, 0).getDate();
            startDate = `${year}-${String(month).padStart(2, "0")}-01`;
            endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        } else if (date) {
            startDate = endDate = date;
        } else {
            startDate = employees.reduce((min, emp) => {
                if (!emp.dateOfJoining) return min;
                const d = formatToLocalYMD(emp.dateOfJoining);
                return (!min || d < min) ? d : min;
            }, null);
            endDate = formatToLocalYMD(new Date());
        }

        function getDateList(start, end) {
            const arr = [];
            let dt = new Date(start);
            const endDt = new Date(end);
            while (dt <= endDt) {
                arr.push(formatToLocalYMD(dt));
                dt.setDate(dt.getDate() + 1);
            }
            return arr;
        }
        const dateList = getDateList(startDate, endDate);

        const attendanceRecords = await Attendance.find({ date: { $gte: startDate, $lte: endDate } }).populate({
            path: "employeeId",
            populate: ["userId", "department"]
        });

        const attendanceMap = {};
        attendanceRecords.forEach(r => {
            if (!attendanceMap[r.date]) attendanceMap[r.date] = {};
            attendanceMap[r.date][String(r.employeeId?._id)] = r;
        });

        const holidays = await Holiday.find();
        const holidayMap = {};
        holidays.forEach(h => holidayMap[formatToLocalYMD(h.date)] = h.title);

        let filteredEmployees = employees;
        if (search) {
            const keyword = search.toLowerCase();
            filteredEmployees = employees.filter(emp =>
                emp.userId?.name?.toLowerCase().includes(keyword) ||
                emp.employeeId?.toLowerCase().includes(keyword)
            );
        }

        const groupData = {};
        for (const d of dateList) {
            groupData[d] = [];
            for (const emp of filteredEmployees) {
                const joinDateStr = formatToLocalYMD(emp.dateOfJoining || new Date());
                if (d < joinDateStr) continue;
                const record = attendanceMap[d]?.[String(emp._id)];
                if (record) {
                    // FIX: apply the same "incomplete checkout" rule here so the
                    // admin report and the employee calendar never disagree.
                    const showIncomplete = isIncompleteCheckout(record);
                    groupData[d].push({
                        _id: record._id,
                        employeeId: emp.employeeId || "N/A",
                        employeeName: emp.userId?.name || "Unknown",
                        departmentName: emp.department?.dep_name || "N/A",
                        status: showIncomplete ? "Absent" : (record.status || "Absent"),
                        workedHours: showIncomplete ? 0 : record.workedHours,
                        checkIn: record.checkIn,
                        checkOut: showIncomplete ? null : record.checkOut,
                    });
                } else {
                    groupData[d].push({
                        _id: null,
                        employeeId: emp.employeeId || "N/A",
                        employeeName: emp.userId?.name || "Unknown",
                        departmentName: emp.department?.dep_name || "N/A",
                        status: "Absent",
                        workedHours: 0,
                        checkIn: null,
                        checkOut: null,
                    });
                }
            }
        }

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
        console.log("Searching for attendance with date:", date);

        const employee = await Employee.findOne({ userId: req.user._id });
        const attendance = await Attendance.findOneAndUpdate(
            { 
                employeeId: employee._id, 
                date: date,
                checkOut: null
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
        
        const attendance = await Attendance.findOne({ employeeId: employee._id, date });
        
        if (!attendance || !attendance.isPaused || !attendance.pauseStartedAt) {
            return res.json({ success: true, attendance });
        }

        const sessionPauseTime = new Date() - new Date(attendance.pauseStartedAt);
        
        const updatedAttendance = await Attendance.findOneAndUpdate(
            { _id: attendance._id },
            { 
                $inc: { totalPausedMs: sessionPauseTime },
                $set: { 
                    isPaused: false, 
                    pauseStartedAt: null 
                } 
            },
            { new: true }
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

        const recordMap = {};
        records.forEach(r => { recordMap[r.date] = r; });

        const attendance = [];
        const today = new Date();
        const todayStr = formatToLocalYMD(today);
        const joinDateStr = formatToLocalYMD(employee.dateOfJoining || new Date());

        for (let day = 1; day <= lastDay; day++) {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            if (dateStr > todayStr) break;
            if (dateStr < joinDateStr) continue;
            const rec = recordMap[dateStr];
            if (rec) {
                // FIX: only force "Absent" when the record is genuinely an
                // unfinished checkin (i.e. hasn't been corrected/approved via
                // an attendance request to Present / Half Day / Leave).
                // Previously this checked `rec.checkIn && !rec.checkOut` alone,
                // which meant an approved correction (status: "Present") whose
                // checkOut was still null got silently overwritten back to
                // "Absent" on the calendar, even though the attendance list
                // correctly showed "Present".
                if (isIncompleteCheckout(rec)) {
                    attendance.push({
                        ...rec._doc,
                        status: "Absent",
                        workedHours: 0,
                        checkIn: rec.checkIn,
                        checkOut: null
                    });
                } else {
                    attendance.push(rec);
                }
            } else {
                attendance.push({
                    _id: null,
                    employeeId: employee._id,
                    date: dateStr,
                    status: "Absent",
                    workedHours: 0,
                    checkIn: null,
                    checkOut: null,
                    isPaused: false,
                    totalPausedMs: 0
                });
            }
        }
        return res.json({ success: true, attendance });
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