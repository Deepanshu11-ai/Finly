const BASE_URL = "http://127.0.0.1:8000";

// CHECK AUTH & LOAD DASHBOARD
document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname.includes("dashboard.html")) {
        checkAuth();
    }
});

// CHECK IF USER IS AUTHENTICATED
function checkAuth() {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    if (!token) {
        window.location.href = "index.html";
        return;
    }
    
    // Display user email
    if (email && document.getElementById("userEmail")) {
        document.getElementById("userEmail").innerText = "👤 " + email;
    }
}

// TOGGLE BETWEEN LOGIN AND SIGNUP FORMS
function toggleForm() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    
    if (loginForm && signupForm) {
        if (loginForm.style.display === "none") {
            loginForm.style.display = "block";
            signupForm.style.display = "none";
            document.getElementById("msg").innerText = "";
        } else {
            loginForm.style.display = "none";
            signupForm.style.display = "block";
            document.getElementById("msg").innerText = "";
        }
    }
}

// SIGNUP
async function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupPasswordConfirm").value;
    const msg = document.getElementById("msg");
    
    if (!email || !password || !confirmPassword) {
        msg.innerText = "Please fill in all fields";
        msg.className = "error";
        return;
    }
    
    if (password !== confirmPassword) {
        msg.innerText = "Passwords do not match";
        msg.className = "error";
        return;
    }
    
    if (password.length < 6) {
        msg.innerText = "Password must be at least 6 characters";
        msg.className = "error";
        return;
    }
    
    try {
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const data = await res.json();
        
        if (res.ok) {
            msg.innerText = "✅ Account created! Redirecting to login...";
            msg.className = "success";
            setTimeout(() => {
                toggleForm();
                document.getElementById("email").value = email;
                document.getElementById("password").value = "";
            }, 2000);
        } else {
            msg.innerText = data.detail || "Signup failed";
            msg.className = "error";
        }
    } catch (error) {
        msg.innerText = "Error: " + error.message;
        msg.className = "error";
    }
}

// LOGIN
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");
    
    if (!email || !password) {
        msg.innerText = "Please enter email and password";
        msg.className = "error";
        return;
    }
    
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const data = await res.json();
        
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("email", email);
            msg.innerText = "✅ Login successful! Redirecting...";
            msg.className = "success";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            msg.innerText = data.detail || "Login failed";
            msg.className = "error";
        }
    } catch (error) {
        msg.innerText = "Error: " + error.message;
        msg.className = "error";
    }
}

// LOGOUT
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.location.href = "index.html";
    }
}

// UPLOAD
async function upload() {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById("file");
    const uploadMsg = document.getElementById("uploadMsg");

    if (!token) {
        uploadMsg.innerText = "❌ Please login first";
        uploadMsg.className = "error";
        return;
    }

    if (!fileInput.files[0]) {
        uploadMsg.innerText = "❌ Please select a file";
        uploadMsg.className = "error";
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    uploadMsg.innerText = "⏳ Uploading...";
    uploadMsg.className = "";

    try {
        const res = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        const data = await res.json();
        
        if (res.ok) {
            uploadMsg.innerText = "✅ " + (data.message || "Document uploaded successfully!");
            uploadMsg.className = "success";
            fileInput.value = "";
        } else {
            uploadMsg.innerText = "❌ " + (data.error || data.detail || "Upload failed");
            uploadMsg.className = "error";
        }
    } catch (error) {
        uploadMsg.innerText = "❌ Error: " + error.message;
        uploadMsg.className = "error";
    }
}

// CHAT
async function ask() {
    const token = localStorage.getItem("token");
    const question = document.getElementById("question");
    const answer = document.getElementById("answer");

    if (!token) {
        answer.innerText = "❌ Please login first";
        return;
    }

    if (!question.value.trim()) {
        answer.innerText = "❌ Please enter a question";
        return;
    }

    answer.innerText = "🤔 Thinking...";

    try {
        const res = await fetch(`${BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `question=${encodeURIComponent(question.value)}`
        });

        const data = await res.json();
        answer.innerText = data.answer || JSON.stringify(data);
    } catch (error) {
        answer.innerText = "❌ Error: " + error.message;
    }
}

// SIMULATOR
async function simulate() {
    const token = localStorage.getItem("token");
    const scenario = document.getElementById("scenario");
    const result = document.getElementById("result");

    if (!token) {
        result.innerText = "❌ Please login first";
        return;
    }

    if (!scenario.value.trim()) {
        result.innerText = "❌ Please enter a scenario";
        return;
    }

    result.innerText = "⚡ Simulating...";

    try {
        const res = await fetch(`${BASE_URL}/simulate`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `question=${encodeURIComponent(scenario.value)}`
        });

        const data = await res.json();
        result.innerText = data.result || JSON.stringify(data);
    } catch (error) {
        result.innerText = "❌ Error: " + error.message;
    }
}

// ANALYZE
async function analyze(mode) {
    const token = localStorage.getItem("token");
    const analysis = document.getElementById("analysis");

    if (!token) {
        analysis.innerText = "❌ Please login first";
        return;
    }

    analysis.innerText = "⏳ Analyzing...";

    try {
        const res = await fetch(`${BASE_URL}/analyze`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `mode=${mode}`
        });

        const data = await res.json();

        if (!data || Object.keys(data).length === 0) {
            analysis.innerText = "No data received";
            return;
        }

        if (data.error) {
            analysis.innerText = "❌ Error: " + (data.raw || data.error);
            return;
        }

        let html = "";

        if (mode === "coverage") {
            html += "<h4>✅ Covered</h4>" + (data.covered || []).join("<br>");
            html += "<h4>❌ Not Covered</h4>" + (data.not_covered || []).join("<br>");
            html += "<h4>⚠️ Limitations</h4>" + (data.limitations || []).join("<br>");
        }

        if (mode === "highlight") {
            html += "<h4>📌 Important Clauses</h4>" + (data.important_clauses || []).join("<br>");
            html += "<h4>⚠️ Risks</h4>" + (data.risks || []).join("<br>");
            html += "<h4>💚 Benefits</h4>" + (data.benefits || []).join("<br>");
        }

        if (!html) {
            html = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
        }

        analysis.innerHTML = html;
    } catch (error) {
        analysis.innerText = "❌ Error: " + error.message;
    }
}