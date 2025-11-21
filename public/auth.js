// ===== Mock users (demo only) =====
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


// ===== Helpers to manage auth state in localStorage =====
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
function login(username, password) {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return { success: false, message: "Invalid username or password." };
  }

  // Store full user (without password)
  setCurrentUser({
    username: user.username,
    role: user.role,
    dashboards: user.dashboards || []
  });

  return { success: true };
}

function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}


// ===== Guards =====
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}

function requireDashboardAccess(pageName) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!Array.isArray(user.dashboards) || !user.dashboards.includes(pageName)) {
    alert("You do not have permission to access this dashboard.");
    const fallback =
      Array.isArray(user.dashboards) && user.dashboards.length
        ? user.dashboards[0]
        : "login.html";
    window.location.href = fallback;
  }
}


// ===== Nav / UI wiring =====
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
  dashboardLinks.forEach((link) => {
    const page = link.getAttribute("data-dashboard");

    if (!user || !Array.isArray(user.dashboards) || !user.dashboards.includes(page)) {
      link.style.display = "none";
    } else {
      link.style.display = "inline-block";
    }
  });
}

// Run once DOM is ready on each page that includes the nav
document.addEventListener("DOMContentLoaded", updateNavAuthState);
