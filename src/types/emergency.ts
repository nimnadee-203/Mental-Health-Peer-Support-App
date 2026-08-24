export enum EmergencyType {
  IMMEDIATE_DANGER = 'IMMEDIATE_DANGER',
  MEDICAL = 'MEDICAL',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  TRUSTED_CONTACT = 'TRUSTED_CONTACT',
}

export enum EmergencyStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export interface EmergencyRequest {
  _id: string;
  userId: string;
  type: EmergencyType;
  status: EmergencyStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContact {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
