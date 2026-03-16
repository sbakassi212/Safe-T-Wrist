document.addEventListener('DOMContentLoaded', () => {
    
    // 1. SÉLECTION DES ÉLÉMENTS
    const formContainer = document.getElementById('addContactForm');
    const formElement = formContainer.querySelector('form');
    const contactsGrid = document.querySelector('.contacts-grid');

    // 2. CHARGEMENT INITIAL (Lecture de la mémoire au démarrage)
    function chargerContacts() {
        const liste = JSON.parse(localStorage.getItem('mediwatch_contacts')) || [];
        contactsGrid.innerHTML = ''; 
        liste.forEach(c => {
            const carte = creerCarteContact(c.id, c.prenom, c.nom, c.tel || "", c.email || "", c.relation || "Famille");
            contactsGrid.appendChild(carte);
        });
    }

    // 3. FONCTION POUR AFFICHER/CACHER LE FORMULAIRE D'AJOUT
    window.toggleAddForm = function() {
        if (formContainer.style.display === 'none' || formContainer.style.display === '') {
            formContainer.style.display = 'block';
        } else {
            formContainer.style.display = 'none';
        }
    };

    // 4. FONCTION POUR GÉNÉRER LE HTML D'UNE CARTE
    function creerCarteContact(id, prenom, nom, tel, email, relation) {
        const initiales = ((prenom ? prenom[0] : '') + (nom ? nom[0] : '')).toUpperCase() || "??";
        const card = document.createElement('div');
        card.className = 'contact-card priority-2';
        card.setAttribute('data-id', id.toString()); // On force l'ID en texte pour la comparaison

        card.innerHTML = `
            <form>
                <div class="contact-header">
                    <div class="contact-avatar">${initiales}</div>
                    <div class="contact-info">
                        <input type="text" class="input-nom" value="${prenom} ${nom}" style="font-weight: bold; border: none; background: transparent; font-size: 1.125rem; width: 100%;">
                        <select class="select-relation" style="border: none; background: transparent; color: #666; font-size: 0.85rem;">
                            <option ${relation === 'Famille' ? 'selected' : ''}>Famille</option>
                            <option ${relation === 'Médecin' ? 'selected' : ''}>Médecin</option>
                            <option ${relation === 'Autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>
                    <div class="priority-badge priority-2">P2</div>
                </div>
                <div class="contact-details">
                    <div class="form-group" style="margin-bottom: 0.5rem;">
                        <label style="font-size: 0.75rem;">Téléphone</label>
                        <input type="tel" class="input-tel" value="${tel}">
                    </div>
                    <div class="form-group" style="margin-bottom: 0.5rem;">
                        <label style="font-size: 0.75rem;">Email</label>
                        <input type="email" class="input-email" value="${email}">
                    </div>
                </div>
                <div class="contact-actions">
                    <button type="button" class="btn-icon save-btn" title="Enregistrer">💾</button>
                    <button type="button" class="btn-icon delete-btn danger" title="Supprimer">🗑️</button>
                </div>
            </form>
        `;
        return card;
    }

    // 5. GÉRER L'AJOUT D'UN NOUVEAU CONTACT
    formElement.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = formElement.querySelectorAll('input');
        const prenom = inputs[0].value;
        const nom = inputs[1].value;
        const idUnique = Date.now().toString();

        const nouveauContact = {
            id: idUnique,
            prenom: prenom,
            nom: nom,
            tel: "",
            email: "",
            relation: "Famille"
        };

        // Sauvegarde LocalStorage
        const liste = JSON.parse(localStorage.getItem('mediwatch_contacts')) || [];
        liste.push(nouveauContact);
        localStorage.setItem('mediwatch_contacts', JSON.stringify(liste));

        // Ajout Visuel
        const nouvelleCarte = creerCarteContact(idUnique, prenom, nom, "", "", "Famille");
        contactsGrid.appendChild(nouvelleCarte);

        formElement.reset();
        window.toggleAddForm();
    });

    // 6. GESTION DES ACTIONS (SUPPRIMER ET SAUVEGARDER)
    contactsGrid.addEventListener('click', (e) => {
        
        // --- LOGIQUE SUPPRIMER ---
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const card = deleteBtn.closest('.contact-card');
            const idASupprimer = card.getAttribute('data-id');

            if (confirm("Voulez-vous vraiment supprimer ce contact ?")) {
                // 1. Retrait du LocalStorage
                let liste = JSON.parse(localStorage.getItem('mediwatch_contacts')) || [];
                liste = liste.filter(c => c.id.toString() !== idASupprimer);
                localStorage.setItem('mediwatch_contacts', JSON.stringify(liste));

                // 2. Retrait du DOM (Visuel)
                card.remove();
                console.log("Contact supprimé :", idASupprimer);
            }
            return;
        }

        // --- LOGIQUE SAUVEGARDER ---
        const saveBtn = e.target.closest('.save-btn');
        if (saveBtn) {
            const card = saveBtn.closest('.contact-card');
            const idAModifier = card.getAttribute('data-id');

            const updatedData = {
                nomComplet: card.querySelector('.input-nom').value,
                tel: card.querySelector('.input-tel').value,
                email: card.querySelector('.input-email').value,
                relation: card.querySelector('.select-relation').value
            };

            let liste = JSON.parse(localStorage.getItem('mediwatch_contacts')) || [];
            const index = liste.findIndex(c => c.id.toString() === idAModifier);

            if (index !== -1) {
                liste[index].nom = updatedData.nomComplet;
                liste[index].prenom = ""; // On fusionne dans le champ nom pour simplifier
                liste[index].tel = updatedData.tel;
                liste[index].email = updatedData.email;
                liste[index].relation = updatedData.relation;

                localStorage.setItem('mediwatch_contacts', JSON.stringify(liste));
                
                // Feedback visuel
                saveBtn.textContent = "✅";
                setTimeout(() => { saveBtn.textContent = "💾"; }, 1000);
            }
        }
    });

    // Lancement automatique
    chargerContacts();
});