import React, { useState, useEffect } from 'react';
import { User } from '@/types/User';
import { initializeProfileData, clearProfileCache, profileFetcher } from '@/services/profileFetcher';

interface ProfileDataManagerProps {
  onDataUpdate?: (users: User[]) => void;
}

export const ProfileDataManager: React.FC<ProfileDataManagerProps> = ({ onDataUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [backgroundUpdate, setBackgroundUpdate] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const initialUsers = await initializeProfileData(
        (current, total) => {
          setProgress({ current, total });
          setBackgroundUpdate(true);
        },
        (updatedUsers) => {
          setUsers(updatedUsers);
          setBackgroundUpdate(false);
          if (onDataUpdate) {
            onDataUpdate(updatedUsers);
          }
        }
      );
      
      setUsers(initialUsers);
      if (onDataUpdate) {
        onDataUpdate(initialUsers);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    setBackgroundUpdate(true);
    try {
      const updatedUsers = await profileFetcher.fetchAllUsersDataSequentially(
        (current, total, user) => {
          setProgress({ current, total });
          console.log(`Updating ${user.name}...`);
        }
      );
      
      setUsers(updatedUsers);
      if (onDataUpdate) {
        onDataUpdate(updatedUsers);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
      setBackgroundUpdate(false);
    }
  };

  const handleClearCache = () => {
    clearProfileCache();
    alert('Cache cleared! Refresh the page to reload data.');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Profile Data Manager</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {backgroundUpdate && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700">
              Updating data in background...
            </span>
            <span className="text-sm text-blue-600">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.slice(0, 6).map((user) => (
          <div key={user.id} className="p-3 border rounded-lg">
            <h3 className="font-medium text-sm mb-2">{user.name}</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>LeetCode: {user.leetcode.problemsSolved} problems</div>
              <div>HackerRank Badges: {user.hackerrankBadges.length}</div>
              <div>Certificates: {user.hackerrankCertificates.length}</div>
              {user.fetchError && (
                <div className="text-red-500">Error: {user.fetchError}</div>
              )}
            </div>
            
            {/* Show all HackerRank badges */}
            {user.hackerrankBadges.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-gray-500 mb-1">Badges ({user.hackerrankBadges.length}):</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {user.hackerrankBadges.map((badge, index) => (
                    <div key={index} className="text-xs bg-gray-50 p-1 rounded">
                      <div className="font-medium text-blue-600 truncate">{badge.badge_name}</div>
                      <div className="text-gray-600 text-xs">
                        ⭐ {badge.stars}/{badge.total_stars} | ✅ {badge.solved}/{badge.total_challenges}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length > 6 && (
        <div className="mt-4 text-center text-gray-500">
          ... and {users.length - 6} more users
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>Total users: {users.length}</p>
        <p>Cache strategy: Load from localStorage first, update in background</p>
        <p>API calls: Sequential with 1-second delays to respect rate limits</p>
      </div>
    </div>
  );
};

export default ProfileDataManager;