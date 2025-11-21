// auth.js – mock authentication

const MOCK_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    dashboards: ["dashboard1.html", "dashboard2.html", "dashboard3.html", "research.html"]
  },
  {
    username: "jserraty",
    password: "1234",
    role: "user",
    dashboards: ["dashboard1.html", "research.html"]
  }
];

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

function login(username, password) {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return { success: false, message: "Invalid username or password." };
  }
  const storedUser = {
    username: user.username,
    role: user.role,
    dashboards: Array.isArray(user.dashboards) ? user.dashboards : []
  };
  setCurrentUser(storedUser);
  const firstDash = storedUser.dashboards.length
    ? storedUser.dashboards[0]
    : "dashboard1.html";
  return { success: true, redirectTo: firstDash };
}

function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}

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

function requireDashboardAccess(name) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const dashes = Array.isArray(user.dashboards) ? user.dashboards : [];
  if (!dashes.includes(name)) {
    alert("You do not have permission to access this dashboard.");
    const fallback = dashes.length ? dashes[0] : "login.html";
    window.location.href = fallback;
  }
}

function updateNavAuthState() {
  const user = getCurrentUser();
  const loggedOut = document.querySelectorAll(".nav-logged-out");
  const loggedIn = document.querySelectorAll(".nav-logged-in");
  const usernames = document.querySelectorAll(".nav-username");
  const adminLinks = document.querySelectorAll('a[href="admin.html"]');

  if (user) {
    loggedOut.forEach(el => el.style.display = "none");
    loggedIn.forEach(el => el.style.display = "inline-block");
    usernames.forEach(el => el.textContent = user.username);
    adminLinks.forEach(el =>
      el.style.display = user.role === "admin" ? "inline-block" : "none"
    );
  } else {
    loggedOut.forEach(el => el.style.display = "inline-block");
    loggedIn.forEach(el => el.style.display = "none");
    usernames.forEach(el => el.textContent = "");
    adminLinks.forEach(el => el.style.display = "none");
  }

  const dashLinks = document.querySelectorAll("[data-dashboard]");
  const list = user && Array.isArray(user.dashboards) ? user.dashboards : [];
  dashLinks.forEach(link => {
    const page = link.getAttribute("data-dashboard");
    link.style.display = user && list.includes(page)
      ? "inline-block"
      : "none";
  });
}

function highlightActiveNav() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header nav a[href]").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === current);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavAuthState();
  highlightActiveNav();
});
