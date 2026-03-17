const API_URL = "http://172.29.18.254:3000"; 

async function login(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("Merci de remplir tous les champs !");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
         
            localStorage.setItem('user_nom', data.nom);
            localStorage.setItem('user_prenom', data.prenom);
            localStorage.setItem('user_email', email); 
            
            window.location.href = "dashboard.html";
        } else {
            alert("Erreur : " + data.message);
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Le serveur ne répond pas. Vérifie qu'il est lancé sur la VM projet.");
    }
}