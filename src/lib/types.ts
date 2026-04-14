export type UserRole = 'supervisor' | 'technician';
export type TechnicianType = 'فني مدخنة' | 'فني تحويلات';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  type?: TechnicianType;
  password?: string;
  target?: number;
}

export interface ProductivityEntry {
  id: string;
  technicianId: string;
  date: string; // ISO format
  gasStoveConversions: number;
  waterHeaterConversions: number;
  householdApplianceReplacements: number;
  commercialApplianceReplacements: number;
  commercialApplianceConversions: number;
  chimneyInstallations: number;
}

export const TECHNICIANS: User[] = [
  { id: '1', name: 'عبده يوسف', role: 'technician', type: 'فني مدخنة', target: 125, password: 'tech1' },
  { id: '2', name: 'محمود الزهرى', role: 'technician', type: 'فني مدخنة', target: 125, password: 'tech2' },
  { id: '3', name: 'عبد التواب الجبالى', role: 'technician', type: 'فني مدخنة', target: 125, password: 'tech3' },
  { id: '4', name: 'سيد صلاح', role: 'technician', type: 'فني تحويلات', target: 220, password: 'tech4' },
  { id: '5', name: 'حسن محمد', role: 'technician', type: 'فني تحويلات', target: 220, password: 'tech5' },
  { id: '6', name: 'عبد الرحمن الفولى', role: 'technician', type: 'فني تحويلات', target: 220, password: 'tech6' },
  { id: '7', name: 'محمود سويلم', role: 'technician', type: 'فني تحويلات', target: 220, password: 'tech7' },
];

export const SUPERVISOR: User = {
  id: 'admin',
  name: 'معتز اسماعيل',
  role: 'supervisor',
  password: 'admin123'
};