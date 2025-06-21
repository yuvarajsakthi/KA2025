
export interface LeetCodeStats {
  problemsSolved: number;
  ranking: number;
  acceptanceRate: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
}

export interface HackerRankBadge {
  badge_category: string;
  badge_type: string;
  category_name: string | null;
  badge_name: string;
  badge_short_name: string | null;
  total_stars: number;
  total_points: number | null;
  url: string;
  solved: number;
  total_challenges: number;
  track_total_score?: number;
  hacker_rank?: number;
  stars: number;
  level: number;
  current_points: number;
  progress_to_next_star: number;
  upcoming_level: string | null;
}

export interface HackerRankBadgesResponse {
  status: boolean;
  models: HackerRankBadge[];
  version: number;
}

export interface HackerRankCertificate {
  id: string;
  type: string;
  attributes: {
    status: string;
    username: string;
    unlock_date: string;
    certificate: {
      track_slug: string;
      label: string;
      level: string;
      skill_unique_id: string;
      description: string;
    };
    certificates: string[];
    certificate_image: string;
    hacker_name: string;
    completed_at: string;
    score: number;
    type: string;
  };
}

export interface HackerRankCertificatesResponse {
  data: HackerRankCertificate[];
}

export interface User {
  id: string;
  name: string;
  avatar: { type: 'letter'; initials: string; color: string } | string;
  githubUrl: string;
  leetcodeUrl: string;
  hackerrankUrl: string;
  leetcode: LeetCodeStats;
  hackerrankBadges: HackerRankBadge[];
  hackerrankCertificates: HackerRankCertificate[];
  fetchError?: string;
}

export interface CSVUserData {
  internId: string;
  fullName: string;
  hackerrankUrl: string;
  leetcodeUrl: string;
}
