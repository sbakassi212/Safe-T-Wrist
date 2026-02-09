const token = localStorage.getItem("token");

fetch("/api/test",{
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
        //affichage du json dans la console
        console.log("Réponse API :");
        console.log(data.message);
        console.log(data.nombre);

        //affichage du json dans la div
        let uneDiv = document.getElementById("maDiv1");
        uneDiv.innerHTML = `<p>Message : ${data.message}</p>
                        <p>Nombre : ${data.nombre}</p>`;
    })
    .catch(err => console.error("Erreur API :", err));


document.getElementById("MonBouton").addEventListener("click", (e) => {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
    })
        .then(res => res.json())
        .then(data => {
            console.log("Réponse API login :", data);
            let uneDiv = document.getElementById("maDiv1");
            uneDiv.innerHTML = `<p>Message : ${data.message}</p>
                        <p>Token : ${data.token}</p>`;

            if (data.token) {
                // 👉 On sauvegarde le token en local
                localStorage.setItem("token", data.token);
            }

        })
        .catch(err => console.error(err));

})