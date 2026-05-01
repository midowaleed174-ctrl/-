export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin' | 'owner';
  createdAt: any;
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  serviceTitle?: string;
  price?: number;
  day: string; // "Saturday", "Sunday", etc.
  date: string; // YYYY-MM-DD
  time: string;
  patientName: string;
  patientPhone: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  cancellationReason?: string;
  createdAt: any;
  userEmail?: string; // For admin view
  dentistId: string;
  dentistName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'inquiry' | 'system';
  read: boolean;
  createdAt: any;
}

export interface Dentist {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  photo: string;
}

export interface Inquiry {
  id: string;
  userId: string;
  message: string;
  imageUrl?: string;
  response?: string;
  respondedAt?: any;
  createdAt: any;
  userEmail?: string; // For admin view
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features?: string[];
  price: number;
  icon?: string;
  order?: number;
}

export interface OffDay {
  id: string;
  day: string;
  reason?: string;
  createdAt: any;
}

export interface ClinicSettings {
  address: string;
  workingHours: {
    [key: string]: { start: string; end: string; closed: boolean };
  };
  templates: {
    appointmentConfirmed: string;
    appointmentPostponed: string;
    appointmentCancelled: string;
    inquiryResponded: string;
  };
}

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'admin' | 'owner';
}
