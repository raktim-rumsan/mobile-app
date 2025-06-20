// import { TimeOffDuration, TimeOffType } from '';
import { CommonFields } from '@rumsan/sdk/types/common.type';
import { TimeOffDuration, TimeOffType } from './enums';

export type TimeOffBase = {
  timeOffId: string;
  userId: string;
  date: Date;
  type: TimeOffType;
  duration: TimeOffDuration;
  isPaid: boolean;
};

export type TimeOff = TimeOffBase & CommonFields & { id: number };

export type CreateTimeOff = TimeOffBase;
export type EditTimeOff = Partial<CreateTimeOff>;
