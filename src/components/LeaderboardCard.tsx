
import { User } from "@/types/User";
import { MapPin, Trophy, Star, Code, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getValidProfileImage } from "@/utils/profileUtils";

interface LeaderboardCardProps {
  user: User;
  rank: number;
  onClick: () => void;
}

export const LeaderboardCard = ({ user, rank, onClick }: LeaderboardCardProps) => {
  

  const getRankIcon = (rank: number) => {
    return <span className="text-sm font-semibold">{rank}</span>;
  };

  const profileData = typeof user.avatar === 'string' 
    ? getValidProfileImage(user.avatar, user.id, user.name)
    : user.avatar;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer group hover:border-blue-300 dark:hover:border-blue-600"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - User Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {/* Rank */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 flex-shrink-0 text-white bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-600`}>
            {getRankIcon(rank)}
          </div>

          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              {/* Letter Avatar */}
              <div className={`w-14 h-14 rounded-full ${profileData.color} flex items-center justify-center text-white font-bold text-lg ring-2 ring-white dark:ring-slate-700 shadow-md`}>
                {profileData.initials}
                {user.isLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {user.name}
              </h3>
              {user.fetchError && (
                <div className="flex items-center text-xs text-red-500 mt-1">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Failed to fetch data</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section - Stats */}
        <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
          {/* LeetCode Stats */}
          <div className="text-center min-w-[80px]">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Code className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">LeetCode</span>
            </div>
            {user.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.leetcode.problemsSolved}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">problems solved</div>
              </>
            )}
          </div>

          {/* HackerRank Stats */}
          <div className="text-center min-w-[80px]">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">HackerRank</span>
            </div>
            {user.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <>
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.hackerrank.stars}</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < user.hackerrank.stars ? "text-yellow-400 fill-current" : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.hackerrank.problemsSolved} problems</div>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Badges - Fixed Layout */}
        <div className="hidden lg:flex flex-col items-end space-y-2 flex-shrink-0 w-48">
          <div className="flex flex-wrap gap-1 justify-end w-full">
            {user.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {user.hackerrank.badges.slice(0, 3).map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs whitespace-nowrap max-w-[60px] truncate">
                    {badge}
                  </Badge>
                ))}
                {user.hackerrank.badges.length > 3 && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    +{user.hackerrank.badges.length - 3}
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <ExternalLink className="w-3 h-3 mr-1" />
            View Profile
          </div>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="md:hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex justify-between">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Code className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">LeetCode</span>
            </div>
            {user.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.leetcode.problemsSolved}</div>
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">HackerRank</span>
            </div>
            {user.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.hackerrank.stars} ⭐</div>
            )}
          </div>
        </div>
        
        {/* Mobile Badges */}
        <div className="mt-3 flex flex-wrap gap-1 justify-center">
          {!user.isLoading && user.hackerrank.badges.slice(0, 4).map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
