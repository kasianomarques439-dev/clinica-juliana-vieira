export type SlotStatus = "open" | "booked" | "blocked";
export type AppointmentStatus = "confirmed" | "cancelled";

export interface Procedure {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  id: string;
  slot_date: string; // YYYY-MM-DD
  slot_time: string; // HH:mm:ss
  status: SlotStatus;
  procedure_id: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  slot_id: string;
  procedure_id: string;
  full_name: string;
  phone: string;
  cpf: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: "admin";
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      procedures: {
        Row: Procedure;
        Insert: Partial<Procedure> & { name: string };
        Update: Partial<Procedure>;
      };
      available_slots: {
        Row: AvailableSlot;
        Insert: Partial<AvailableSlot> & { slot_date: string; slot_time: string };
        Update: Partial<AvailableSlot>;
      };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment> & {
          slot_id: string;
          procedure_id: string;
          full_name: string;
          phone: string;
          cpf: string;
        };
        Update: Partial<Appointment>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
      };
    };
  };
}
