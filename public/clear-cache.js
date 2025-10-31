// Force cache clear script for iPhone users
(function() {
  'use strict';
  
  const APP_VERSION = '2.0.0';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  console.log('🧹 Cache clearing script loaded', { APP_VERSION, isIOS });
  
  if (isIOS) {
    // Force clear on iOS
    try {
      // Clear localStorage
      const keysToPreserve = ['auth_token', 'user_preferences'];
      const preserved = {};
      keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preserved[key] = value;
      });
      
      localStorage.clear();
      
      // Restore preserved keys
      Object.keys(preserved).forEach(key => {
        localStorage.setItem(key, preserved[key]);
      });
      
      localStorage.setItem('app_version', APP_VERSION);
      localStorage.setItem('cache_cleared_at', new Date().toISOString());
      
      console.log('✅ Cache cleared successfully on iOS');
    } catch (e) {
      console.error('❌ Failed to clear cache:', e);
    }
  }
})();

