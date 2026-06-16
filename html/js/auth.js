const AuthSystem = {
  storageKey: 'ascendos_user',
  redirectPath: 'signin.html',

  generateVerificationCode() {
    return String(Math.floor(Math.random() * 90000) + 10000);
  },

  generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  },

  getAccountKey(email) {
    return `ascendos_user_${String(email || '').trim().toLowerCase()}`;
  },

  getUserStorageKeys(email) {
    return {
      quests: `quests_${email}`,
      missions: `missions_${email}`,
      journal: `journal_${email}`,
      focus: `focus_sessions_${email}`,
      dashboard: `ascendos-dashboard-state::${email}`
    };
  },

  safeParse(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },

  isAuthenticated() {
    const user = localStorage.getItem(this.storageKey);
    return user !== null && user !== undefined;
  },

  getCurrentUser() {
    const user = this.safeParse(localStorage.getItem(this.storageKey), null);
    return user ? this.normalizeUser(user) : null;
  },

  normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  },

  getDisplayNameFromEmail(email) {
    return String(email || 'hunter').split('@')[0] || 'hunter';
  },

  getHunterRankFromLevel(level) {
    const value = Number(level) || 1;
    if (value >= 1400) return 'Chairman-Class Hunter';
    if (value >= 1200) return 'Zodiac-Class Hunter';
    if (value >= 1050) return 'Triple-Star Hunter';
    if (value >= 915) return 'Senior Double-Star Hunter';
    if (value >= 790) return 'Double-Star Hunter';
    if (value >= 675) return 'Senior Single-Star Hunter';
    if (value >= 570) return 'Single-Star Hunter';
    if (value >= 475) return 'Association Hunter';
    if (value >= 390) return 'Master Hunter';
    if (value >= 315) return 'Senior Hunter';
    if (value >= 250) return 'Elite Hunter';
    if (value >= 195) return 'Veteran Hunter';
    if (value >= 150) return 'Skilled Hunter';
    if (value >= 110) return 'Field Hunter';
    if (value >= 80) return 'Contract Hunter';
    if (value >= 55) return 'Licensed Hunter';
    if (value >= 35) return 'Rookie Hunter';
    if (value >= 20) return 'Candidate';
    if (value >= 10) return 'Provisional Candidate';
    return 'Examinee';
  },

  resolveRank(userLike) {
    const level = Number(userLike?.level) || 1;
    const raw = String(userLike?.rank || '').trim().toUpperCase();
    if (raw === 'E' || raw === 'RANK E' || raw === 'EXAMINEE') return 'Examinee';
    if (raw === 'D' || raw === 'RANK D' || raw === 'PROVISIONAL CANDIDATE') return 'Provisional Candidate';
    if (raw === 'C' || raw === 'RANK C' || raw === 'CANDIDATE') return 'Candidate';
    if (raw === 'B' || raw === 'RANK B' || raw === 'ROOKIE HUNTER') return 'Rookie Hunter';
    if (raw === 'A' || raw === 'RANK A' || raw === 'LICENSED HUNTER') return 'Licensed Hunter';
    if (raw === 'S' || raw === 'RANK S' || raw === 'ELITE HUNTER') return 'Elite Hunter';
    if (raw) return this.getHunterRankFromLevel(level);
    return this.getHunterRankFromLevel(level);
  },

  loadDashboardState(email) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return null;
    const key = this.getUserStorageKeys(normalizedEmail).dashboard;
    return this.safeParse(localStorage.getItem(key), null);
  },

  normalizeUser(user) {
    const normalizedEmail = this.normalizeEmail(user?.email);
    const dashboard = this.loadDashboardState(normalizedEmail) || {};
    const xp = Number.isFinite(Number(dashboard.xpTotal)) ? Number(dashboard.xpTotal) : Number(user?.xp || 0);
    const level = Number.isFinite(Number(dashboard.level)) && Number(dashboard.level) > 0
      ? Number(dashboard.level)
      : Math.max(1, Number(user?.level || 1));

    const merged = {
      email: normalizedEmail,
      displayName: user?.displayName?.trim() || user?.name?.trim() || this.getDisplayNameFromEmail(normalizedEmail),
      token: user?.token || this.generateToken(),
      createdAt: user?.createdAt || new Date().toISOString(),
      loginTime: user?.loginTime || new Date().toISOString(),
      sessionExpiry: user?.sessionExpiry || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      verificationCode: user?.verificationCode || this.generateVerificationCode(),
      timezone: user?.timezone || 'UTC',
      theme: user?.theme || localStorage.getItem('siteTheme') || 'hunter',
      tagline: user?.tagline || 'A Hunter grows sharper when discipline holds longer than mood.',
      xp,
      level,
      rank: this.resolveRank({ rank: dashboard.rank || user?.rank, level }),
      googleId: user?.googleId || '',
      avatar: user?.avatar || '',
      authProvider: user?.authProvider || 'local',
      emailVerified: Boolean(user?.emailVerified),

      path: user?.path || '',
      onboarded: Boolean(user?.onboarded),
      onboardingCompleted: Boolean(user?.onboardingCompleted),
      tutorialCompleted: Boolean(user?.tutorialCompleted),
      tutorialSeen: Boolean(user?.tutorialSeen),

      hunterCodename: user?.hunterCodename || '',
      auraTheme: user?.auraTheme || '',
      primaryGoal: user?.primaryGoal || '',
      mainWeakness: user?.mainWeakness || '',
      onboardingProfile: user?.onboardingProfile || null
    };

    return merged;
  },

  persistUser(user, password) {
    const normalizedUser = this.normalizeUser(user);
    localStorage.setItem(this.storageKey, JSON.stringify(normalizedUser));

    const accountKey = this.getAccountKey(normalizedUser.email);
    const existing = this.safeParse(localStorage.getItem(accountKey), {});
    const next = {
      password: typeof password === 'string' ? password : existing.password ?? null,
      user: normalizedUser
    };

    localStorage.setItem(accountKey, JSON.stringify(next));
    return normalizedUser;
  },

  login(email, password) {
    return this.verifyLogin(email, password);
  },

  disableGoogleAutoSelect() {
    try {
      if (
        typeof window !== 'undefined' &&
        window.google &&
        google.accounts &&
        google.accounts.id &&
        typeof google.accounts.id.disableAutoSelect === 'function'
      ) {
        google.accounts.id.disableAutoSelect();
      }
    } catch {}
  },

  logout() {
    this.disableGoogleAutoSelect();
    localStorage.removeItem(this.storageKey);
    window.location.href = this.redirectPath;
  },

  isSessionValid() {
    const user = this.getCurrentUser();
    if (!user) return false;
    const expiry = new Date(user.sessionExpiry);
    return !Number.isNaN(expiry.getTime()) && new Date() < expiry;
  },

  signup(email, password, confirmPassword, displayName) {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail || !password || !confirmPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (localStorage.getItem(this.getAccountKey(normalizedEmail))) {
      return { success: false, message: 'Email is already registered.' };
    }

    const user = this.normalizeUser({
      email: normalizedEmail,
      displayName: displayName && displayName.trim()
        ? displayName.trim()
        : this.getDisplayNameFromEmail(normalizedEmail),
      token: this.generateToken(),
      createdAt: new Date().toISOString(),
      loginTime: new Date().toISOString(),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      xp: 0,
      level: 1,
      rank: 'Examinee',
      verificationCode: this.generateVerificationCode(),
      timezone: 'UTC',
      theme: 'hunter',
      authProvider: 'local',
      emailVerified: false
    });

    this.persistUser(user, password);
    this.initUserStorage(normalizedEmail);

    return { success: true, user, verificationCode: user.verificationCode };
  },

  loginWithGoogle(googleUser) {
    const normalizedEmail = this.normalizeEmail(googleUser?.email);
    const googleId = String(googleUser?.googleId || '').trim();

    if (!normalizedEmail || !googleId) {
      return { success: false, message: 'Google account data is missing.' };
    }

    const accountKey = this.getAccountKey(normalizedEmail);
    const existing = this.safeParse(localStorage.getItem(accountKey), null);

    let user;

    if (existing && existing.user) {
      user = this.normalizeUser({
        ...existing.user,
        email: normalizedEmail,
        displayName: googleUser.displayName?.trim() || existing.user.displayName || this.getDisplayNameFromEmail(normalizedEmail),
        googleId,
        avatar: googleUser.avatar || existing.user.avatar || '',
        authProvider: 'google',
        emailVerified: Boolean(googleUser.emailVerified),
        loginTime: new Date().toISOString(),
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      localStorage.setItem(accountKey, JSON.stringify({
        password: existing.password ?? null,
        user
      }));
    } else {
      user = this.normalizeUser({
        email: normalizedEmail,
        displayName: googleUser.displayName?.trim() || this.getDisplayNameFromEmail(normalizedEmail),
        token: this.generateToken(),
        createdAt: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        xp: 0,
        level: 1,
        rank: 'Examinee',
        verificationCode: this.generateVerificationCode(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        theme: localStorage.getItem('siteTheme') || 'hunter',
        googleId,
        avatar: googleUser.avatar || '',
        authProvider: 'google',
        emailVerified: Boolean(googleUser.emailVerified)
      });

      localStorage.setItem(accountKey, JSON.stringify({
        password: null,
        user
      }));
    }

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.initUserStorage(normalizedEmail);

    return { success: true, user };
  },

  createUnverifiedLocalAccount(email, password, displayName) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return { success: false, message: 'Email and password are required.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const accountKey = this.getAccountKey(normalizedEmail);
    const existing = this.safeParse(localStorage.getItem(accountKey), null);

    if (existing && existing.user && existing.user.authProvider === 'google') {
      return { success: false, message: 'This email is already linked to Google sign-in. Use Login with Google.' };
    }

    const user = this.normalizeUser({
      email: normalizedEmail,
      displayName: displayName && displayName.trim()
        ? displayName.trim()
        : this.getDisplayNameFromEmail(normalizedEmail),
      token: this.generateToken(),
      createdAt: existing?.user?.createdAt || new Date().toISOString(),
      loginTime: new Date().toISOString(),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      xp: existing?.user?.xp || 0,
      level: existing?.user?.level || 1,
      rank: existing?.user?.rank || 'Examinee',
      verificationCode: existing?.user?.verificationCode || this.generateVerificationCode(),
      timezone: existing?.user?.timezone || 'UTC',
      theme: existing?.user?.theme || 'hunter',
      tagline: existing?.user?.tagline || 'A Hunter grows sharper when discipline holds longer than mood.',
      googleId: '',
      avatar: '',
      authProvider: 'local',
      emailVerified: false,
      onboardingCompleted: false,
      tutorialCompleted: false
    });

    this.persistUser(user, password);
    this.initUserStorage(normalizedEmail);

    localStorage.removeItem(this.storageKey);

    return { success: true, user };
  },

  markLocalUserVerified(email) {
    const normalizedEmail = this.normalizeEmail(email);
    const accountKey = this.getAccountKey(normalizedEmail);
    const account = this.safeParse(localStorage.getItem(accountKey), null);

    if (!account || !account.user) {
      return { success: false, message: 'Account not found.' };
    }

    const updatedUser = this.normalizeUser({
      ...account.user,
      authProvider: 'local',
      emailVerified: true,
      loginTime: new Date().toISOString(),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    localStorage.setItem(accountKey, JSON.stringify({
      password: account.password ?? null,
      user: updatedUser
    }));

    const current = this.getCurrentUser();
    if (current && this.normalizeEmail(current.email) === normalizedEmail) {
      localStorage.setItem(this.storageKey, JSON.stringify(updatedUser));
    }

    return { success: true, user: updatedUser };
  },

  initUserStorage(email) {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      if (!normalizedEmail) return;

      const keys = this.getUserStorageKeys(normalizedEmail);

      const defaultDailyQuests = [
        {
          id: 'daily_1',
          title: 'Morning Routine',
          description: 'Start the day with movement, hydration, and focus.',
          reward: 25,
          pct: 0,
          done: false,
          daily: true
        },
        {
          id: 'daily_2',
          title: 'Hydration & Movement',
          description: 'Drink water and move for 10 minutes.',
          reward: 10,
          pct: 0,
          done: false,
          daily: true
        },
        {
          id: 'daily_3',
          title: 'Plan Your Day',
          description: 'Map out your top priorities and a winning schedule.',
          reward: 15,
          pct: 0,
          done: false,
          daily: true
        }
      ];

      if (!localStorage.getItem(keys.quests)) {
        localStorage.setItem(keys.quests, JSON.stringify(defaultDailyQuests));
      }
      if (!localStorage.getItem(keys.missions)) {
        localStorage.setItem(keys.missions, JSON.stringify([]));
      }
      if (!localStorage.getItem(keys.journal)) {
        localStorage.setItem(keys.journal, JSON.stringify([]));
      }
      if (!localStorage.getItem(keys.focus)) {
        localStorage.setItem(keys.focus, JSON.stringify([]));
      }
      if (!localStorage.getItem(keys.dashboard)) {
        localStorage.setItem(
          keys.dashboard,
          JSON.stringify({ xpTotal: 0, level: 1, rank: 'Examinee' })
        );
      }
    } catch {}
  },

  verifyLogin(email, password, firebaseUser = null) {
    const normalizedEmail = this.normalizeEmail(email);
    const stored = localStorage.getItem(this.getAccountKey(normalizedEmail));

    if (firebaseUser) {
       let user;
       if (stored) {
           const account = JSON.parse(stored);
           user = this.normalizeUser(account.user);
       } else {
           user = this.normalizeUser({
               email: normalizedEmail,
               displayName: firebaseUser.displayName || this.getDisplayNameFromEmail(normalizedEmail),
               token: this.generateToken(),
               createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
               loginTime: new Date().toISOString(),
               sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
               xp: 0,
               level: 1,
               rank: 'Examinee',
               verificationCode: this.generateVerificationCode(),
               timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
               theme: localStorage.getItem('siteTheme') || 'hunter',
               authProvider: 'local',
               emailVerified: firebaseUser.emailVerified
           });
       }
       
       user.loginTime = new Date().toISOString();
       user.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
       this.persistUser(user, password);
       this.initUserStorage(normalizedEmail);
       localStorage.setItem(this.storageKey, JSON.stringify(user));
       return { success: true, user };
    }

    if (!stored) {
      return { success: false, message: 'Email not found on this device. Please sign in via Firebase.' };
    }

    try {
      const account = JSON.parse(stored);

      if (account.password !== password) {
        return { success: false, message: 'Incorrect password.' };
      }

      const user = this.normalizeUser(account.user || {});
      user.loginTime = new Date().toISOString();
      user.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      this.persistUser(user, account.password);
      this.initUserStorage(normalizedEmail);

      return { success: true, user };
    } catch {
      return { success: false, message: 'Login error.' };
    }
  },

  getAccountByEmail(email) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return null;

    const stored = localStorage.getItem(this.getAccountKey(normalizedEmail));
    return this.safeParse(stored, null);
  },

  verifyCsvLogin(email, code, fileText = '') {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) {
      return { success: false, message: 'Email is required for CSV login.' };
    }

    const account = this.getAccountByEmail(normalizedEmail);
    if (!account || !account.user) {
      return { success: false, message: 'Account not found. Please sign up first.' };
    }

    const user = this.normalizeUser(account.user);
    const expectedCode = String(user.verificationCode || '').trim();
    const enteredCode = String(code || '').trim();

    if (!/^[0-9]{5}$/.test(enteredCode)) {
      return { success: false, message: 'Enter the 5-digit verification code from your CSV/PDF export.' };
    }

    if (!expectedCode) {
      return { success: false, message: 'No verification code is assigned to this account.' };
    }

    if (enteredCode !== expectedCode) {
      return { success: false, message: 'Incorrect verification code.' };
    }

    if (fileText && !String(fileText).includes(expectedCode)) {
      return { success: false, message: 'Uploaded file does not include the assigned verification code.' };
    }

    user.loginTime = new Date().toISOString();
    user.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.persistUser(user, account.password);
    this.initUserStorage(normalizedEmail);

    return { success: true, user };
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = this.redirectPath;
      return false;
    }

    if (!this.isSessionValid()) {
      this.logout();
      return false;
    }

    return true;
  },

  getDisplayName() {
    const user = this.getCurrentUser();
    return user ? user.displayName : 'Guest';
  },

  updateProfile(displayName, updates = {}) {
    const current = this.getCurrentUser();
    if (!current) return { success: false, message: 'No user logged in.' };

    const next = { ...current, ...updates };
    if (displayName) next.displayName = String(displayName).trim();

    const stored = this.safeParse(
      localStorage.getItem(this.getAccountKey(current.email)),
      {}
    );
    const password = stored.password;
    const user = this.persistUser(next, password);

    return { success: true, user };
  },

  applyTheme(theme) {
    if (!theme) return;
    const normalizedTheme = String(theme).trim().toLowerCase();
    document.documentElement.setAttribute('data-theme', normalizedTheme);
    if (document.body) document.body.setAttribute('data-theme', normalizedTheme);
    localStorage.setItem('siteTheme', normalizedTheme);
  },

  loadTheme() {
    const savedTheme = localStorage.getItem('siteTheme');
    const user = this.getCurrentUser();
    const theme = savedTheme || user?.theme || 'hunter';
    this.applyTheme(theme);
  },

  setTheme(theme) {
    const selectedTheme = String(theme || 'hunter').trim().toLowerCase();
    if (!selectedTheme) {
      return { success: false, message: 'Invalid theme.' };
    }

    const user = this.getCurrentUser();
    if (user) {
      this.updateProfile(null, { theme: selectedTheme });
    }

    this.applyTheme(selectedTheme);
    return { success: true, message: 'Theme updated.', theme: selectedTheme };
  },

  saveTimezone(timezone) {
    if (!timezone) {
      return { success: false, message: 'Timezone is required.' };
    }

    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, message: 'No user logged in.' };
    }

    this.updateProfile(null, { timezone });
    return { success: true, message: 'Timezone saved.', timezone };
  },

  escapeHTML(value) {
    return String(value ?? 'N/A')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  createPopupContainer() {
    let container = document.querySelector('#ascendos-custom-popup');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ascendos-custom-popup';
      Object.assign(container.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(10px)',
        zIndex: '99999',
        opacity: '0',
        transition: 'opacity 180ms ease'
      });
      document.body.appendChild(container);
    }
    return container;
  },

  showCustomPopup({ title = '', message = '', face = '', timeout = 3200, onClose = null }) {
    const container = this.createPopupContainer();
    container.innerHTML = `
      <div style="max-width:430px;width:92%;padding:24px;border-radius:24px;background:linear-gradient(180deg,rgba(7,12,24,0.98),rgba(16,24,40,0.98));border:1px solid rgba(56,189,248,0.18);box-shadow:0 28px 70px rgba(2,6,23,0.45);font-family:Inter,system-ui,sans-serif;color:#e6eef8;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px;">
          <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.24em;color:#67e8f9;margin-bottom:6px;">HunterOS Notice</div>
            <div style="font-size:22px;font-weight:800;line-height:1.1;">${this.escapeHTML(title)}</div>
          </div>
          <div style="font-size:38px;line-height:1;color:#a5f3fc;font-family:monospace;">${this.escapeHTML(face)}</div>
        </div>
        <p style="font-size:15px;line-height:1.7;color:#cbd5e1;margin:0 0 16px;">${this.escapeHTML(message)}</p>
        <button id="ascendos-popup-close" style="width:100%;padding:12px 14px;border:none;border-radius:14px;background:linear-gradient(135deg,#0891b2,#22d3ee);color:#03121c;font-weight:800;cursor:pointer;box-shadow:0 12px 28px rgba(34,211,238,0.24);">Acknowledge</button>
      </div>`;

    requestAnimationFrame(() => {
      container.style.opacity = '1';
    });

    let closed = false;
    const closePopup = () => {
      if (closed) return;
      closed = true;
      container.style.opacity = '0';
      container.addEventListener('transitionend', () => {
        if (container.parentNode) container.parentNode.removeChild(container);
        if (typeof onClose === 'function') onClose();
      }, { once: true });
    };

    container.querySelector('#ascendos-popup-close')?.addEventListener('click', closePopup);
    container.addEventListener('click', event => {
      if (event.target === container) closePopup();
    });

    if (timeout > 0) setTimeout(closePopup, timeout);
  },

  showInputPopup({
    title = '',
    message = '',
    placeholder = '',
    face = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  }) {
    return new Promise((resolve) => {
      const container = this.createPopupContainer();
      container.innerHTML = `
        <div style="max-width:470px;width:92%;padding:24px;border-radius:24px;background:linear-gradient(180deg,rgba(7,12,24,0.99),rgba(16,24,40,0.99));border:1px solid rgba(56,189,248,0.18);box-shadow:0 28px 70px rgba(2,6,23,0.45);font-family:Inter,system-ui,sans-serif;color:#e6eef8;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;">
            <div>
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.24em;color:#67e8f9;margin-bottom:6px;">HunterOS Confirm</div>
              <div style="font-size:24px;font-weight:800;line-height:1.15;">${this.escapeHTML(title)}</div>
            </div>
            <div style="font-size:34px;line-height:1;color:#a5f3fc;font-family:monospace;">${this.escapeHTML(face)}</div>
          </div>
          <p style="font-size:15px;line-height:1.7;color:#cbd5e1;margin:0 0 16px;">${this.escapeHTML(message)}</p>
          <input id="ascendos-popup-input" type="text" placeholder="${this.escapeHTML(placeholder)}" style="width:100%;padding:14px 16px;border-radius:14px;border:1px solid rgba(103,232,249,0.18);background:rgba(255,255,255,0.04);color:#fff;outline:none;font-size:15px;margin-bottom:16px;" />
          <div id="ascendos-popup-error" style="display:none;color:#fda4af;font-size:13px;margin:-4px 0 14px;"></div>
          <div style="display:flex;gap:12px;">
            <button id="ascendos-popup-cancel" style="flex:1;padding:12px 14px;border:none;border-radius:14px;background:rgba(255,255,255,0.08);color:#fff;font-weight:700;cursor:pointer;">${this.escapeHTML(cancelText)}</button>
            <button id="ascendos-popup-confirm" style="flex:1;padding:12px 14px;border:none;border-radius:14px;background:linear-gradient(135deg,#0891b2,#22d3ee);color:#03121c;font-weight:800;cursor:pointer;">${this.escapeHTML(confirmText)}</button>
          </div>
        </div>`;

      requestAnimationFrame(() => {
        container.style.opacity = '1';
      });

      const input = container.querySelector('#ascendos-popup-input');
      const cancelBtn = container.querySelector('#ascendos-popup-cancel');
      const confirmBtn = container.querySelector('#ascendos-popup-confirm');

      const cleanup = (value) => {
        container.style.opacity = '0';
        container.addEventListener('transitionend', () => {
          if (container.parentNode) container.parentNode.removeChild(container);
          resolve(value);
        }, { once: true });
      };

      cancelBtn?.addEventListener('click', () => cleanup(null));
      confirmBtn?.addEventListener('click', () => cleanup(input ? input.value : ''));
      container.addEventListener('click', (event) => {
        if (event.target === container) cleanup(null);
      });

      input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          cleanup(input.value);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          cleanup(null);
        }
      });

      setTimeout(() => input?.focus(), 30);
    });
  },

  async wipeProfileFlow() {
    const user = this.getCurrentUser();
    if (!user) return;

    const confirmedName = await this.showInputPopup({
      title: 'Terminate Hunter Record',
      message: 'This permanently removes your Hunter License, progress archives, and saved field data. Type your hunter name to confirm.',
      placeholder: `Type "${user.displayName || 'Hunter'}"`,
      face: '(>_<)',
      confirmText: 'Terminate',
      cancelText: 'Cancel'
    });

    if (confirmedName === null) {
      this.showCustomPopup({
        title: 'Termination cancelled',
        message: 'Your hunter record remains intact.',
        face: '•ᴗ•',
        timeout: 2400
      });
      return;
    }

    if (!confirmedName || confirmedName.trim() !== String(user.displayName || '').trim()) {
      this.showCustomPopup({
        title: 'Name mismatch',
        message: 'Hunter name did not match. No records were removed.',
        face: '(!)',
        timeout: 2800
      });
      return;
    }

    this.showCustomPopup({
      title: `Goodbye, ${confirmedName.trim()}`,
      message: 'Your HunterOS record is being erased from this device.',
      face: 'T_T',
      timeout: 1600,
      onClose: () => {
        const keys = this.getUserStorageKeys(user.email);
        [
          this.storageKey,
          this.getAccountKey(user.email),
          keys.quests,
          keys.missions,
          keys.journal,
          keys.focus,
          keys.dashboard,
          'siteTheme'
        ].forEach(key => localStorage.removeItem(key));
        window.location.href = 'landing.html';
      }
    });
  },

  exportToCSV() {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'No user logged in.' };

    const csvContent = [
      ['HunterOS License Export'],
      [''],
      ['Hunter Record'],
      ['Display Name', user.displayName],
      ['Email', user.email],
      ['Level', user.level || 1],
      ['XP Total', user.xp || 0],
      ['Rank Title', this.resolveRank(user)],
      ['Timezone', user.timezone || 'UTC'],
      ['Auth Provider', user.authProvider || 'local'],
      ['Email Verified', user.emailVerified ? 'Yes' : 'No'],
      ['Account Created', user.createdAt || 'N/A'],
      [''],
      ['VERIFICATION CODE', user.verificationCode || 'N/A'],
      ['KEEP THIS CODE SAFE - REQUIRED FOR CSV LOGIN'],
      ['']
    ];

    try {
      const keys = this.getUserStorageKeys(user.email);

      const quests = this.safeParse(localStorage.getItem(keys.quests), []);
      if (quests.length > 0) {
        csvContent.push(['Daily Contracts']);
        csvContent.push(['ID', 'Title', 'Description', 'Reward', 'Progress %', 'Completed']);
        quests.forEach(q => csvContent.push([
          q.id || '',
          q.title || '',
          q.description || '',
          q.reward || 0,
          q.pct || 0,
          q.done ? 'Yes' : 'No'
        ]));
        csvContent.push(['']);
      }

      const missions = this.safeParse(localStorage.getItem(keys.missions), []);
      if (missions.length > 0) {
        csvContent.push(['Mission Ledger']);
        csvContent.push(['ID', 'Title', 'XP', 'Completed']);
        missions.forEach(m => csvContent.push([
          m.id || '',
          m.title || '',
          m.xp || 0,
          m.done ? 'Yes' : 'No'
        ]));
      }
    } catch {}

    const csv = csvContent
      .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `hunteros-license-${user.email}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return { success: true, message: 'CSV exported successfully.' };
  },

  formatDisplayDate(dateValue, fallback = 'N/A') {
    if (!dateValue) return fallback;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatGeneratedTimestamp() {
    return new Date().toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  getRandomMotivationalQuote() {
    const quotes = [
      'Discipline outlasts mood. Hunters are built by repeatable actions.',
      'A license opens doors, but consistency decides what waits behind them.',
      'Progress looks small up close and unstoppable in hindsight.',
      'Every completed contract sharpens the hunter behind the record.',
      'The strongest systems are quiet, daily, and relentlessly repeated.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  },

  buildProfileCard(label, value, tone = 'default') {
    const accent = tone === 'highlight'
      ? 'background:linear-gradient(180deg,rgba(34,211,238,0.08),rgba(14,165,233,0.03));border:1px solid rgba(34,211,238,0.18);'
      : 'background:#ffffff;border:1px solid rgba(15,23,42,0.08);';

    return `<div class="info-card" style="${accent}"><div class="info-label">${this.escapeHTML(label)}</div><div class="info-value">${this.escapeHTML(value)}</div></div>`;
  },

  generateAscendosPdfHTML(user) {
    const safeUser = this.normalizeUser(user || {});
    const quote = this.getRandomMotivationalQuote();
    const createdAt = this.formatDisplayDate(safeUser.createdAt, 'Unknown');
    const generatedAt = this.formatGeneratedTimestamp();
    const verificationCode = this.escapeHTML(safeUser.verificationCode || this.generateVerificationCode());
    const displayName = safeUser.displayName || 'Hunter';
    const email = safeUser.email || 'N/A';
    const level = safeUser.level ?? 1;
    const xp = Number(safeUser.xp ?? 0).toLocaleString();
    const rank = this.resolveRank(safeUser);
    const timezone = safeUser.timezone || 'UTC';
    const tagline = this.escapeHTML(safeUser.tagline || 'A Hunter grows sharper when discipline holds longer than mood.');
    const provider = this.escapeHTML(safeUser.authProvider || 'local');
    const verified = safeUser.emailVerified ? 'Verified' : 'Unverified';
    const initials = this.escapeHTML(
      (displayName || 'H')
        .split(/\s+/)
        .map(p => p[0] || '')
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'H'
    );

    const profileCards = [
      this.buildProfileCard('Hunter Name', displayName),
      this.buildProfileCard('Registered Email', email),
      this.buildProfileCard('Rank Title', rank, 'highlight'),
      this.buildProfileCard('Current Level', level, 'highlight'),
      this.buildProfileCard('Total XP', `${xp} XP`),
      this.buildProfileCard('Association Timezone', timezone),
      this.buildProfileCard('Auth Provider', provider),
      this.buildProfileCard('Email Status', verified),
      this.buildProfileCard('License Issued', createdAt),
      this.buildProfileCard('Verification Code', verificationCode)
    ].join('');

    return `
      <div id="ascendos-pdf-root" style="--ascendos-pdf-root:width:794px;margin:0 auto;background:#eaf4f7;color:#07111f;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.55;">
        <style>
          #ascendos-pdf-root * { box-sizing:border-box; }
          #ascendos-pdf-root .document { background:#f8fcfd; border-radius:30px; overflow:hidden; border:1px solid rgba(8,145,178,0.14); box-shadow:0 24px 60px rgba(8,15,27,0.08); }
          #ascendos-pdf-root .header { position:relative; padding:34px 34px 28px; color:#ecfeff; background:radial-gradient(circle at top right, rgba(125,211,252,0.26), transparent 28%), radial-gradient(circle at bottom left, rgba(45,212,191,0.18), transparent 24%), linear-gradient(135deg, #06131f 0%, #0b2236 38%, #0f4c5c 100%); }
          #ascendos-pdf-root .gridline { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size:32px 32px; pointer-events:none; }
          #ascendos-pdf-root .eyebrow { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.26em; color:#67e8f9; margin-bottom:12px; }
          #ascendos-pdf-root .hero { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; }
          #ascendos-pdf-root .title { font-size:42px; font-weight:900; letter-spacing:.06em; line-height:1; margin-bottom:10px; }
          #ascendos-pdf-root .tagline { font-size:17px; color:#d9f7fb; max-width:38ch; margin-bottom:16px; }
          #ascendos-pdf-root .meta-row { display:flex; flex-wrap:wrap; gap:10px; }
          #ascendos-pdf-root .meta-pill { display:inline-flex; align-items:center; padding:8px 12px; border-radius:999px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#e6fbff; }
          #ascendos-pdf-root .avatar-shell { width:92px; height:92px; border-radius:26px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#22d3ee,#fde68a 52%,#818cf8); box-shadow:0 22px 40px rgba(34,211,238,0.18); }
          #ascendos-pdf-root .avatar-core { width:82px; height:82px; border-radius:22px; background:rgba(255,255,255,0.72); display:flex; align-items:center; justify-content:center; color:#07111f; font-size:34px; font-weight:900; }
          #ascendos-pdf-root .content { padding:26px; }
          #ascendos-pdf-root .quote-box, #ascendos-pdf-root .section-card, #ascendos-pdf-root .code-box, #ascendos-pdf-root .footer-box { break-inside:avoid; page-break-inside:avoid; }
          #ascendos-pdf-root .quote-box { margin-bottom:20px; padding:20px 22px; border-radius:22px; background:linear-gradient(135deg, rgba(34,211,238,0.10), rgba(255,255,255,0.95)); border:1px solid rgba(8,145,178,0.12); }
          #ascendos-pdf-root .quote-mark { font-size:28px; color:#0891b2; margin-bottom:6px; }
          #ascendos-pdf-root .quote-text { font-size:16px; color:#12344a; font-style:italic; }
          #ascendos-pdf-root .section-card { margin-bottom:20px; background:#fdfefe; border:1px solid rgba(8,15,27,0.06); border-radius:22px; padding:22px; }
          #ascendos-pdf-root .section-header { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
          #ascendos-pdf-root .section-icon { width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #cffafe, #bae6fd); color:#0f4c5c; font-size:18px; font-weight:800; }
          #ascendos-pdf-root .section-title { font-size:17px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; color:#0f3a4f; }
          #ascendos-pdf-root .info-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px; }
          #ascendos-pdf-root .info-card { border-radius:16px; padding:15px; min-height:88px; }
          #ascendos-pdf-root .info-label { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.14em; color:#527083; margin-bottom:8px; }
          #ascendos-pdf-root .info-value { font-size:17px; font-weight:800; color:#07111f; word-break:break-word; overflow-wrap:anywhere; }
          #ascendos-pdf-root .ledger { display:grid; grid-template-columns:1.2fr .8fr; gap:14px; margin-bottom:20px; }
          #ascendos-pdf-root .panel { border-radius:20px; padding:18px; background:linear-gradient(180deg, #ffffff, #f5fbfd); border:1px solid rgba(15,23,42,0.06); }
          #ascendos-pdf-root .panel-kicker { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.16em; color:#0891b2; margin-bottom:8px; }
          #ascendos-pdf-root .panel-title { font-size:24px; font-weight:900; color:#07111f; margin-bottom:6px; }
          #ascendos-pdf-root .panel-copy { font-size:14px; color:#456172; line-height:1.7; }
          #ascendos-pdf-root .code-box { text-align:center; border-radius:24px; padding:24px 20px; background:linear-gradient(135deg, #fff7cc, #ffe08a 60%, #ffd166); border:2px solid rgba(217,119,6,0.28); margin-bottom:20px; }
          #ascendos-pdf-root .code-label { font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:.16em; color:#7c4a03; margin-bottom:10px; }
          #ascendos-pdf-root .code-value { font-family:"Courier New", Consolas, monospace; font-size:46px; line-height:1.1; font-weight:900; letter-spacing:.18em; color:#8a3d00; margin-bottom:10px; }
          #ascendos-pdf-root .code-warning { font-size:13px; font-weight:800; color:#9a3412; margin-bottom:8px; }
          #ascendos-pdf-root .code-note { font-size:13px; color:#7c4a03; max-width:560px; margin:0 auto; }
          #ascendos-pdf-root .footer-box { border-top:1px solid rgba(8,145,178,0.12); padding-top:16px; }
          #ascendos-pdf-root .footer-text { font-size:12px; color:#537082; margin-top:6px; }
          #ascendos-pdf-root .footer-strong { color:#0f4c5c; font-weight:900; }
        </style>

        <div class="document">
          <header class="header">
            <div class="gridline"></div>
            <div class="eyebrow">Hunter Association License Archive</div>
            <div class="hero">
              <div>
                <div class="title">HUNTEROS</div>
                <div class="tagline">${tagline}</div>
                <div class="meta-row">
                  <span class="meta-pill">Licensed Record</span>
                  <span class="meta-pill">${this.escapeHTML(rank)}</span>
                  <span class="meta-pill">Level ${this.escapeHTML(level)}</span>
                </div>
              </div>
              <div class="avatar-shell"><div class="avatar-core">${initials}</div></div>
            </div>
          </header>

          <main class="content">
            <section class="quote-box">
              <div class="quote-mark">“</div>
              <div class="quote-text">${this.escapeHTML(quote)}</div>
            </section>

            <section class="section-card">
              <div class="section-header">
                <div class="section-icon">◆</div>
                <div class="section-title">Hunter License Profile</div>
              </div>
              <div class="info-grid">${profileCards}</div>
            </section>

            <section class="ledger">
              <div class="panel">
                <div class="panel-kicker">Field Summary</div>
                <div class="panel-title">Operational Standing</div>
                <div class="panel-copy">This archive captures the hunter identity, current progression tier, recorded experience total, authentication source, and secure recovery credentials associated with the active HunterOS account.</div>
              </div>
              <div class="panel">
                <div class="panel-kicker">Issued</div>
                <div class="panel-title">${this.escapeHTML(generatedAt)}</div>
                <div class="panel-copy">Generated from the active local license record for backup, verification, and personal archiving.</div>
              </div>
            </section>

            <section class="code-box">
              <div class="code-label">Secure Verification Code</div>
              <div class="code-value">${verificationCode}</div>
              <div class="code-warning">Do not share this code with anyone.</div>
              <div class="code-note">This code may be required for account recovery, CSV verification, and protected access restoration inside HunterOS.</div>
            </section>

            <footer class="footer-box">
              <div class="footer-text"><span class="footer-strong">Security Notice:</span> This document contains sensitive hunter account information. Store it safely and avoid public sharing.</div>
              <div class="footer-text">Generated on ${this.escapeHTML(generatedAt)} • HunterOS License System • CodeVogue</div>
            </footer>
          </main>
        </div>
      </div>`;
  },

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  createPDFRenderContainer(htmlContent) {
    const existing = document.getElementById('ascendos-pdf-render-host');
    if (existing) existing.remove();

    const host = document.createElement('div');
    host.id = 'ascendos-pdf-render-host';
    Object.assign(host.style, {
      position: 'absolute',
      left: '-10000px',
      top: '0',
      width: '794px',
      minHeight: '1123px',
      background: '#ffffff',
      zIndex: '-1',
      padding: '0',
      margin: '0',
      opacity: '1',
      visibility: 'visible',
      pointerEvents: 'none'
    });

    host.innerHTML = htmlContent;
    document.body.appendChild(host);
    return host;
  },

  async exportToPDF() {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'No user logged in.' };

    if (typeof html2pdf === 'undefined') {
      return { success: false, message: 'html2pdf library not found.' };
    }

    const htmlContent = this.generateAscendosPdfHTML(user);
    const renderHost = this.createPDFRenderContainer(htmlContent);

    const rawEmail = String(user.email || 'hunteros');
    const filename = `hunteros-license-${rawEmail.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    try {
      await this.wait(300);
      const target = renderHost.querySelector('#ascendos-pdf-root') || renderHost;

      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      }).from(target).save();

      renderHost.remove();
      return { success: true, message: 'PDF downloaded successfully.' };
    } catch (error) {
      if (renderHost?.parentNode) {
        renderHost.parentNode.removeChild(renderHost);
      }
      return {
        success: false,
        message: 'PDF export failed. ' + (error?.message || 'Unknown error')
      };
    }
  },

  verifyCSVLogin(csvData, verificationCode) {
    try {
      const lines = String(csvData || '').split('\n');
      let userEmail = null;
      let storedCode = null;

      for (const line of lines) {
        if (line.includes('Email,') || line.includes('"Email"') || line.includes('Registered Email')) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            userEmail = parts[1].replace(/"/g, '').trim();
          }
        }

        if (line.includes('VERIFICATION CODE,') || line.includes('"VERIFICATION CODE"')) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            storedCode = parts[1].replace(/"/g, '').trim();
          }
        }
      }

      if (!userEmail) {
        return { success: false, message: 'Invalid CSV file - email not found.' };
      }

      if (!storedCode || storedCode === 'N/A') {
        return { success: false, message: 'Invalid CSV file - verification code not found.' };
      }

      if (String(verificationCode).trim() !== String(storedCode).trim()) {
        return {
          success: false,
          message: 'Verification code does not match. Please check your code and try again.'
        };
      }

      const stored = localStorage.getItem(this.getAccountKey(userEmail));
      if (!stored) {
        return { success: false, message: 'Account not found. Please sign up first.' };
      }

      const account = JSON.parse(stored);
      const user = this.normalizeUser(account.user || {});
      user.loginTime = new Date().toISOString();
      user.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      this.persistUser(user, account.password);
      this.initUserStorage(userEmail);

      return { success: true, user, message: 'CSV login successful!' };
    } catch (e) {
      return { success: false, message: 'Error processing CSV file: ' + e.message };
    }
  }
};

if (typeof window !== 'undefined' && window.document && AuthSystem && typeof AuthSystem.loadTheme === 'function') {
  document.addEventListener('DOMContentLoaded', function () {
    AuthSystem.loadTheme();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthSystem;
}