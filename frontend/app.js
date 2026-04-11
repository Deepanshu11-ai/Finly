const BASE_URL = "http://127.0.0.1:8000"; // change after deploy

// LOGIN
async function login() {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `email=${email.value}&password=${password.value}`
    });

    const data = await res.json();

    if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("msg").innerText = data.detail || "Login failed";
        document.getElementById("msg").className = "error";
    }
}

// UPLOAD
async function upload() {
    const token = localStorage.getItem("token");

    let formData = new FormData();
    formData.append("file", document.getElementById("file").files[0]);

    const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        body: formData
    });

    const data = await res.json();

    document.getElementById("uploadMsg").innerText =
        data.message || data.detail;

    document.getElementById("uploadMsg").className =
        data.message ? "success" : "error";
}

// CHAT
async function ask() {
    const token = localStorage.getItem("token");
    const q = document.getElementById("question").value;

    document.getElementById("answer").innerText = "Thinking...";

    const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `question=${q}`
    });

    const data = await res.json();

    document.getElementById("answer").innerText =
        data.answer || data.detail;

    document.getElementById("answer").className =
        data.answer ? "success" : "error";
}