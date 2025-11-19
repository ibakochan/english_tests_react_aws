


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
  picture: string;
  user?: number;
  is_instructor?: boolean;
  member_type?: string;
  total_participation?: number;
  this_month_participation?: number;
  level: number;
  level_participation?: Record<number, number>;
  phone_number?: string;
  emergency_number?: string;
  contract?: string;
  other_information?: string;
  introduction?: string;
  participations?: Participation[];
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
};