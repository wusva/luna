export type SwipeDirection = "like" | "dislike" | "superlike";

export type Gender = "male" | "female" | "other";
export type LookingFor = "male" | "female" | "everyone";

export interface Profile {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  name: string;
  bio: string;
  birth_date: string;
  gender: Gender;
  looking_for: LookingFor;
  is_active: boolean;
  is_banned: boolean;
  is_admin: boolean;
  is_onboarded: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  profile_id: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  is_active: boolean;
  created_at: string;
  other_user?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  description: string;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter?: Profile;
  reported?: Profile;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_matches: number;
  total_messages: number;
  pending_reports: number;
  users_today: number;
  matches_today: number;
}
