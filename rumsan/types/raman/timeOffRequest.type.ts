import { CommonFields } from '@rumsan/sdk/types/common.type';
import { TimeOffStatus, TimeOffType } from './enums';
import { TimeOff } from './timeOff.type';

export type TimeOffRequestBase = {
  userId: string;
  type: TimeOffType;
  startDate: Date;
  endDate: Date;
  daysDetails?: Record<string, any>;
  totalDays: number;
  status: TimeOffStatus;
  description?: string;
  extras?: Record<string, any>;
  attachments?: Record<string, any>;
  isPaid: boolean;
  project?: string;
  approvalDetails?: Record<string, any>;
  approvalChallenge?: string;
  TimeOff?: TimeOff[];
};

export type TimeOffRequest = TimeOffRequestBase &
  CommonFields & { cuid: string };

export type LeaveUsage = {
  type: string;
  used: number;
  limit: number;
  remaining: number;
};

export interface UserLeaveData {
  userId: string;
  userName: string | null;
  usage: LeaveUsage[];
  departmentName: string;
}

export type CreateTimeOffRequest = TimeOffRequestBase;
export type EditTimeOffRequest = Partial<CreateTimeOffRequest>;

export type TimeOffReqRejectApproval = {
  status: TimeOffStatus;
  approvalDetails?: Record<string, any>;
};
