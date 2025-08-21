export type DraftStatus = 'OPEN' | 'CLOSE';
export const DraftStatus = {
  OPEN: 'OPEN' as DraftStatus,
  CLOSE: 'CLOSE' as DraftStatus,
};

export type SalaryStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export const SalaryStatus = {
  PAID: 'PAID' as SalaryStatus,
  PARTIAL: 'PARTIAL' as SalaryStatus,
  UNPAID: 'UNPAID' as SalaryStatus,
};

export type TxType = 'EXPENSE' | 'ADJUSTMENT' | 'TRANSFER' | 'INCOME';
export const TxType = {
  EXPENSE: 'EXPENSE' as TxType,
  ADJUSTMENT: 'ADJUSTMENT' as TxType,
  TRANSFER: 'TRANSFER' as TxType,
  INCOME: 'INCOME' as TxType,
};

export type UserType = 'EMPLOYEE' | 'VOLUNTEER' | 'CONTRACTOR' | 'INTERN';
export const UserType = {
  EMPLOYEE: 'EMPLOYEE' as UserType,
  VOLUNTEER: 'VOLUNTEER' as UserType,
  CONTRACTOR: 'CONTRACTOR' as UserType,
  INTERN: 'INTERN' as UserType,
};

export type EmployeeLevel =
  | 'Director'
  | 'Associate'
  | 'Mid Level'
  | 'Executive'
  | 'Analyst'
  | 'Intern';
export const EmployeeLevel = {
  Director: 'Director' as EmployeeLevel,
  Associate: 'Associate' as EmployeeLevel,
  'Mid Level': 'Mid Level' as EmployeeLevel,
  Executive: 'Executive' as EmployeeLevel,
  Analyst: 'Analyst' as EmployeeLevel,
  Intern: 'Intern' as EmployeeLevel,
};

export type InvoiceType =
  | 'VAT'
  | 'PAN'
  | 'ESTIMATE'
  | 'BANK_TRANSFER'
  | 'VOUCHER';
export const InvoiceType = {
  VAT: 'VAT' as InvoiceType,
  PAN: 'PAN' as InvoiceType,
  ESTIMATE: 'ESTIMATE' as InvoiceType,
  BANK_TRANSFER: 'BANK_TRANSFER' as InvoiceType,
  VOUCHER: 'VOUCHER' as InvoiceType,
};

export type InvoiceStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REIMBURSED';
export const InvoiceStatusType = {
  PENDING: 'PENDING' as InvoiceStatusType,
  APPROVED: 'APPROVED' as InvoiceStatusType,
  REJECTED: 'REJECTED' as InvoiceStatusType,
  REIMBURSED: 'REIMBURSED' as InvoiceStatusType,
};

export type Currency = 'NPR' | 'USD' | 'GBP' | 'EUR' | 'USDC';
export const Currency = {
  NPR: 'NPR' as Currency,
  USD: 'USD' as Currency,
  GBP: 'GBP' as Currency,
  EUR: 'EUR' as Currency,
  USDC: 'USDC' as Currency,
};

export type AccountTxnStatus = 'UNRECONCILED' | 'RECONCILED' | 'DISCARDED';
export const AccountTxnStatus = {
  UNRECONCILED: 'UNRECONCILED' as AccountTxnStatus,
  RECONCILED: 'RECONCILED' as AccountTxnStatus,
  DISCARDED: 'DISCARDED' as AccountTxnStatus,
};

export type AccountTxnType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
export const AccountTxnType = {
  INCOME: 'INCOME' as AccountTxnType,
  EXPENSE: 'EXPENSE' as AccountTxnType,
  TRANSFER: 'TRANSFER' as AccountTxnType,
  ADJUSTMENT: 'ADJUSTMENT' as AccountTxnType,
};

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
export type ProjectMemberRole = 'OWNER' | 'MEMBER';
export const ProjectMemberRole = {
  OWNER: 'OWNER' as ProjectMemberRole,
  MEMBER: 'MEMBER' as ProjectMemberRole,
};

export type VatStatus = 'UNCLAIMED' | 'CLAIMED' | 'DELAYED_CLAIM' | 'IGNORED';
export const VatStatus = {
  UNCLAIMED: 'UNCLAIMED' as VatStatus,
  CLAIMED: 'CLAIMED' as VatStatus,
  DELAYED_CLAIM: 'DELAYED_CLAIM' as VatStatus,
  IGNORED: 'IGNORED' as VatStatus,
};
