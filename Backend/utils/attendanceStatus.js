export const buildAttendanceForEmployee = ({ employee, record, isOffDay, leaveByEmployeeId, todayStr }) => {
  const employeeId = String(employee?._id || '');
  const leaveRecord = leaveByEmployeeId?.get(employeeId);

  if (leaveRecord) {
    return {
      _id: null,
      date: todayStr,
      status: 'Leave',
      workedHours: 0,
      checkIn: null,
      checkOut: null,
      isPaused: false,
      totalPausedMs: 0,
      employeeId: employee,
    };
  }

  if (record) {
    const recordData = record?._doc || record;
    return { ...recordData, employeeId: employee };
  }

  return {
    _id: null,
    date: todayStr,
    status: isOffDay ? 'Holiday' : 'Absent',
    workedHours: 0,
    checkIn: null,
    checkOut: null,
    isPaused: false,
    totalPausedMs: 0,
    employeeId: employee,
  };
};
