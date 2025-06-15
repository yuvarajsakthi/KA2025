
import { useState, useEffect } from "react";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { UserProfileModal } from "@/components/UserProfileModal";
import { CSVUploadModal } from "@/components/CSVUploadModal";
import { FilterControls, FilterOptions } from "@/components/FilterControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, CSVUserData } from "@/types/User";
import { mockUsers } from "@/data/mockUsers";
import { profileFetcher } from "@/services/profileFetcher";
import { getValidProfileImage } from "@/utils/profileUtils";
import { Trophy, Code, Star, Upload, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [isUsingCSVData, setIsUsingCSVData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    leetcodeSolved: null,
    hackerrankStars: null,
    problemsRange: 'all',
    showOnlineOnly: false
  });
  const { toast } = useToast();

  // Load CSV data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('csvData');
    if (savedData) {
      try {
        const csvData = JSON.parse(savedData);
        const fileName = localStorage.getItem('csvFileName') || 'saved_data.csv';
        const newUsers = csvData.map(createUserFromCSV);
        setUsers(newUsers);
        setIsUsingCSVData(true);
        
        toast({
          title: "CSV data restored",
          description: `Loaded ${csvData.length} profiles from ${fileName}`,
        });
        
        // Start fetching data for restored users
        fetchAllUserData(newUsers);
      } catch (error) {
        console.error('Error loading saved CSV data:', error);
      }
    }
  }, []);

  // Apply filters whenever users or filters change
  useEffect(() => {
    let filtered = [...users];

    if (filters.leetcodeSolved) {
      filtered = filtered.filter(user => 
        user.leetcode.problemsSolved >= filters.leetcodeSolved!.min &&
        user.leetcode.problemsSolved <= filters.leetcodeSolved!.max
      );
    }

    if (filters.hackerrankStars) {
      filtered = filtered.filter(user => user.hackerrank.stars >= filters.hackerrankStars!);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const createUserFromCSV = (csvData: CSVUserData): User => {
    const profileData = getValidProfileImage('', csvData.internId, csvData.fullName);
    
    return {
      id: csvData.internId,
      name: csvData.fullName,
      avatar: profileData,
      leetcodeUrl: csvData.leetcodeUrl,
      hackerrankUrl: csvData.hackerrankUrl,
      leetcode: {
        problemsSolved: 0,
        ranking: 0,
        acceptanceRate: 0,
        easyProblems: 0,
        mediumProblems: 0,
        hardProblems: 0
      },
      hackerrank: {
        badges: [],
        stars: 0,
        problemsSolved: 0,
      },
      isLoading: true
    };
  };

  const fetchUserData = async (user: User): Promise<User> => {
    const updatedUser = { ...user, isLoading: true, fetchError: undefined };
    
    try {
      console.log(`Starting data fetch for ${user.name}`);
      
      const [leetcodeStats, hackerrankStats] = await Promise.allSettled([
        user.leetcodeUrl ? 
          profileFetcher.fetchLeetCodeStats(
            profileFetcher.extractUsernameFromUrl(user.leetcodeUrl, 'leetcode')
          ) : null,
        user.hackerrankUrl ? 
          profileFetcher.fetchHackerRankStats(
            profileFetcher.extractUsernameFromUrl(user.hackerrankUrl, 'hackerrank')
          ) : null
      ]);

      if (leetcodeStats.status === 'fulfilled' && leetcodeStats.value) {
        updatedUser.leetcode = leetcodeStats.value;
        console.log(`LeetCode data fetched for ${user.name}:`, leetcodeStats.value);
      } else {
        console.log(`LeetCode data fetch failed for ${user.name}`);
      }

      if (hackerrankStats.status === 'fulfilled' && hackerrankStats.value) {
        updatedUser.hackerrank = hackerrankStats.value;
        console.log(`HackerRank data fetched for ${user.name}:`, hackerrankStats.value);
      } else {
        console.log(`HackerRank data fetch failed for ${user.name}`);
      }

      updatedUser.isLoading = false;
      console.log(`Data fetch completed for ${user.name}`);
      return updatedUser;
    } catch (error) {
      console.error(`Error fetching data for ${user.name}:`, error);
      updatedUser.isLoading = false;
      updatedUser.fetchError = 'Failed to fetch profile data';
      return updatedUser;
    }
  };

  const fetchAllUserData = async (userList: User[]) => {
    console.log(`Starting data fetch for ${userList.length} users`);
    
    const fetchPromises = userList.map((user, index) => 
      new Promise<User>((resolve) => {
        setTimeout(async () => {
          const updatedUser = await fetchUserData(user);
          resolve(updatedUser);
        }, index * 3000); // 3 second delay between requests to avoid rate limiting
      })
    );

    fetchPromises.forEach((promise, index) => {
      promise.then((updatedUser) => {
        setUsers(prev => prev.map((user, i) => i === index ? updatedUser : user));
      });
    });
  };

  const handleCSVUpload = async (csvData: CSVUserData[]) => {
    setIsUsingCSVData(true);
    const newUsers = csvData.map(createUserFromCSV);
    setUsers(newUsers);

    toast({
      title: "Fetching profile data...",
      description: "This may take a while due to rate limiting.",
    });

    fetchAllUserData(newUsers);
  };

  const refreshData = async () => {
    if (!isUsingCSVData) {
      toast({
        title: "No CSV data",
        description: "Upload a CSV file first to refresh data.",
        variant: "destructive"
      });
      return;
    }

    setIsRefreshing(true);
    
    const refreshPromises = users.map((user, index) => 
      new Promise<User>((resolve) => {
        setTimeout(async () => {
          const updatedUser = await fetchUserData({ ...user, isLoading: true });
          resolve(updatedUser);
        }, index * 1500);
      })
    );

    refreshPromises.forEach((promise, index) => {
      promise.then((updatedUser) => {
        setUsers(prev => prev.map((user, i) => i === index ? updatedUser : user));
      });
    });

    await Promise.allSettled(refreshPromises);
    setIsRefreshing(false);
    
    toast({
      title: "Data refreshed",
      description: "All profiles have been updated with latest data.",
    });
  };

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
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  KA2025_Batch1
                </h1>
                {/* <p className="text-sm text-slate-600 dark:text-slate-400">Track your competitive programming journey</p> */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCSVModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload CSV</span>
              </Button>
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
            {/* <FilterControls onFilterChange={setFilters} currentFilters={filters} /> */}
            {isUsingCSVData && (
              <Button 
                onClick={refreshData} 
                disabled={isRefreshing}
                variant="outline"
                className="whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            )}
          </div>
          
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

      {/* Modals */}
      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onDataUpload={handleCSVUpload}
      />
      
      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Index;
