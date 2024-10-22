// Place this in a separate file, e.g., /src/scripts/navigation.js
export function initializeNavigation() {
  // Helper to check if element exists on page
  const elementExists = (selector) => document.querySelector(selector) !== null;

  // Handle smooth scrolling within the same page
  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);

    if (elem) {
      elem.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Update URL without reload
      history.pushState(null, "", href);
    }
  };

  // Handle navigation for cross-page links with hash
  const handleCrossPageNavigation = () => {
    // Check if we have a hash in the URL
    if (window.location.hash) {
      // Wait for page to load
      setTimeout(() => {
        const targetId = window.location.hash.replace("#", "");

        const elem = document.getElementById(targetId);

        if (elem) {
          elem.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  // Initialize scroll behavior
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");

      // If link is to current page or just a hash
      if (
        href.startsWith("#") ||
        href === window.location.pathname + window.location.hash
      ) {
        handleSmoothScroll(e, href);
      } else {
        // Let the browser handle cross-page navigation
        // The handleCrossPageNavigation will handle the scroll after page load
        return true;
      }
    });
  });

  // Handle initial load with hash
  handleCrossPageNavigation();
}
