const API_BASE_URL = "http://172.29.18.99:3000/api";

async function register(event) {
    if (event) event.preventDefault();

    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const messageElem = document.getElementById('message');

    // 1. Validation locale
    if (password !== confirmPassword) {
        messageElem.style.color = "red";
        messageElem.innerText = "Les mots de passe ne correspondent pas !";
        return;
    }

    try {
        // 2. Feedback visuel (Orange)
        messageElem.innerText = "Inscription en cours...";
        messageElem.style.color = "orange";

        // 3. Appel API (Route : /auth/register)
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email,
                password: password,
                nom: `${prenom} ${nom}`, // Fusion pour correspondre à la colonne 'nom' du serveur
                role: 'PROCHE'           // Rôle par défaut selon ton server.js
            })
        });

        const data = await response.json();

        // 4. Vérification de la réponse (response.ok car le serveur renvoie 201)
        if (response.ok) {
            messageElem.style.color = "#28a745"; // Vert
            messageElem.innerText = "Utilisateur créé ! Redirection vers la connexion...";
            
            setTimeout(() => {
                window.location.href = "connexion.html";
            }, 2000);
        } else {
            // Le serveur renvoie { error: "..." }
            messageElem.style.color = "red";
            messageElem.innerText = data.error || "Erreur lors de l'inscription";
        }
    } catch (error) {
        console.error("Erreur:", error);
        messageElem.style.color = "red";
        messageElem.innerText = "Le serveur ne répond pas.";
    }
}