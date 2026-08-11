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
    const isIncompleteCheckout = Boolean(recordData?.checkIn && !recordData?.checkOut && recordData?.date && recordData.date < todayStr && !['Present', 'Half Day', 'Leave'].includes(recordData?.status));

    if (isIncompleteCheckout) {
      return {
        ...recordData,
        status: 'Absent',
        workedHours: 0,
        checkOut: null,
        employeeId: employee,
      };
    }

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
