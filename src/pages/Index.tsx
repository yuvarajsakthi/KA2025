
import { useState, useEffect } from "react";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { UserProfileModal } from "@/components/UserProfileModal";
import { FilterControls, FilterOptions } from "@/components/FilterControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User } from "@/types/User";
import { mockUsers } from "@/data/mockUsers";
import { profileFetcher } from "@/services/profileFetcher";
import { Trophy, Code, Star, Users, TestTube } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    leetcodeSolved: null,
    hackerrankBadges: null
  });

  // Fetch real data for all users when component loads
  useEffect(() => {
    const fetchAllUserData = async () => {
      setIsLoading(true);
      setFetchedCount(0);
      console.log('Fetching real data for users...');
      
      try {
        const updatedUsers: User[] = [];
        
        for (let i = 0; i < mockUsers.length; i++) {
          const user = mockUsers[i];
          try {
            const updates = await profileFetcher.fetchUserStats(user);
            updatedUsers.push({ ...user, ...updates });
          } catch (error) {
            console.error(`Error fetching data for ${user.name}:`, error);
            updatedUsers.push({ ...user, fetchError: 'Failed to fetch data' });
          }
          setFetchedCount(i + 1);
        }
        
        console.log('Updated users with real data:', updatedUsers);
        setUsers(updatedUsers);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUserData();
  }, []);

  // Apply filters and sort by LeetCode problems solved
  useEffect(() => {
    let filtered = [...users];

    if (filters.leetcodeSolved) {
      filtered = filtered.filter(user => 
        user.leetcode.problemsSolved >= filters.leetcodeSolved!.min &&
        user.leetcode.problemsSolved <= filters.leetcodeSolved!.max
      );
    }

    if (filters.hackerrankBadges) {
      filtered = filtered.filter(user => 
        user.hackerrankBadges.length >= filters.hackerrankBadges!.min &&
        user.hackerrankBadges.length <= filters.hackerrankBadges!.max
      );
    }

    // Sort by LeetCode problems solved (descending)
    filtered.sort((a, b) => b.leetcode.problemsSolved - a.leetcode.problemsSolved);

    setFilteredUsers(filtered);
  }, [users, filters]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl">
                {/* <Trophy className="w-6 h-6 text-white" /> */}
                <img src="/logo.png" alt="KA2025 Logo" className="w-14 h-14" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  KA2k25
                </h1>
                {/* <p className="text-sm text-slate-600 dark:text-slate-400">Track your competitive programming journey</p> */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>LeetCode Stats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>HackerRank Badges</span>
                </div>
                {/* <Link 
                  to="/test-badges" 
                  className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Test Badges</span>
                </Link> */}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <FilterControls onFilterChange={setFilters} currentFilters={filters} />
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-blue-500 mr-1" />
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{filteredUsers.length}</p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-400">Total Users</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-slate-600 dark:text-slate-400">
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading leaderboard data...
              </span>
            ) : (
              `Leaderboard sorted by LeetCode problems solved (${filteredUsers.length} profiles)`
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Fetching User Data...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading LeetCode stats and HackerRank badges for all users
              </p>
              <div className="mt-3 mb-4">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {fetchedCount} / {mockUsers.length} users fetched
                </p>
                <div className="w-64 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mx-auto mt-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(fetchedCount / mockUsers.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          /* Leaderboard Cards */
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <LeaderboardCard
                key={user.id}
                user={user}
                rank={index + 1}
                onClick={() => handleUserClick(user)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      
      {/* Watermark Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Developed by{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Yuvaraj
              </span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              &copy; {new Date().getFullYear()} KA2k25 - Competitive Programming Leaderboard
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
