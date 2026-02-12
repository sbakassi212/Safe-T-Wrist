// URL de l'API backend
const API_BASE_URL = "http://localhost:3000/api";

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

    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Erreur HTTP ${response.status}`);
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

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const result = await postData("/login", { username, password });
    message.style.color = "lightgreen";
    message.textContent = result.message || "Connexion réussie";
    
    // Redirection vers la page d'accueil (tableau de bord) 
    setTimeout(() => {
      window.location.href = "../html/dashboard.html";
    }, 800);

  } catch (error) {
    message.style.color = "#ff4b5c";
    message.textContent = error.message;
  }
}

async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message");

  try {
   const result = await postData("/register", { username, email, password });
    message.style.color = "lightgreen";
    message.textContent = result.message || "Inscription réussie";

  } catch (error) {
    message.style.color = "#ff4b5c";
    message.textContent = error.message;
  }
}
