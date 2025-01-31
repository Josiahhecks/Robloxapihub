const ROBLOX_APIS = {
    users: 'https://users.roblox.com',
    avatar: 'https://avatar.roblox.com',
    games: 'https://games.roblox.com',
    groups: 'https://groups.roblox.com',
    thumbnails: 'https://thumbnails.roblox.com',
    economy: 'https://economy.roblox.com',
    catalog: 'https://catalog.roblox.com'
};

class ProfileService {
    async fetchUserProfile(username) {
        try {
            const userResponse = await fetch(`${ROBLOX_APIS.users}/v1/users/search?keyword=${username}`);
            const userData = await userResponse.json();

            if (!userData.data.length) {
                throw new Error('User not found');
            }

            const userId = userData.data[0].id;
            const profileResponse = await fetch(`${ROBLOX_APIS.users}/v1/users/${userId}`);
            const profileData = await profileResponse.json();
            const thumbnailResponse = await fetch(`${ROBLOX_APIS.thumbnails}/v1/users/avatar?userIds=${userId}&size=420x420&format=png`);
            const thumbnailData = await thumbnailResponse.json();

            return {
                id: userId,
                username: profileData.name,
                displayName: profileData.displayName,
                avatar: thumbnailData.data[0].imageUrl,
                created: profileData.created
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }
}

class App {
    constructor() {
        this.profileService = new ProfileService();
        this.initializeTabs();
        this.initializeEventListeners();
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
    }

    initializeEventListeners() {
        document.getElementById('fetch-profile').addEventListener('click', async () => {
            const username = document.getElementById('username-input').value;
            try {
                const profile = await this.profileService.fetchUserProfile(username);
                this.displayProfile(profile);
            } catch (error) {
                this.showError('Failed to fetch profile');
            }
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    }

    displayProfile(profile) {
        const resultDiv = document.getElementById('profile-result');
        resultDiv.innerHTML = `
            <div class="profile-card">
                <img src="${profile.avatar}" alt="${profile.username}'s avatar">
                <h2>${profile.displayName}</h2>
                <p>@${profile.username}</p>
                <p>Joined: ${new Date(profile.created).toLocaleDateString()}</p>
            </div>
        `;
    }

    showError(message) {
        const resultDiv = document.getElementById('profile-result');
        resultDiv.innerHTML = `<div class="error">${message}</div>`;
    }
}

const app = new App();
