/**
 * Admin utilities - Check if a user is an admin
 */

// Get admin emails from environment variable or config
// Format: comma-separated list like "admin1@example.com,admin2@example.com"
const getAdminEmails = () => {
  const envAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (envAdmins) {
    return envAdmins.split(',').map((email) => email.trim().toLowerCase());
  }
  // Default admin email - you can change this
  return [];
};

const ADMIN_EMAILS = getAdminEmails();

/**
 * Check if a user is an admin based on their email
 * @param {Object} user - Firebase user object
 * @returns {boolean} - True if user is an admin
 */
export const isAdmin = (user) => {
  if (!user || !user.email) {
    return false;
  }

  const userEmail = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(userEmail);
};

/**
 * Hook to check admin status (can be extended to check with backend)
 * @param {Object} user - Firebase user object
 * @returns {Object} - { isAdmin: boolean, checking: boolean }
 */
export const useAdminStatus = (user) => ({
    isAdmin: isAdmin(user),
    checking: false, // Can be extended to check with backend if needed
  });
