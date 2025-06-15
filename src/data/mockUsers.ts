
import { User } from "@/types/User";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Yuvaraj S",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    leetcodeUrl: "https://leetcode.com/alexchen",
    hackerrankUrl: "https://hackerrank.com/alexchen",
    leetcode: {
      problemsSolved: 847,
      ranking: 12543,
      acceptanceRate: 68.5,
      easyProblems: 312,
      mediumProblems: 421,
      hardProblems: 114
    },
    hackerrank: {
      badges: ["Problem Solving", "Java", "Python", "SQL"],
      stars: 5,
      problemsSolved: 234,
    }
  },
];
