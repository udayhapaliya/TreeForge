const API = "http://localhost:3000/api/v1/users";

const registerForm = document.getElementById("registerForm");
const authError = document.getElementById("authError");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.textContent = "";

    const fullName = document.getElementById("registerFullName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!fullName || !username || !email || !password) {
        authError.textContent = "Please fill in all fields";
        return;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ fullName, username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            authError.textContent = data.message || "Registration failed";
            return;
        }

        window.location.href = "login.html";
    }
    catch (err) {
        authError.textContent = "Something went wrong. Please try again.";
    }
});
