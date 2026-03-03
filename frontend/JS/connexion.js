// C'est l'adresse de ton serveur Node.js (le backend)
const API_BASE_URL = "http://172.29.18.254:3000/api";

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
        // On récupère l'erreur renvoyée par le serveur (ex: "Email incorrect")
        throw new Error(result.error || result.message || `Erreur HTTP ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error("Erreur POST:", error);
    throw error;
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
  
  const message = document.getElementById("message");
  
  // 1. On récupère les éléments HTML (sans .value au début pour tester s'ils existent)
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");

  // 2. Sécurité : si le script ne trouve pas "email" ou "password", il s'arrête ici
  if (!emailEl || !passwordEl) {
    console.error("ERREUR : L'ID 'email' ou 'password' n'existe pas dans votre HTML.");
    if(message) message.textContent = "Erreur : champs HTML introuvables.";
    return;
  }

  try {
    message.style.color = "orange";
    message.textContent = "Connexion en cours...";

    // 3. Appel au backend avec les valeurs récupérées
    const result = await postData("/auth/login", { 
      email: emailEl.value, 
      password: passwordEl.value 
    }); 

    // 4. SAUVEGARDE dans le navigateur
    localStorage.setItem('token', result.token);
    if (result.user) {
        localStorage.setItem('id_bracelet', result.user.id_bracelet);
        localStorage.setItem('user_nom', result.user.nom);
    }

    message.style.color = "lightgreen";
    message.textContent = "Connexion réussie !";

    // 5. Redirection
    setTimeout(() => {
      // Note : On simplifie le chemin pour tester
      window.location.href = "dashboard.html"; 
    }, 800);

  } catch (error) {
    console.error("Détail erreur connexion:", error);
    message.style.color = "#ff4b5c";
    message.textContent = error.message;
  }
}

/**
 * Fonction d'INSCRIPTION (Register)
 */
async function register(event) { 
  if (event) event.preventDefault(); 
  
  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("message");

  // Vérification des mots de passe
  if (password !== confirmPassword) {
    message.style.color = "#ff4b5c";
    message.textContent = "Les mots de passe ne correspondent pas.";
    return; 
  }

  try {
    // Appel au backend sur la route /auth/register
    const result = await postData("/auth/register", { 
        email, 
        password, 
        nom: `${prenom} ${nom}` 
    });
    
    message.style.color = "lightgreen";
    message.textContent = result.message || "Inscription réussie !";

    // Redirection vers la page de connexion après 2 secondes
    setTimeout(() => {
      window.location.href = "../html/connection.html"; 
    }, 2000);

  } catch (error) {
    message.style.color = "#ff4b5c";
    message.textContent = error.message;
  }
}