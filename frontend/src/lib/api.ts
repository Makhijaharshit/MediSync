const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "patient" | "doctor" | "paramedic" | "admin";
  created_at?: string;
}

export interface MedicalEntity {
  id?: string;
  document_id?: string;
  patient_id?: string;
  type: "diagnosis" | "medication" | "allergy" | "procedure" | "doctor_note" | "lab_result";
  value: string;
  details?: string;
  confidence: number;
  verified: boolean;
  source_page?: number;
  date_recorded?: string;
  created_at?: string;
}

export interface MedicalDocument {
  id: string;
  patient_id: string;
  title: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: "pending" | "processing" | "unverified" | "verified";
  ocr_text?: string;
  entities: MedicalEntity[];
  created_at: string;
  updated_at: string;
}

export interface TimelineItem {
  id: string;
  type: string;
  value: string;
  details?: string;
  confidence: number;
  verified: boolean;
  date_recorded?: string;
  created_at?: string;
  source_document_id?: string;
  source_document_title?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface EmergencyProfile {
  user_id: string;
  full_name: string;
  email: string;
  blood_group: string;
  dob?: string;
  phone?: string;
  emergency_contacts: EmergencyContact[];
  allergies: string[];
  chronic_conditions: string[];
  notes?: string;
  updated_at?: string;
}

export interface EmergencyEvent {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_blood_group?: string;
  patient_phone?: string;
  status: "active" | "resolved" | "cancelled";
  latitude?: number;
  longitude?: number;
  location_name?: string;
  notes?: string;
  triggered_at: string;
  resolved_at?: string;
}

export interface PatientSummary {
  patient_id: string;
  full_name: string;
  email: string;
  blood_group: string;
  phone?: string;
  dob?: string;
  total_documents: number;
  total_records: number;
  allergies: string[];
  chronic_conditions: string[];
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email: string;
  action: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("medsync_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      return request<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    },
    register: async (email: string, password: string, full_name: string, role = "patient") => {
      return request<{ access_token: string; user: User }>("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name, role }),
      });
    },
    me: async () => {
      return request<User>("/auth/me");
    },
  },

  documents: {
    list: async (patientId?: string) => {
      const q = patientId ? `?patient_id=${patientId}` : "";
      return request<MedicalDocument[]>(`/documents${q}`);
    },
    get: async (id: string) => {
      return request<MedicalDocument>(`/documents/${id}`);
    },
    upload: async (file: File, title?: string, patientId?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (patientId) formData.append("patient_id", patientId);

      const headers = getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.detail || "File upload failed");
      }
      return res.json() as Promise<MedicalDocument>;
    },
    verify: async (id: string, entities: MedicalEntity[]) => {
      return request<MedicalDocument>(`/documents/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entities }),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/documents/${id}`, {
        method: "DELETE",
      });
    },
    getFileUrl: (id: string) => `${API_BASE_URL}/documents/${id}/file`,
  },

  timeline: {
    get: async (category?: string, patientId?: string, onlyVerified = true) => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (patientId) params.append("patient_id", patientId);
      params.append("only_verified", String(onlyVerified));
      return request<TimelineItem[]>(`/timeline?${params.toString()}`);
    },
    delete: async (id: string) => {
      return request<{ success: boolean; message: string }>(`/timeline/${id}`, {
        method: "DELETE",
      });
    },
  },

  emergency: {
    getProfile: async (patientId?: string) => {
      const q = patientId ? `?patient_id=${patientId}` : "";
      return request<EmergencyProfile>(`/emergency/profile${q}`);
    },
    updateProfile: async (profile: Partial<EmergencyProfile>) => {
      return request<EmergencyProfile>("/emergency/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
    },
    triggerSOS: async (data: { latitude?: number; longitude?: number; location_name?: string; notes?: string }) => {
      return request<EmergencyEvent>("/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    getEvents: async (statusFilter?: string) => {
      const q = statusFilter ? `?status_filter=${statusFilter}` : "";
      return request<EmergencyEvent[]>(`/emergency/events${q}`);
    },
    resolveEvent: async (id: string) => {
      return request<EmergencyEvent>(`/emergency/events/${id}/resolve`, {
        method: "POST",
      });
    },
  },

  doctor: {
    listPatients: async () => {
      return request<PatientSummary[]>("/doctor/patients");
    },
    getPatientDetail: async (id: string) => {
      return request<any>(`/doctor/patient/${id}`);
    },
    addEvent: async (patient_id: string, type: string, value: string, details?: string, date_recorded?: string) => {
      return request<MedicalEntity>("/doctor/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id, type, value, details, date_recorded }),
      });
    },
  },

  audit: {
    list: async () => {
      return request<AuditLog[]>("/audit");
    },
  },
};
