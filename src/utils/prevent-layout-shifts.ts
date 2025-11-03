// Utility to prevent layout shifts and component glitches
export const preventLayoutShifts = () => {
  // Add preload class to prevent transitions on initial load
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('preload-transitions');
    
    // Remove preload class after page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.documentElement.classList.remove('preload-transitions');
      }, 100);
    });

    // Also remove on DOMContentLoaded as fallback
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.documentElement.classList.remove('preload-transitions');
      }, 100);
    });

    // Remove immediately if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(() => {
        document.documentElement.classList.remove('preload-transitions');
      }, 100);
    }
  }
};

// Call on module load
preventLayoutShifts();
