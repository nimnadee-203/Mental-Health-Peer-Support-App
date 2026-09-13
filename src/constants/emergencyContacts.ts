export const EMERGENCY_CONTACTS = {
  POLICE: '119',
  AMBULANCE: '1990',
  RESCUE: '110',
} as const;

export type EmergencyContactKey = keyof typeof EMERGENCY_CONTACTS;
