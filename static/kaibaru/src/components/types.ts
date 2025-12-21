


export interface Participation {
  total_participation: number;
  this_month_participation: number;
  level_participation: Record<number, number>;
  last_participation_date?: string | null;
  lesson: number;      
}

export interface Member {
  id: number;
  full_name: string;
  furigana?: string;
  picture: string;
  user?: number;
  is_instructor?: boolean;
  is_manager?: boolean; 
  member_type?: string;
  total_participation?: number;
  manual_total_participation?: number; 
  this_month_participation?: number;
  level: number;
  level_participation?: Record<number, number>;
  manual_level_counts?: Record<number, number>;
  phone_number?: string;
  emergency_number?: string;
  contract?: string;
  other_information?: string;
  introduction?: string;
  participations?: Participation[];
  participation_limit?: number;
  is_kyukai?: boolean;
  is_kyukai_paid?: boolean;       
  kyukai_since?: string; 
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface HomeImageType {
  id: number;
  image: string,
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Club {
  subdomain: string;
  members: Member[];
  current_user?: User;
  owner: number;
  lessons: LessonType[];
  picture?: string;

  id: number;
  name: string;
  home?: string;
  instagram_url?: string;
  facebook_url?: string;
  title?: string; 
  search_description?: string;
  favicon?: string; 
  og_image?: string;
  line_url?: string;
  line_qr_code?: string;
  system?: string;
  trial?: string;
  contact?: string;
  home_images?: HomeImageType[];

  has_levels: boolean;
  has_attendance: boolean;
  level_names?: Record<number, string>;
  level_milestones?: Record<number, number>;

  trial_start_date?: string; // ISO date string
  expiration_date?: string; // ISO date string
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_active: boolean;
  warning_message?: string;
  frozen?: boolean;
  frozen_deleted_unpaid_members?: number;
}


export type LessonType = {
  id: number; 
  title: string;
  picture: string;
  weekday: number; // 0=Mon, 6=Sun
  start_time: string;
  end_time: string;
  description?: string;
  instructor?: Member | null;

  total_participation?: number;
  monthly_participation?: number;
  monthly_average?: number;
};