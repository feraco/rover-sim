// Apple Glass Design System - Theme Toggle
(function() {
  // Check for saved theme preference or default to 'dark'
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply theme on load
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
      // Update button icon based on current theme
      updateToggleIcon(currentTheme);
      
      // Add click handler
      themeToggle.addEventListener('click', function() {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
        
        // Optional: Add a subtle animation
        themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
          themeToggle.style.transform = '';
        }, 300);
      });
    }
  });
  
  function updateToggleIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      // ☀️ for light theme, 🌙 for dark theme
      themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    }
  }
})();
