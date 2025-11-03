// Enhanced mobile session manager with reliability improvements
import { safeStorage } from './network-manager';
// Removed global DataLoadingManager import

interface SessionData {
  accessToken: string;
  user: any;
  lastUpdated: number;
  expiresAt?: number;
}

class MobileSessionManager {
  private static instance: MobileSessionManager;
  private sessionKey = 'hireplan_session';
  private cacheKey = 'cachedUserProfile';
  private lastSyncTime = 0;
  private syncInterval = 30000; // 30 seconds
  private isHydrating = false;

  static getInstance(): MobileSessionManager {
    if (!MobileSessionManager.instance) {
      MobileSessionManager.instance = new MobileSessionManager();
    }
    return MobileSessionManager.instance;
  }

  constructor() {
    this.initializeMobileOptimizations();
  }

  private initializeMobileOptimizations(): void {
    // Handle app visibility changes (mobile backgrounding)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Handle page unload for cleanup
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Handle storage events from other tabs
    window.addEventListener('storage', this.handleStorageChange);
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // App came back to foreground - check if session needs refresh
      this.maybeRefreshSession();
    } else {
      // App going to background - save current state
      this.saveSessionState();
    }
  };

  private handleBeforeUnload = (): void => {
    this.saveSessionState();
  };

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === this.sessionKey && event.newValue !== event.oldValue) {
      console.log('📱 Session updated in another tab');
      // Broadcast session change to other parts of the app
      window.dispatchEvent(new CustomEvent('sessionUpdated'));
    }
  };

  private async maybeRefreshSession(): Promise<void> {
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncInterval) {
      return; // Too soon to sync again
    }

    try {
      const session = this.getStoredSession();
      if (session && this.isSessionExpiringSoon(session)) {
        console.log('📱 Session expiring soon, triggering refresh...');
        window.dispatchEvent(new CustomEvent('sessionRefreshNeeded'));
      }
    } catch (error) {
      console.warn('📱 Session refresh check failed:', error);
    }

    this.lastSyncTime = now;
  }

  private isSessionExpiringSoon(session: SessionData): boolean {
    if (!session.expiresAt) return false;
    const timeUntilExpiry = session.expiresAt - Date.now();
    return timeUntilExpiry < 300000; // Less than 5 minutes
  }

  private saveSessionState(): void {
    // Save any pending session state
    // This is called when the app is backgrounded or closed
  }

  public async setSession(sessionData: { accessToken: string; user: any }): Promise<boolean> {
    try {
      const session: SessionData = {
        accessToken: sessionData.accessToken,
        user: sessionData.user,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      // Store session data
      const sessionStored = await safeStorage.setItem(this.sessionKey, JSON.stringify(session));
      const profileStored = await safeStorage.setItem(this.cacheKey, JSON.stringify(sessionData.user));
      
      if (!sessionStored || !profileStored) {
        console.warn('📱 Failed to store session data');
        return false;
      }

      console.log('📱 Session updated successfully');
      window.dispatchEvent(new CustomEvent('sessionUpdated'));
      return true;
      
    } catch (error) {
      console.error('📱 Session update failed:', error);
      return false;
    }
  }

  public getStoredSession(): SessionData | null {
    try {
      const sessionData = safeStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as SessionData;
      
      // Check if session is expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        console.log('📱 Session expired, clearing...');
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.warn('📱 Failed to parse stored session:', error);
      return null;
    }
  }

  public getAccessToken(): string | null {
    const session = this.getStoredSession();
    return session?.accessToken || null;
  }

  public getCachedProfile(): any | null {
    try {
      const profileData = safeStorage.getItem(this.cacheKey);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.warn('📱 Failed to parse cached profile:', error);
      return null;
    }
  }

  public clearSession(): boolean {
    try {
      const tokenCleared = safeStorage.removeItem('client_access_token'); // Legacy key
      const sessionCleared = safeStorage.removeItem(this.sessionKey);
      const profileCleared = safeStorage.removeItem(this.cacheKey);
      
      console.log('📱 Session cleared');
      window.dispatchEvent(new CustomEvent('sessionCleared'));
      
      return tokenCleared && sessionCleared && profileCleared;
    } catch (error) {
      console.error('📱 Failed to clear session:', error);
      return false;
    }
  }

  public isAuthenticated(): boolean {
    const session = this.getStoredSession();
    return !!session?.accessToken;
  }

  // Hydration helper for immediate render
  public getHydrationData(): { accessToken: string | null; user: any | null } {
    if (this.isHydrating) {
      return { accessToken: null, user: null }; // Prevent multiple hydrations
    }

    this.isHydrating = true;
    
    try {
      const session = this.getStoredSession();
      return {
        accessToken: session?.accessToken || null,
        user: session?.user || this.getCachedProfile(),
      };
    } finally {
      // Reset hydration flag after a brief delay
      setTimeout(() => {
        this.isHydrating = false;
      }, 100);
    }
  }

  // Enhanced session validation for mobile
  public async validateSession(): Promise<boolean> {
    const session = this.getStoredSession();
    
    if (!session) {
      return false;
    }

    // Check if session data is corrupted
    if (!session.accessToken || !session.user) {
      console.warn('📱 Corrupted session detected, clearing...');
      this.clearSession();
      return false;
    }

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.log('📱 Session expired');
      this.clearSession();
      return false;
    }

    return true;
  }

  // Cleanup method
  public destroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('storage', this.handleStorageChange);
  }
}

export const mobileSessionManager = MobileSessionManager.getInstance();
export default MobileSessionManager;
