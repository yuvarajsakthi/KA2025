import { User } from "@/types/User";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ExternalLink, Code, Star, TrendingUp, Award, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getValidProfileImage } from "@/utils/profileUtils";

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ user, isOpen, onClose }: UserProfileModalProps) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAcceptanceRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const profileData = typeof user.avatar === 'string' 
    ? getValidProfileImage(user.avatar, user.id, user.name)
    : user.avatar;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              {/* Letter Avatar */}
              <div className={`w-24 h-24 rounded-full ${profileData.color} flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white dark:ring-slate-700 shadow-lg`}>
                {profileData.initials}
                {user.isLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
              

              {user.fetchError && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{user.fetchError}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {user.leetcodeUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                      <Code className="w-4 h-4 mr-2" />
                      LeetCode
                    </a>
                  </Button>
                )}
                {user.hackerrankUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.hackerrankUrl} target="_blank" rel="noopener noreferrer">
                      <Star className="w-4 h-4 mr-2" />
                      HackerRank
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LeetCode Stats */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">LeetCode Stats</h3>
                </div>
                {user.leetcodeUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={user.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>

              {user.isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="ml-2 text-orange-600">Fetching real-time data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.leetcode.problemsSolved}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Problems Solved</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.leetcode.ranking > 0 ? `#${user.leetcode.ranking.toLocaleString()}` : 'N/A'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Global Ranking</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Acceptance Rate</span>
                      <span className={`text-sm font-semibold ${getAcceptanceRateColor(user.leetcode.acceptanceRate)}`}>
                        {user.leetcode.acceptanceRate > 0 ? `${user.leetcode.acceptanceRate}%` : 'N/A'}
                      </span>
                    </div>
                    {user.leetcode.acceptanceRate > 0 && (
                      <Progress value={user.leetcode.acceptanceRate} className="h-2" />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                      <div className="font-semibold text-green-800 dark:text-green-300">{user.leetcode.easyProblems}</div>
                      <div className="text-green-600 dark:text-green-400">Easy</div>
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                      <div className="font-semibold text-yellow-800 dark:text-yellow-300">{user.leetcode.mediumProblems}</div>
                      <div className="text-yellow-600 dark:text-yellow-400">Medium</div>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      <div className="font-semibold text-red-800 dark:text-red-300">{user.leetcode.hardProblems}</div>
                      <div className="text-red-600 dark:text-red-400">Hard</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* HackerRank Stats - Simplified */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">HackerRank Stats</h3>
                </div>
                {user.hackerrankUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={user.hackerrankUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>

              {user.isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  <span className="ml-2 text-green-600">Fetching real-time data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < user.hackerrank.stars ? "text-yellow-400 fill-current" : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{user.hackerrank.stars} Stars</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.hackerrank.problemsSolved}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Problems Solved</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Badges Section */}
          {user.hackerrank.badges.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Badges</h3>
              </div>
              
              {user.isLoading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <span className="ml-2 text-purple-600">Loading badges...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.hackerrank.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};