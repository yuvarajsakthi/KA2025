import { LeetCodeStats, HackerRankStats } from '@/types/User';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class RateLimitManager {
  private static instance: RateLimitManager;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly RATE_LIMIT = 3;
  private readonly WINDOW_MS = 60 * 1000;

  private constructor() {}

  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }

  async checkRateLimit(service: string): Promise<boolean> {
    const now = Date.now();
    const key = service;
    const current = this.requestCounts.get(key);

    if (!current || now > current.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }

    if (current.count >= this.RATE_LIMIT) {
      const waitTime = current.resetTime - now;
      console.log(`Rate limit hit for ${service}, waiting ${waitTime}ms`);
      await delay(waitTime);
      this.requestCounts.set(key, { count: 1, resetTime: Date.now() + this.WINDOW_MS });
      return true;
    }

    current.count++;
    return true;
  }
}

export class ProfileFetcher {
  private rateLimitManager = RateLimitManager.getInstance();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000;

  private shouldUseProxy(service: string): boolean {
    return service === 'leetcode' || service === 'hackerrank';
  }

  private getProxyUrl(url: string): string {
    const proxies = [
      'https://corsproxy.io/?',
      'https://proxy.cors.sh/',
      'https://thingproxy.freeboard.io/fetch/'
    ];
    
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    return `${proxy}${encodeURIComponent(url)}`;
  }

  private getDefaultHeaders(service: string): Record<string, string> {
    const commonHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    switch (service) {
      case 'leetcode':
        return {
          ...commonHeaders,
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://leetcode.com/'
        };
      case 'hackerrank':
        return {
          ...commonHeaders,
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.hackerrank.com/'
        };
      default:
        return commonHeaders;
    }
  }

  private async fetchWithRetry<T>(
    url: string,
    service: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.rateLimitManager.checkRateLimit(service);

        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
          return cached.data;
        }

        const proxyUrl = this.shouldUseProxy(service) 
          ? this.getProxyUrl(url)
          : url;

        const response = await fetch(proxyUrl, {
          ...options,
          headers: {
            ...this.getDefaultHeaders(service),
            ...options.headers,
          },
          credentials: 'omit'
        });

        if (response.status === 429) {
          const backoffDelay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
          await delay(backoffDelay);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        this.cache.set(url, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${service}:`, error);
        
        if (attempt === maxRetries) {
          return null;
        }
        
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
    return null;
  }

  async fetchLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
    if (!username) return null;

    try {
      // First try public API
      const publicData = await this.fetchWithRetry<any>(
        `https://leetcode-stats-api.herokuapp.com/${username}`,
        'leetcode-public'
      );

      if (publicData && publicData.status !== 'error') {
        return {
          problemsSolved: publicData.totalSolved,
          ranking: publicData.ranking,
          acceptanceRate: publicData.acceptanceRate,
          easyProblems: publicData.easySolved,
          mediumProblems: publicData.mediumSolved,
          hardProblems: publicData.hardSolved,
        };
      }

      // Fallback to GraphQL API
      const graphqlQuery = {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              profile {
                ranking
              }
            }
          }
        `,
        variables: { username }
      };

      const graphqlData = await this.fetchWithRetry<any>(
        'https://leetcode.com/graphql',
        'leetcode',
        {
          method: 'POST',
          body: JSON.stringify(graphqlQuery)
        }
      );

      if (!graphqlData?.data?.matchedUser) return null;

      const user = graphqlData.data.matchedUser;
      const stats = user.submitStats.acSubmissionNum;
      
      const easyProblems = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
      const mediumProblems = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
      const hardProblems = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;
      const totalSolved = easyProblems + mediumProblems + hardProblems;
      
      return {
        problemsSolved: totalSolved,
        ranking: user.profile?.ranking || 0,
        acceptanceRate: 0,
        easyProblems,
        mediumProblems,
        hardProblems,
      };
    } catch (error) {
      console.error(`Error fetching LeetCode stats for ${username}:`, error);
      return null;
    }
  }

  async fetchHackerRankStats(username: string): Promise<HackerRankStats | null> {
    if (!username) return null;

    try {
      // Fetch badges data which contains all needed information
      const badgesResponse = await this.fetchWithRetry<any>(
        `https://www.hackerrank.com/rest/hackers/${username}/badges`,
        'hackerrank'
      );

      if (!badgesResponse?.models) {
        throw new Error('No badges data found');
      }

      // Extract badge names and stars
      const badges = badgesResponse.models.map((badge: any) => ({
        name: badge.badge_name,
        stars: badge.stars
      }));

      // Calculate total problems solved by summing all solved challenges
      const totalSolved = badgesResponse.models.reduce(
        (sum: number, badge: any) => sum + (badge.solved || 0), 0
      );

      // Get the highest star count from all badges
      const maxStars = Math.max(...badges.map((b: any) => b.stars), 1);

      return {
        badges: badges.map(b => b.name).slice(0, 6),
        stars: Math.min(5, maxStars), // Cap at 5 stars max
        problemsSolved: totalSolved
      };
    } catch (error) {
      console.error(`Error fetching HackerRank stats for ${username}:`, error);
      return {
        badges: [],
        stars: 0,
        problemsSolved: 0
      };
    }
  }

  extractUsernameFromUrl(url: string, platform: 'leetcode' | 'hackerrank'): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (platform === 'leetcode') {
        const userIndex = pathParts.findIndex(part => part === 'u');
        return userIndex >= 0 ? pathParts[userIndex + 1] : pathParts[0] || '';
      } else {
        const profileIndex = pathParts.findIndex(part => part === 'profile');
        return profileIndex >= 0 ? pathParts[profileIndex + 1] : pathParts[0] || '';
      }
    } catch {
      return '';
    }
  }
}

export const profileFetcher = new ProfileFetcher();