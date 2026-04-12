const BASE_URL = "http://127.0.0.1:8000";

// ---------------- AUTH CHECK ----------------
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard.html")) {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    if (!token) {
      window.location.href = "index.html";
      return;
    }
    
    if (email) {
      const userEmailEl = document.getElementById("userEmail");
      if (userEmailEl) {
        userEmailEl.innerText = "👤 " + email;
      }
    }
  }
});

// ---------------- LOGIN ----------------
async function login() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    if (res.ok && data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("email", email);
      window.location.href = "dashboard.html";
    } else {
      alert(data.detail || "Login failed");
    }

  } catch (err) {
    alert("Error: " + err.message);
  }
}

// ---------------- SIGNUP ----------------
async function signup() {
  const email = document.getElementById("signupEmail")?.value;
  const password = document.getElementById("signupPassword")?.value;
  const confirmPassword = document.getElementById("signupPasswordConfirm")?.value;

  if (!email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Account created! Please login.");
      document.getElementById("signupEmail").value = "";
      document.getElementById("signupPassword").value = "";
      document.getElementById("signupPasswordConfirm").value = "";
    } else {
      alert(data.detail || "Signup failed");
    }

  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Toggle between login and signup forms
function toggleForm() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm && signupForm) {
    if (loginForm.style.display === "none") {
      loginForm.style.display = "block";
      signupForm.style.display = "none";
    } else {
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    }
  }
}
// ---------------- LOGOUT ----------------
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "index.html";
  }
}

// ---------------- UPLOAD ----------------
async function upload() {
  const file = document.getElementById("file")?.files[0];
  const msg = document.getElementById("uploadMsg");

  if (!msg) return;

  if (!file) {
    msg.innerText = "❌ Please select a file first";
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    msg.innerText = "❌ Please login first";
    return;
  }

  msg.innerText = "⏳ Uploading...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.analysis) {
      displaySummary(data.analysis);
      msg.innerText = "✅ Document uploaded successfully!";
      document.getElementById("file").value = "";
    } else {
      msg.innerText = `❌ ${data.error || data.detail || "Upload failed"}`;
    }

  } catch (err) {
    msg.innerText = `❌ Error: ${err.message}`;
  }
}

// ---------------- SUMMARY ----------------
function displaySummary(data) {
  if (!data) return;

  const covered = data.covered || [];
  const notCovered = data.not_covered || [];
  const conditions = data.conditions || [];

  const coveredEl = document.getElementById("covered");
  const notCoveredEl = document.getElementById("not-covered");
  const conditionsEl = document.getElementById("conditions");

  if (coveredEl) {
    coveredEl.innerHTML =
      `<h3>🟢 Covered</h3>
       ${covered.length > 0 ? `<ul>${covered.map(i => `<li>${i}</li>`).join("")}</ul>` : "<p>No coverage information</p>"}`;
  }

  if (notCoveredEl) {
    notCoveredEl.innerHTML =
      `<h3>🔴 Not Covered</h3>
       ${notCovered.length > 0 ? `<ul>${notCovered.map(i => `<li>${i}</li>`).join("")}</ul>` : "<p>No exclusions found</p>"}`;
  }

  if (conditionsEl) {
    conditionsEl.innerHTML =
      `<h3>🟡 Conditions</h3>
       ${conditions.length > 0 ? `<ul>${conditions.map(i => `<li>${i}</li>`).join("")}</ul>` : "<p>No conditions found</p>"}`;
  }
}

// ---------------- ASK ----------------
async function ask() {
  const query = document.getElementById("question")?.value;
  const answerEl = document.getElementById("answer");

  if (!answerEl) return;

  if (!query || !query.trim()) {
    answerEl.innerHTML = "❌ Please enter a question";
    return;
  }

  answerEl.innerHTML = "🤔 Thinking...";

  const token = localStorage.getItem("token");
  if (!token) {
    answerEl.innerHTML = "❌ Please login first";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();

    if (data && data.status) {
      const color = data.status === "Covered" ? "#10b981" : data.status === "Not Covered" ? "#ef4444" : "#fbbf24";
      answerEl.innerHTML = `
        <div style="padding: 10px;">
          <p><b>Status:</b> <span style="color: ${color}; font-weight: bold;">${data.status}</span></p>
          <p><b>Reason:</b> ${data.reason || 'N/A'}</p>
          <p><b>Confidence:</b> ${data.confidence || 'N/A'}</p>
        </div>
      `;
    } else {
      answerEl.innerHTML = `❌ ${data?.error || "No response"}`;
    }

  } catch (err) {
    answerEl.innerHTML = `❌ Error: ${err.message}`;
  }
}

// ---------------- SIMULATOR ----------------
async function simulate() {
  const scenario = document.getElementById("scenario")?.value;
  const el = document.getElementById("simulation-result");

  if (!el) return;

  if (!scenario || !scenario.trim()) {
    el.innerHTML = "❌ Enter scenario";
    return;
  }

  el.innerHTML = "🤔 Analyzing...";

  const token = localStorage.getItem("token");
  if (!token) {
    el.innerHTML = "❌ Please login first";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ query: scenario })
    });

    const data = await res.json();

    if (data && data.status) {
      const color = data.status === "Covered" ? "#10b981" : data.status === "Not Covered" ? "#ef4444" : "#fbbf24";
      el.innerHTML = `
        <div style="margin-top: 10px; padding: 12px; background: #f0f0f0; border-radius: 6px;">
          <p><b>Coverage Status:</b> <span style="color: ${color}; font-weight: bold;">${data.status}</span></p>
          <p><b>Details:</b> ${data.reason || 'N/A'}</p>
          <p><b>Confidence:</b> ${data.confidence || 'N/A'}</p>
        </div>
      `;
    } else {
      el.innerHTML = `❌ ${data?.error || "No response"}`;
    }

  } catch (err) {
    el.innerHTML = `❌ Error: ${err.message}`;
  }
}