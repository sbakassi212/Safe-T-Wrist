// C'est l'adresse de ton serveur Node.js (le backend)
const API_BASE_URL = "http://172.29.19.44:3000/api";

/**
 * Requête POST générique
 */
async function postData(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

  if (!response.ok) {
      // On récupère le message d'erreur du serveur s'il existe (ex: "Email déjà utilisé")
      throw new Error(result.error || result.message || `Erreur HTTP ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error("Détail de l'erreur réseau:", error);
    // Ce message s'affichera si le serveur est éteint ou l'IP injoignable
    throw new Error("Serveur injoignable (Vérifiez la VM et le port 3000)");
  }
}

/**
 * Requête GET générique
 */
async function getData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur GET:", error);
    throw error;
  }
}

async function login(event) {
  if (event) event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

try {
    const email = document.getElementById("email").value; 
    const result = await postData("/auth/login", { email, password });

    // Stockage des informations pour le dashboard
    localStorage.setItem('token', result.token);
    localStorage.setItem('id_bracelet', result.user.id_bracelet);

    // Affichage du succès
    message.style.color = "lightgreen";
    message.textContent = result.message || "Connexion réussie";

    // Redirection vers le tableau de bord après un court délai
    setTimeout(() => {
      window.location.href = "../html/dashboard.html";
    }, 800);

  } catch (error) {
    // Gestion de l'erreur (si le serveur répond 401 ou est éteint)
    message.style.color = "#ff4b5c";
    message.textContent = error.message;
  }
}

async function register(event) {
  if (event) event.preventDefault();
  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("message");

  // On vérifie si les deux mots de passe sont identiques avant d'envoyer
  if (password !== confirmPassword) {
    message.style.color = "#ff4b5c";
    message.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  try {
const result = await postData("/auth/register", { 
    email, 
    password, 
    nom: `${prenom} ${nom}` 
});
    message.style.color = "lightgreen";
    message.textContent = result.message || "Inscription réussie";
    // Redirection automatique après 2 secondes
setTimeout(() => {
window.location.href = "../html/connection.html";
}, 2000);

  } catch (error) {
    message.style.color = "#ff4b5c";
    message.textContent = error.message;
  }
}