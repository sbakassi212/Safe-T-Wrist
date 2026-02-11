<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacts d'urgence - MediWatch</title>
    <link rel="stylesheet" href="../css/acceuil.css">
</head>
<body class="dashboard-page">
    <aside class="sidebar">
        </aside>

    <main class="main-content">
        <header class="top-bar">
            <h1>Contacts d'urgence</h1>
            <div class="user-info">
                <span class="user-name">Jean Dupont</span>
                <div class="user-avatar">JD</div>
            </div>
        </header>

        <div class="dashboard-container">
            <div class="contacts-grid">
                
                <div class="contact-card priority-1" id="contact-1">
                    <form class="contact-form">
                        <div class="contact-header">
                            <div class="contact-avatar">MR</div>
                            <div class="contact-info">
                                <input type="text" value="Marie Rousseau" class="edit-field" disabled>
                                <select class="edit-field" disabled>
                                    <option selected>Fille</option>
                                    <option>Médecin</option>
                                    <option>Ami</option>
                                </select>
                            </div>
                            <div class="priority-badge priority-1">P1</div>
                        </div>

                        <div class="contact-details">
                            <div class="detail-item">
                                <span class="detail-icon">📱</span>
                                <input type="tel" value="+33 6 12 34 56 78" class="edit-field" disabled>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">✉️</span>
                                <input type="email" value="marie.rousseau@email.fr" class="edit-field" disabled>
                            </div>
                        </div>

                        <div class="contact-actions">
                            <button type="button" class="btn-icon edit-btn" onclick="enableEdit(1)">✏️</button>
                            <button type="submit" class="btn-icon save-btn" style="display:none; color: var(--success);">💾</button>
                            <button type="button" class="btn-icon danger">🗑️</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </main>

    <script src="../js/contacts.js"></script>
</body>
</html>