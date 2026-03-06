const API_BASE_URL = "http://172.29.18.99:3000/api";

async function login(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageElem = document.getElementById('message');

    try {
        messageElem.style.color = "orange";
        messageElem.innerText = "Vérification...";

        // Appel API (Route : /auth/login)
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // SAUVEGARDE DANS LOCALSTORAGE
            localStorage.setItem('token', data.token);              // Le jeton de sécurité
            localStorage.setItem('user_nom', data.user.nom);        // Nom affiché sur l'accueil
            localStorage.setItem('user_role', data.user.role);      // Son rôle
            localStorage.setItem('id_bracelet', data.user.id_bracelet || "");

            messageElem.style.color = "lightgreen";
            messageElem.innerText = "Connexion réussie !";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            // Affichage de l'erreur envoyée par le serveur (ex: "Email ou mot de passe incorrect")
            messageElem.style.color = "red";
            messageElem.innerText = data.error;
        }
    } catch (error) {
        console.error("Erreur:", error);
        messageElem.style.color = "red";
        messageElem.innerText = "Serveur injoignable.";
    }
}