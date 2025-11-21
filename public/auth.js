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
    dashboards: ["dashboard2.html"]
  },
  {
    username: "jjparkerlee",
    password: "123456",
    role: "user",
    dashboards: ["dashboard3.html"]
  }
];


// Hide dashboard links user doesn't have access to
const user = getCurrentUser();
const dashboardLinks = document.querySelectorAll("[data-dashboard]");

dashboardLinks.forEach(link => {
  const page = link.getAttribute("data-dashboard");
  if (!user || !user.dashboards.includes(page)) {
    link.style.display = "none";
  } else {
    link.style.display = "inline-block";
  }
});



// Helpers to manage auth state in localStorage
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

// Called on login form submit
function login(username, password) {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return { success: false, message: "Invalid username or password." };
  }
  setCurrentUser({ username: user.username, role: user.role });
  return { success: true };
}

// For logout button
function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}

// Guard functions to use on pages
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

// Utility to update nav UI based on login state
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
}

function requireDashboardAccess(pageName) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (!user.dashboards.includes(pageName)) {
    // optional feedback
    alert("You do not have permission to access this dashboard.");
    window.location.href = user.dashboards[0]; // send to their allowed dashboard
  }
}


// Call this after DOM loads on each page that has the nav
document.addEventListener("DOMContentLoaded", updateNavAuthState);
