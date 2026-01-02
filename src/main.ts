/**
 * Submarine Welding Simulator - Entry Point
 *
 * Main entry point that initializes and starts the application.
 */

import { app } from './App';

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.start().catch(console.error);
  });
} else {
  app.start().catch(console.error);
}

// Handle cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.dispose();
});

export { app };
