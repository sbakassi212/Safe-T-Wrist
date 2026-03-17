const API_URL = "http://172.29.18.254";

async function register(event) {
    if (event) event.preventDefault();

    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const messageElem = document.getElementById('message');

    if (password !== confirmPassword) {
        messageElem.style.color = "red";
        messageElem.innerText = "Les mots de passe ne correspondent pas !";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, prenom, email, password })
        });

        const data = await response.json();

        if (data.success) {
            messageElem.style.color = "#28a745"; // Vert
            messageElem.innerText = "Inscription réussie ! Redirection vers la page de connexion...";
            
            setTimeout(() => {
                window.location.href = "connexion.html";
            }, 2000);
        } else {
            messageElem.style.color = "red";
            messageElem.innerText = data.message;
        }
    } catch (error) {
        messageElem.style.color = "red";
        messageElem.innerText = "Le serveur ne répond pas.";
    }
}