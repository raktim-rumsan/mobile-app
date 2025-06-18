interface Config {
  HOST: string;
  PORT: number;
  SECURE: boolean;
  PASSWORD: string;
  USERNAME: string;
}

export type UpdateSetting = {
  [key: string]: Config | null;
};

export type Setting = {
  name: string;
  value: Record<string, any>;
  dataType?: string;
  requiredFields?: string[];
  isReadOnly?: boolean;
  isPrivate?: boolean;
};

export type SettingDataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'OBJECT';
export const SettingDataType = {
  STRING: 'STRING' as SettingDataType,
  NUMBER: 'NUMBER' as SettingDataType,
  BOOLEAN: 'BOOLEAN' as SettingDataType,
  OBJECT: 'OBJECT' as SettingDataType,
};
