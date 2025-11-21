// =====================
// auth.js  (GitHub Pages mock auth)
// =====================

// Mock users (demo only – NOT secure)
const MOCK_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    dashboards: ["dashboard1.html", "dashboard2.html", "dashboard3.html"]
  },
  {
    username: "jjparkerlee",
    password: "123456",
    role: "user",
    dashboards: ["dashboard2.html", "dashboard3.html"]
  }
];


// ===== LocalStorage helpers =====

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}


// ===== Core auth functions =====

// Called from login.html
// Returns: { success: boolean, message?: string, redirectTo?: string }
function login(username, password) {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { success: false, message: "Invalid username or password." };
  }

  // Store full user (without password)
  const storedUser = {
    username: user.username,
    role: user.role,
    dashboards: Array.isArray(user.dashboards) ? user.dashboards : []
  };

  setCurrentUser(storedUser);

  // Decide first dashboard they should see
  const firstDashboard =
    storedUser.dashboards.length > 0
      ? storedUser.dashboards[0]
      : "dashboard1.html";

  return {
    success: true,
    redirectTo: firstDashboard
  };
}

function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}


// ===== Guards =====

// Basic: just require any logged-in user
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
}

// Only allow admins
function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}

// Per-dashboard access control
function requireDashboardAccess(pageName) {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const dashboards = Array.isArray(user.dashboards) ? user.dashboards : [];

  let allowed = false;
  for (let i = 0; i < dashboards.length; i++) {
    if (dashboards[i] === pageName) {
      allowed = true;
      break;
    }
  }

  if (!allowed) {
    alert("You do not have permission to access this dashboard.");
    const fallback = dashboards.length > 0 ? dashboards[0] : "login.html";
    window.location.href = fallback;
  }
}


// ===== Nav / UI wiring =====

// Called on DOMContentLoaded on pages that include the nav
function updateNavAuthState() {
  const user = getCurrentUser();

  const loggedOutLinks = document.querySelectorAll(".nav-logged-out");
  const loggedInLinks = document.querySelectorAll(".nav-logged-in");
  const usernameSpans = document.querySelectorAll(".nav-username");

  if (user) {
    loggedOutLinks.forEach((el) => (el.style.display = "none"));
    loggedInLinks.forEach((el) => (el.style.display = "inline-block"));
    usernameSpans.forEach((el) => (el.textContent = user.username));
  } else {
    loggedOutLinks.forEach((el) => (el.style.display = "inline-block"));
    loggedInLinks.forEach((el) => (el.style.display = "none"));
    usernameSpans.forEach((el) => (el.textContent = ""));
  }

  // Hide dashboard links user doesn't have access to
  const dashboardLinks = document.querySelectorAll("[data-dashboard]");
  const dashboards =
    user && Array.isArray(user.dashboards) ? user.dashboards : [];

  dashboardLinks.forEach((link) => {
    const page = link.getAttribute("data-dashboard");

    let allowed = false;
    for (let i = 0; i < dashboards.length; i++) {
      if (dashboards[i] === page) {
        allowed = true;
        break;
      }
    }

    if (!user || !allowed) {
      link.style.display = "none";
    } else {
      link.style.display = "inline-block";
    }
  });
}


// Run when DOM is ready (for pages that include this file)
document.addEventListener("DOMContentLoaded", updateNavAuthState);
