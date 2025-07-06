document.addEventListener('DOMContentLoaded', () => {
    // Watermark Protection
    const watermark = document.querySelector('.watermark');
    if (watermark) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (!document.body.contains(watermark)) {
                    document.body.appendChild(watermark);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    const API_KEY = 'Juru5leUgcWdxlkYlcQWrU5dJQyEQzin';
    const BASE_URL = 'https://gsheet.js.tnhost.in/api/google-sheets/2/data/';

    const API_ENDPOINTS = {
        basicDetails: `BasicDetails?api_key=${API_KEY}`,
        module: `Module?api_key=${API_KEY}`,
        leetCodeStats: `LeetCodeStats?api_key=${API_KEY}`,
        hackerRankBadges: `HackerRankBadges?api_key=${API_KEY}`,
        hackerRankCertificates: `HackerRankCertificates?api_key=${API_KEY}`
    };

    // DOM Elements
    const leaderboardContainer = document.getElementById('leaderboard');
    const skeletonContainer = document.getElementById('leaderboard-skeleton');
    const emptyState = document.getElementById('empty-state');
    const userCountEl = document.getElementById('user-count');
    const lastUpdatedEl = document.getElementById('last-updated');
    const modal = document.getElementById('user-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.close-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    let allUserData = [];
    let filteredUserData = [];

    // Show skeleton loader
    function showSkeletonLoader() {
        leaderboardContainer.style.display = 'none';
        emptyState.classList.remove('visible');
        skeletonContainer.style.display = 'grid';
        skeletonContainer.innerHTML = '';
        
        // Create 8 skeleton cards
        for (let i = 0; i < 8; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'skeleton-card';
            skeletonCard.innerHTML = `
                <div class="skeleton skeleton-avatar"></div>
                <div style="flex: 1; min-width: 0;">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text-short"></div>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <div class="skeleton skeleton-badge"></div>
                    <div class="skeleton skeleton-badge"></div>
                </div>
            `;
            skeletonContainer.appendChild(skeletonCard);
        }
    }

    // Hide skeleton loader
    function hideSkeletonLoader() {
        skeletonContainer.style.display = 'none';
        leaderboardContainer.style.display = 'grid';
    }

    // Fetch data from API
    async function fetchData(endpoint) {
        try {
            const response = await fetch(BASE_URL + endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            return json.data;
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return [];
        }
    }

    // Fetch all data and merge
    async function fetchAllData() {
        showSkeletonLoader();
        
        try {
            const [basicDetails, modules, leetCodeStats, hackerRankBadges, hackerRankCertificates] = await Promise.all([
                fetchData(API_ENDPOINTS.basicDetails),
                fetchData(API_ENDPOINTS.module),
                fetchData(API_ENDPOINTS.leetCodeStats),
                fetchData(API_ENDPOINTS.hackerRankBadges),
                fetchData(API_ENDPOINTS.hackerRankCertificates)
            ]);

            // Normalize keys and merge data
            const mergedData = basicDetails.map(user => {
                const internIdKey = 'InternID' in user ? 'InternID' : 'Intern ID';
                const internId = user[internIdKey];

                const userModules = modules.find(m => m['Intern ID'] === internId) || {};
                const userLeetCode = leetCodeStats.find(l => l['Intern ID'] === internId) || {};
                const userHackerRankBadges = hackerRankBadges.filter(b => b['Intern ID'] === internId);
                const userHackerRankCerts = hackerRankCertificates.filter(c => c.Name === user.Name);

                return {
                    id: internId,
                    name: user.Name,
                    github: user.GithubID,
                    leetcodeProfile: `https://leetcode.com/${user.LeetCodeID}`,
                    hackerrankProfile: `https://www.hackerrank.com/profile/${user.HackerRankID}`,
                    modules: {
                        module1: userModules['Module 1'],
                        module2: userModules['Module 2'],
                        module3: userModules['Module3'],
                        module4: userModules['Module4'],
                    },
                    leetcode: {
                        total: parseInt(userLeetCode['LC Total Problem Solved'] || 0),
                        easy: parseInt(userLeetCode['LC Easy'] || 0),
                        medium: parseInt(userLeetCode['LC Medium '] || 0), // Note the space in the key
                        hard: parseInt(userLeetCode['LC Hard'] || 0),
                    },
                    hackerrank: {
                        badges: userHackerRankBadges.length > 0 && userHackerRankBadges[0].BadgeName ? userHackerRankBadges.length : 0,
                        certificates: userHackerRankCerts
                    }
                };
            });

            allUserData = mergedData;
            applyFiltersAndSort();
            updateHeader();
        } catch (error) {
            console.error('Failed to fetch all data:', error);
            // Show error state if needed
        } finally {
            hideSkeletonLoader();
        }
    }

    // Apply filters and sorting
    function applyFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase();
        filteredUserData = allUserData.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.id.toLowerCase().includes(searchTerm)
        );

        // Toggle empty state
        if (filteredUserData.length === 0) {
            emptyState.classList.add('visible');
            leaderboardContainer.style.display = 'none';
        } else {
            emptyState.classList.remove('visible');
            leaderboardContainer.style.display = 'grid';
        }

        // Sort data
        const sortBy = sortSelect.value;
        if (sortBy === 'leetcode') {
            filteredUserData.sort((a, b) => b.leetcode.total - a.leetcode.total);
        } else if (sortBy === 'hackerrank') {
            filteredUserData.sort((a, b) => b.hackerrank.badges - a.hackerrank.badges);
        }

        renderLeaderboard();
    }

    // Render leaderboard
    function renderLeaderboard() {
        leaderboardContainer.innerHTML = '';
        
        filteredUserData.forEach((user, index) => {
            const card = document.createElement('div');
            card.className = 'user-card';
            
            // Add rank classes for top 3
            if (index < 3) {
                card.classList.add(`rank-${index + 1}`);
            }
            
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            card.innerHTML = `
                <div class="rank">#${index + 1}</div>
                <div class="user-info">
                    <div class="avatar">${initials}</div>
                    <div class="user-details">
                        <div class="name">${user.name}</div>
                        <div class="id">${user.id}</div>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat-badge lc">
                        <div class="count">${user.leetcode.total}</div>
                        <div class="label">problems</div>
                    </div>
                    <div class="stat-badge hr">
                        <div class="count">${user.hackerrank.badges}</div>
                        <div class="label">badges</div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => openModal(user.id));
            leaderboardContainer.appendChild(card);
        });
    }

    // Open user modal
    function openModal(userId) {
        const user = allUserData.find(u => u.id === userId);
        if (!user) return;

        const rank = filteredUserData.findIndex(u => u.id === userId) + 1;
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

        modalBody.innerHTML = `
            <div class="modal-header">
                <div class="avatar">${initials}</div>
                <div>
                    <h2>${user.name}</h2>
                    <p>Rank #${rank} | GitHub: ${user.github ? `<a href="${user.github}" target="_blank">Profile</a>` : 'N/A'} | ID: ${user.id}</p>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3><a href="${user.leetcodeProfile}" target="_blank">LeetCode Stats <i class="fas fa-external-link-alt"></i></a></h3>
                    <div class="stat-value">${user.leetcode.total}</div>
                    <div class="stat-label">Problems Solved</div>
                    <div class="difficulty-breakdown">
                        <div class="difficulty easy">
                            <div class="count">${user.leetcode.easy}</div>
                            <div class="label">Easy</div>
                        </div>
                        <div class="difficulty medium">
                            <div class="count">${user.leetcode.medium}</div>
                            <div class="label">Medium</div>
                        </div>
                        <div class="difficulty hard">
                            <div class="count">${user.leetcode.hard}</div>
                            <div class="label">Hard</div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h3><a href="${user.hackerrankProfile}" target="_blank">HackerRank Stats <i class="fas fa-external-link-alt"></i></a></h3>
                    <div class="stat-value">${user.hackerrank.badges}</div>
                    <div class="stat-label">Badges Earned</div>
                    <h4>Certificates (${user.hackerrank.certificates.length})</h4>
                    ${user.hackerrank.certificates.length > 0 
                        ? `<ul class="certificates-list">${user.hackerrank.certificates.map(c => `
                            <li>
                                <a href="${c['Certificate Url']}" target="_blank">
                                    <i class="fas fa-certificate"></i>
                                    ${c['Certificate Name']}
                                </a>
                            </li>
                        `).join('')}</ul>` 
                        : '<p>No certificates found</p>'}
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Module Scores</h3>
                <div class="module-cards">
    ${Object.entries(user.modules).map(([key, value]) => `
        <div class="module-card ${value ? 'completed' : ''}">
            <div class="module-card-header">
                <i class="fas ${value ? 'fa-check-circle' : 'fa-circle'}"></i>
                <h4>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
            </div>
            <div class="module-card-body">
                ${value ? `
                    <div class="module-score">${value}</div>
                    <div class="module-progress">
                        <div class="progress-bar" style="width: ${value}%"></div>
                    </div>
                ` : '<div class="module-pending">Not Started</div>'}
            </div>
        </div>
    `).join('')}
</div>
            </div>
            
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Update header info
    function updateHeader() {
        userCountEl.textContent = allUserData.length;
        const now = new Date();
        lastUpdatedEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.body.dataset.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        themeToggleBtn.innerHTML = `<i class="fas ${newTheme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>`;
    }

    // Load saved theme
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
        themeToggleBtn.innerHTML = `<i class="fas ${savedTheme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>`;
    }

    // Event Listeners
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    refreshBtn.addEventListener('click', fetchAllData);
    sortSelect.addEventListener('change', applyFiltersAndSort);
    searchInput.addEventListener('input', () => {
        searchClear.classList.toggle('visible', searchInput.value.length > 0);
        applyFiltersAndSort();
    });
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        applyFiltersAndSort();
        searchInput.focus();
    });
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Initial Load
    loadTheme();
    fetchAllData();
});