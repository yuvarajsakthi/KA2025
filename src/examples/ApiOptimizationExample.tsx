import React, { useState, useEffect } from 'react';
import { User } from '@/types/User';
import { 
  initializeProfileData, 
  profileFetcher, 
  clearProfileCache,
  fetchWithCache 
} from '@/services/profileFetcher';

/**
 * Example component demonstrating the optimized API system
 * 
 * Features demonstrated:
 * 1. Cache-first data loading
 * 2. Background updates
 * 3. Progress tracking
 * 4. Manual refresh
 * 5. Cache management
 */
const ApiOptimizationExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundUpdate, setBackgroundUpdate] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    addLog('🚀 Initializing profile data...');
    
    try {
      const initialUsers = await initializeProfileData(
        // Progress callback
        (current, total) => {
          setProgress({ current, total });
          setBackgroundUpdate(true);
          addLog(`📊 Background update: ${current}/${total}`);
        },
        // Completion callback
        (updatedUsers) => {
          setUsers(updatedUsers);
          setBackgroundUpdate(false);
          addLog(`✅ Background update completed! ${updatedUsers.length} users updated`);
        }
      );
      
      setUsers(initialUsers);
      addLog(`📦 Loaded ${initialUsers.length} users from cache`);
    } catch (error) {
      addLog(`❌ Failed to initialize: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    addLog('🔄 Starting manual refresh...');
    setLoading(true);
    setBackgroundUpdate(true);
    
    try {
      const updatedUsers = await profileFetcher.fetchAllUsersDataSequentially(
        (current, total, user) => {
          setProgress({ current, total });
          addLog(`🔄 Fetching: ${user.name} (${current}/${total})`);
        }
      );
      
      setUsers(updatedUsers);
      addLog(`✅ Manual refresh completed! ${updatedUsers.length} users updated`);
    } catch (error) {
      addLog(`❌ Manual refresh failed: ${error}`);
    } finally {
      setLoading(false);
      setBackgroundUpdate(false);
    }
  };

  const handleClearCache = () => {
    clearProfileCache();
    addLog('🗑️ Cache cleared! Refresh page to reload data.');
  };

  const handleTestSpecificUser = async () => {
    addLog('🧪 Testing specific user API call...');
    
    try {
      // Test with a specific user from mockUsers
      const testUser = users[0];
      if (testUser) {
        const username = profileFetcher.extractUsernameFromUrl(testUser.hackerrankUrl);
        addLog(`🔍 Testing HackerRank API for: ${username}`);
        
        const badges = await profileFetcher.fetchHackerRankBadges(username);
        const certificates = await profileFetcher.fetchHackerRankCertificates(username);
        
        addLog(`📊 Badges: ${badges?.models?.length || 0}, Certificates: ${certificates?.data?.length || 0}`);
      }
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
    }
  };

  const getCacheStats = () => {
    return profileFetcher.getCacheStatistics();
  };

  const cacheStats = getCacheStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🚀 API Optimization Demo</h1>
        
        {/* Control Panel */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Manual Refresh'}
          </button>
          
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Clear Cache
          </button>
          
          <button
            onClick={handleTestSpecificUser}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🧪 Test API Call
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🔄 Reload Page
          </button>
        </div>

        {/* Progress Bar */}
        {backgroundUpdate && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-700 font-medium">
                📊 {loading ? 'Manual Update' : 'Background Update'} in Progress...
              </span>
              <span className="text-blue-600">
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.hackerrankBadges.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Users with Badges</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{cacheStats.cacheKeys.length}</div>
            <div className="text-sm text-gray-600">Cache Entries</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(cacheStats.totalCacheSize / 1024)}KB
            </div>
            <div className="text-sm text-gray-600">Cache Size</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Cache Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">LeetCode Stats: {cacheStats.leetcodeEntries}</p>
              <p className="font-medium">HackerRank Badges: {cacheStats.hackerrankBadgeEntries}</p>
              <p className="font-medium">HackerRank Certificates: {cacheStats.hackerrankCertificateEntries}</p>
            </div>
            <div>
              <p className="font-medium">Total Entries: {cacheStats.cacheKeys.length}</p>
              <p className="font-medium">Cache Size: {(cacheStats.totalCacheSize / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {users.slice(0, 6).map((user) => (
            <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-sm mb-2 truncate">{user.name}</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>LeetCode:</span>
                  <span className="font-medium">{user.leetcode.problemsSolved} problems</span>
                </div>
                <div className="flex justify-between">
                  <span>HackerRank:</span>
                  <span className="font-medium">{user.hackerrankBadges.length} badges</span>
                </div>
                <div className="flex justify-between">
                  <span>Certificates:</span>
                  <span className="font-medium">{user.hackerrankCertificates.length}</span>
                </div>
                {user.fetchError && (
                  <div className="text-red-500 text-xs mt-2">
                    ⚠️ {user.fetchError}
                  </div>
                )}
              </div>
              
              {/* Show all badge details */}
              {user.hackerrankBadges.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <div className="text-xs text-gray-500 mb-1">HackerRank Badges ({user.hackerrankBadges.length}):</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {user.hackerrankBadges.map((badge, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="font-medium text-blue-600">{badge.badge_name}</div>
                        <div className="text-gray-600 flex justify-between">
                          <span>⭐ {badge.stars}/{badge.total_stars}</span>
                          <span>✅ {badge.solved}/{badge.total_challenges}</span>
                        </div>
                        {badge.level && (
                          <div className="text-gray-500 text-xs">Level: {badge.level}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {users.length > 6 && (
          <div className="text-center text-gray-500 mb-6">
            ... and {users.length - 6} more users
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Activity Log</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No activity yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Implementation Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔧 Implementation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">✅ Features Implemented:</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Real HackerRank API integration</li>
              <li>• localStorage caching (30min expiry)</li>
              <li>• Sequential API calls with delays</li>
              <li>• Background updates</li>
              <li>• Progress tracking</li>
              <li>• Error handling with fallbacks</li>
              <li>• Cache management utilities</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">📊 API Endpoints Used:</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• <code className="bg-gray-100 px-1 rounded">hackerrank.com/rest/hackers/{'{username}'}/badges</code></li>
              <li>• <code className="bg-gray-100 px-1 rounded">hackerrank.com/community/v1/test_results/hacker_certificate</code></li>
              <li>• <code className="bg-gray-100 px-1 rounded">leetcode-stats-api.herokuapp.com/{'{username}'}</code></li>
            </ul>
            
            <h3 className="font-semibold mb-2 mt-4">🎯 Data Extracted:</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• badge_name, total_stars, solved</li>
              <li>• stars, total_challenges</li>
              <li>• Certificate details</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Watermark Footer */}
      <footer className="mt-8 py-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Made with ❤️ by{' '}
            <span className="font-semibold text-gray-700">
              Yuvaraj
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            KA2k25 - API Optimization Demo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ApiOptimizationExample;