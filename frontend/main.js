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
function displayScore(score) {
    if (!score) {
        console.error("No score data provided");
        return;
    }

    try {
        // Extract score components
        const scoreValue = score.score || score.scoreValue || 0;
        const label = score.label || "Unable to calculate";
        const reasons = score.reasons || [];

        // Update score value
        const scoreValueEl = document.getElementById("scoreValue");
        if (scoreValueEl) {
            scoreValueEl.innerText = `${scoreValue}/100`;
            
            // Color code the score
            let color = "#dc3545"; // red
            if (scoreValue >= 85) color = "#28a745"; // green
            else if (scoreValue >= 70) color = "#ffc107"; // yellow
            else if (scoreValue >= 50) color = "#ff9800"; // orange
            
            scoreValueEl.style.color = color;
            scoreValueEl.style.fontSize = "48px";
            scoreValueEl.style.fontWeight = "bold";
        }

        // Update label
        const labelEl = document.getElementById("scoreLabel");
        if (labelEl) {
            labelEl.innerText = label;
            labelEl.style.fontSize = "18px";
            labelEl.style.fontWeight = "bold";
        }

        // Update reasons with proper formatting
        const reasonsEl = document.getElementById("scoreReasons");
        if (reasonsEl) {
            if (reasons && reasons.length > 0) {
                reasonsEl.innerHTML = reasons
                    .map(r => `
                        <li style="
                            margin-bottom: 12px;
                            line-height: 1.5;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        ">
                            ${r}
                        </li>
                    `)
                    .join("");
                
                // Style the list
                reasonsEl.style.paddingLeft = "20px";
            } else {
                reasonsEl.innerHTML = "<li>No specific reasons identified</li>";
            }
        }
    } catch (err) {
        console.error("Error displaying score:", err);
    }
}
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
  const fileInput = document.getElementById("file");
  const msg = document.getElementById("uploadMsg");

  if (!msg) return;

  const file = fileInput?.files[0];

  // ---------------- VALIDATION ----------------
  if (!file) {
    msg.innerText = "❌ Please select a file first";
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    msg.innerText = "❌ Please login first";
    return;
  }

  msg.innerText = "⏳ Uploading and analyzing...";

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
    console.log("UPLOAD RESPONSE:", data);

    // Check if response is valid
    if (!data) {
      msg.innerText = "❌ Empty response from server";
      return;
    }

    // SUCCESS: Has analysis
    if (res.ok && data.analysis) {
      displaySummary(data.analysis);
      
      // Display hidden clauses if available
      if (data.risks && data.risks.risks) {
        renderHiddenClauses(data.risks);
      }

      // Display score if available
      if (data.score) {
        displayScore(data.score);
      }

      msg.innerText = "✅ Document uploaded & analyzed!";
      fileInput.value = "";
    } 
    // Still upload but with partial data
    else if (data.analysis) {
      displaySummary(data.analysis);
      msg.innerText = "⚠️ Uploaded with partial analysis";
    }
    // Error response
    else {
      console.error("Upload error response:", data);
      msg.innerText = `❌ ${data.error || data.detail || "Upload failed"}`;
    }

  } catch (err) {
    console.error("Upload exception:", err);
    msg.innerText = `❌ Error: ${err.message}`;
  }
}

// ---------------- SUMMARY ----------------
function displaySummary(data) {
  if (!data) {
    console.error("No data provided to displaySummary");
    return;
  }

  function renderList(items, title, color) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return `<p style="color: #999;">No data</p>`;
    }

    return `
      <h3>${title}</h3>
      <ul style="padding-left:15px;">
        ${items.map((item, index) => {
          // Handle both string and object items
          const text = typeof item === 'string' ? item : (item?.text || '');
          const evidence = item?.evidence || '';
          
          if (!text) return '';
          
          return `
            <li style="margin-bottom:8px;cursor:pointer;"
                onclick="toggleEvidence('${title}-${index}')">
              
              ${text}
              
              ${evidence ? `
              <div id="${title}-${index}" style="
                display:none;
                margin-top:5px;
                padding:8px;
                background:#f8f9fa;
                border-left:3px solid ${color};
                font-size:13px;
              ">
                📄 ${evidence}
              </div>
              ` : ''}

            </li>
          `;
        }).join("")}
      </ul>
    `;
  }

  try {
    const covered = document.getElementById("covered");
    const notCovered = document.getElementById("not-covered");
    const conditions = document.getElementById("conditions");

    if (covered) {
      covered.innerHTML = renderList(data.covered, "🟢 Covered", "green");
    }
    if (notCovered) {
      notCovered.innerHTML = renderList(data.not_covered, "🔴 Not Covered", "red");
    }
    if (conditions) {
      conditions.innerHTML = renderList(data.conditions, "🟡 Conditions", "orange");
    }
  } catch (err) {
    console.error("Error displaying summary:", err);
  }
}

// Toggle evidence visibility
function toggleEvidence(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = el.style.display === "none" ? "block" : "none";
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

async function detectClauses() {
  const el = document.getElementById("hidden-results");

  if (!el) return;

  el.innerHTML = "🔍 Scanning for hidden risks...";

  try {
    const res = await fetch(`${BASE_URL}/hidden-clauses`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    const data = await res.json();

    console.log("HIDDEN CLAUSES:", data);

    if (!data.risks || data.risks.length === 0) {
      el.innerHTML = "✅ No major hidden clauses found";
      return;
    }

    el.innerHTML = data.risks.map(r => `
      <div style="
        background:#fff3cd;
        padding:15px;
        margin:12px 0;
        border-radius:10px;
        border-left:6px solid ${
          r.impact === "High" ? "#dc3545" :
          r.impact === "Medium" ? "#fd7e14" : "#28a745"
        };
      ">
        
        <div style="font-size:16px;font-weight:bold;">
          ⚠ ${r.clause}
        </div>

        <div style="margin-top:5px;">
          Impact: 
          <b style="color:${
            r.impact === "High" ? "red" :
            r.impact === "Medium" ? "orange" : "green"
          };">
            ${r.impact}
          </b>
        </div>

        <div style="margin-top:8px;">
          ${r.explanation}
        </div>

        <div style="
          margin-top:10px;
          padding:10px;
          background:#ffeeba;
          border-radius:6px;
        ">
          💸 <b>Financial Impact:</b> 
          ${r.financial_impact || "May reduce your claim"}
        </div>

      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    el.innerHTML = "❌ Error detecting clauses";
  }
}

function toggleEvidence(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display = el.style.display === "none" ? "block" : "none";
}

function renderHiddenClauses(data) {
  const el = document.getElementById("hidden-results");

  if (!el) return;

  if (!data || !data.risks || data.risks.length === 0) {
    el.innerHTML = "✅ No major hidden clauses found";
    return;
  }

  el.innerHTML = data.risks.map(r => `
    <div style="
      background:#fff3cd;
      padding:15px;
      margin:12px 0;
      border-radius:10px;
      border-left:6px solid ${
        r.impact === "High" ? "#dc3545" :
        r.impact === "Medium" ? "#fd7e14" : "#28a745"
      };
    ">
      <b>⚠ ${r.clause}</b><br>

      <div style="margin-top:5px;">
        Impact: <b>${r.impact}</b>
      </div>

      <p style="margin-top:8px;">${r.explanation}</p>

      <div style="
        margin-top:10px;
        padding:10px;
        background:#ffeeba;
        border-radius:6px;
      ">
        💸 ${r.financial_impact || "May reduce your claim"}
      </div>

    </div>
  `).join("");
}