document.addEventListener("DOMContentLoaded", () => {
    // 1. Récupération des infos stockées au Login
    const idBracelet = localStorage.getItem('id_bracelet');
    const userName = localStorage.getItem('user_nom');
    
    const setupSection = document.getElementById('setup-section');
    const dataSection = document.getElementById('data-section');

    // 2. Mise à jour de l'identité de Teddy
    if (userName) {
        document.getElementById('user-display-name').textContent = userName;
        document.getElementById('user-initials').textContent = userName.substring(0, 2).toUpperCase();
    }

    // 3. Logique d'affichage (Bracelet ou pas)
    // On vérifie si l'ID est vide ou égal à la chaîne "null"
    if (!idBracelet || idBracelet === "null" || idBracelet === "") {
        setupSection.style.display = "block";
        dataSection.style.display = "none";
    } else {
        setupSection.style.display = "none";
        dataSection.style.display = "block";
        document.getElementById('display-bracelet-id').textContent = `MediWatch : ${idBracelet}`;
    }
});

// Fonction pour lier le bracelet via l'API
async function linkBracelet() {
    const newId = document.getElementById('new-bracelet-id').value.trim();
    const message = document.getElementById('setup-message');
    const email = localStorage.getItem('user_email'); // Assure-toi d'avoir stocké l'email au login

    if (!newId) {
        message.style.color = "#ff4b5c";
        message.textContent = "Veuillez saisir un identifiant.";
        return;
    }

    try {
        // Optionnel : Appel à ton API de liaison si prête
        // await fetch('http://172.29.18.254:3000/api/auth/link-bracelet', { ... });

        localStorage.setItem('id_bracelet', newId);
        message.style.color = "#2ecc71";
        message.textContent = "Bracelet configuré avec succès !";

        setTimeout(() => location.reload(), 1200);
    } catch (error) {
        message.style.color = "#ff4b5c";
        message.textContent = "Erreur de connexion au serveur.";
    }
}