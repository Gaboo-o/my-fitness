const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const authMessage = document.getElementById("authMessage");

async function handleAuth(endpoint) {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        authMessage.textContent = "Please enter both username and password.";
        authMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            authMessage.style.color = "green";
            authMessage.textContent = result.message;
            
            if (endpoint === "/api/login") {
                localStorage.setItem("currentUser", result.username);
                setTimeout(() => window.location.href = "/", 1000);
            }
        } else {
            authMessage.style.color = "red";
            authMessage.textContent = result.error;
        }
    } catch (error) {
        console.error(error);
        authMessage.style.color = "red";
        authMessage.textContent = "Server error. Please try again.";
    }
}

loginBtn.addEventListener("click", () => handleAuth("/api/login"));
signupBtn.addEventListener("click", () => handleAuth("/api/signup"));