// leave-context.tsx

import { TimeOffDuration } from '@/rumsan/types/raman/enums';
import { CreateTimeOffRequest } from '@/rumsan/types/raman/timeOffRequest.type';
import React, { createContext, useContext, useState } from 'react';


export interface DayDetail {
  date: string; // ISO string
  timeOffDuration: TimeOffDuration;
}

export type LeaveData = CreateTimeOffRequest;

export interface LeaveContextType {
  leaveData: CreateTimeOffRequest;
  setLeaveData: React.Dispatch<React.SetStateAction<CreateTimeOffRequest>>;
}

const defaultLeaveData: CreateTimeOffRequest = {
  userId: '',
  type: 'PERSONAL', 
  startDate: new Date(),
  endDate: new Date(),
  daysDetails: {},
  totalDays: 0,
  status: 'PENDING', 
  description: '',
  extras: {},
  attachments: {},
  isPaid: false,
  project: '',
  approvalDetails: {},
  approvalChallenge: '',
  TimeOff: [],
};



const LeaveContext = createContext<LeaveContextType | null>(null);

export const LeaveProvider = ({ children }: { children: React.ReactNode }) => {
  const [leaveData, setLeaveData] = useState<LeaveData>(defaultLeaveData);

  return (
    <LeaveContext.Provider value={{ leaveData, setLeaveData }}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeaveRequest = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeaveRequest must be used within a LeaveProvider');
  }
  return context;
};
