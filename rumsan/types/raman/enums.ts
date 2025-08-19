export type TimeOffStatus =
  | 'PENDING'
  | 'HR_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';
export const TimeOffStatus = {
  PENDING: 'PENDING' as TimeOffStatus,
  HR_APPROVED: 'HR_APPROVED' as TimeOffStatus,
  APPROVED: 'APPROVED' as TimeOffStatus,
  REJECTED: 'REJECTED' as TimeOffStatus,
  CANCELLED: 'CANCELLED' as TimeOffStatus,
};

export type TimeOffDuration = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF';
export const TimeOffDuration = {
  FULL_DAY: 'FULL_DAY' as TimeOffDuration,
  FIRST_HALF: 'FIRST_HALF' as TimeOffDuration,
  SECOND_HALF: 'SECOND_HALF' as TimeOffDuration,
};

export type TimeOffType =
  | 'VACATION'
  | 'SICK'
  | 'PERSONAL'
  | 'UNPAID'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'BEREAVEMENT'
  | 'COMPASSIONATE'
  | 'OTHER';
export const TimeOffType = {
  VACATION: 'VACATION' as TimeOffType,
  SICK: 'SICK' as TimeOffType,
  PERSONAL: 'PERSONAL' as TimeOffType,
  UNPAID: 'UNPAID' as TimeOffType,
  MATERNITY: 'MATERNITY' as TimeOffType,
  PATERNITY: 'PATERNITY' as TimeOffType,
  BEREAVEMENT: 'BEREAVEMENT' as TimeOffType,
  COMPASSIONATE: 'COMPASSIONATE' as TimeOffType,
  OTHER: 'OTHER' as TimeOffType,
};