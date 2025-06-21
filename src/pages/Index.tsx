
import { useState, useEffect } from "react";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { UserProfileModal } from "@/components/UserProfileModal";
import { FilterControls, FilterOptions } from "@/components/FilterControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User } from "@/types/User";
import { mockUsers } from "@/data/mockUsers";
import { profileFetcher } from "@/services/profileFetcher";
import { Trophy, Code, Star, Users } from "lucide-react";

const Index = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [filters, setFilters] = useState<FilterOptions>({
    leetcodeSolved: null,
    hackerrankBadges: null
  });

  // Fetch real data for all users when component loads
  useEffect(() => {
    const fetchAllUserData = async () => {
      console.log('Fetching real data for users...');
      const updatedUsers = await Promise.all(
        mockUsers.map(async (user) => {
          try {
            const updates = await profileFetcher.fetchUserStats(user);
            return { ...user, ...updates };
          } catch (error) {
            console.error(`Error fetching data for ${user.name}:`, error);
            return { ...user, fetchError: 'Failed to fetch data' };
          }
        })
      );
      
      console.log('Updated users with real data:', updatedUsers);
      setUsers(updatedUsers);
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
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{filteredUsers.length}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Total Users</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-slate-600 dark:text-slate-400">
            Leaderboard sorted by LeetCode problems solved ({filteredUsers.length} profiles)
          </p>
        </div>

        {/* Leaderboard Cards */}
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
      </div>

      {/* Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Index;
