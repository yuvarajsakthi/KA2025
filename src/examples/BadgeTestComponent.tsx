import React, { useState, useEffect } from 'react';
import { ProfileFetcher } from '../services/profileFetcher';
import { mockUsers } from '../data/mockUsers';
import { User } from '../types/User';

const BadgeTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const profileFetcher = new ProfileFetcher();

  const testSingleUser = async (user: User) => {
    setLoading(true);
    setSelectedUser(user);
    
    console.log(`🧪 Testing badge fetch for: ${user.name}`);
    
    try {
      const hackerrankUsername = profileFetcher.extractUsernameFromUrl(user.hackerrankUrl);
      console.log(`📝 Extracted username: ${hackerrankUsername}`);
      
      const badges = await profileFetcher.fetchHackerRankBadges(hackerrankUsername);
      console.log(`🎯 Fetched badges:`, badges);
      
      const result = {
        user: user.name,
        username: hackerrankUsername,
        badges: badges,
        badgeCount: badges?.models?.length || 0,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => [{
        user: user.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedUser(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🧪 HackerRank Badge Test</h1>
        <p className="text-gray-600 mb-4">
          Test individual users to see if badges are being fetched correctly.
        </p>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* User Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Select User to Test</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {mockUsers.slice(0, 12).map((user) => (
            <button
              key={user.id}
              onClick={() => testSingleUser(user)}
              disabled={loading}
              className="p-2 text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded disabled:opacity-50"
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Test */}
      {loading && selectedUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span className="text-yellow-800">Testing {selectedUser.name}...</span>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{result.user}</h3>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                {result.error ? (
                  <div className="text-red-600 text-sm">
                    ❌ Error: {result.error}
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Username: <code className="bg-gray-100 px-1 rounded">{result.username}</code>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Badge Count: <span className="font-medium text-green-600">{result.badgeCount}</span>
                    </div>
                    
                    {result.badges?.models && result.badges.models.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">Badges:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {result.badges.models.map((badge: any, badgeIndex: number) => (
                            <div key={badgeIndex} className="bg-gray-50 p-2 rounded text-xs">
                              <div className="font-medium text-blue-600">{badge.badge_name}</div>
                              <div className="text-gray-600">
                                ⭐ {badge.stars}/{badge.total_stars} | 
                                ✅ {badge.solved}/{badge.total_challenges}
                              </div>
                              {badge.level && (
                                <div className="text-gray-500">Level: {badge.level}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Log Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">🔍 Debugging Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Open browser DevTools (F12) and check the Console tab</li>
          <li>• Look for detailed logs with emojis (🔍, ✅, ⚠️, 🎭)</li>
          <li>• Check Network tab to see if API calls are being made</li>
          <li>• CORS errors will show in the console if APIs are blocked</li>
        </ul>
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
            KA2k25 - Badge Testing Tool
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BadgeTestComponent;