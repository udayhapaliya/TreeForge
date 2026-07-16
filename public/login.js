const API = "http://localhost:3000/api/v1/users";

const loginForm = document.getElementById("loginForm");
const authError = document.getElementById("authError");


(async function checkExistingSession() {
    try {
        const res = await fetch(`${API}/current-user`, {
            credentials: "include"
        });

        if (res.ok) {
            window.location.href = "tree.html";
        }
    }
    catch (err) {
        console.log(err.message);
    }
})();

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.textContent = "";

    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!identifier || !password) {
        authError.textContent = "Please fill in all fields";
        return;
    }

    const isEmail = identifier.includes("@");

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(
                isEmail
                    ? { email: identifier, password }
                    : { username: identifier, password }
            )
        });

        const data = await res.json();

        if (!res.ok) {
            authError.textContent = data.message || "Login failed";
            return;
        }

        window.location.href = "tree.html";
    }
    catch (err) {
        authError.textContent = "Something went wrong. Please try again.";
    }
});
