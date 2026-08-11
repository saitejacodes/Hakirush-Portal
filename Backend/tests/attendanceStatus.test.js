import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAttendanceForEmployee } from '../utils/attendanceStatus.js';

test('returns Leave when an approved leave exists for the employee', () => {
  const result = buildAttendanceForEmployee({
    employee: { _id: 'emp-1', userId: { name: 'Alice' }, department: { dep_name: 'HR' } },
    record: null,
    isOffDay: false,
    leaveByEmployeeId: new Map([['emp-1', { _id: 'leave-1' }]]),
    todayStr: '2026-08-06'
  });

  assert.equal(result.status, 'Leave');
  assert.equal(result.workedHours, 0);
  assert.equal(result.checkIn, null);
  assert.equal(result.checkOut, null);
});

test('preserves existing attendance record when no leave exists', () => {
  const record = {
    _id: 'att-1',
    status: 'Present',
    workedHours: 8,
    checkIn: '2026-08-06T08:00:00.000Z',
    checkOut: '2026-08-06T16:00:00.000Z',
    employeeId: { _id: 'emp-2' }
  };

  const result = buildAttendanceForEmployee({
    employee: { _id: 'emp-2', userId: { name: 'Bob' }, department: { dep_name: 'Engineering' } },
    record,
    isOffDay: false,
    leaveByEmployeeId: new Map(),
    todayStr: '2026-08-06'
  });

  assert.equal(result.status, 'Present');
  assert.equal(result.workedHours, 8);
  assert.equal(result._id, 'att-1');
});

test('marks a past incomplete checkout as Absent', () => {
  const result = buildAttendanceForEmployee({
    employee: { _id: 'emp-3', userId: { name: 'Carol' }, department: { dep_name: 'Finance' } },
    record: {
      _id: 'att-2',
      date: '2026-08-05',
      status: '',
      workedHours: 0,
      checkIn: '2026-08-05T08:00:00.000Z',
      checkOut: null,
      employeeId: { _id: 'emp-3' }
    },
    isOffDay: false,
    leaveByEmployeeId: new Map(),
    todayStr: '2026-08-06'
  });

  assert.equal(result.status, 'Absent');
  assert.equal(result.workedHours, 0);
  assert.equal(result.checkOut, null);
});
