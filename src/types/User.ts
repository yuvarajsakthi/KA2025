
export interface LeetCodeStats {
  problemsSolved: number;
  ranking: number;
  acceptanceRate: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
}

export interface HackerRankStats {
  badges: string[];
  stars: number;
  problemsSolved: number;
}

export interface User {
  id: string;
  name: string;
  avatar: { type: 'letter'; initials: string; color: string } | string;
  leetcodeUrl: string;
  hackerrankUrl: string;
  leetcode: LeetCodeStats;
  hackerrank: HackerRankStats;
  isLoading?: boolean;
  fetchError?: string;
}

export interface CSVUserData {
  internId: string;
  fullName: string;
  hackerrankUrl: string;
  leetcodeUrl: string;
}
