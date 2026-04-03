import React from "react";
import Sidebar from "./Sidebar";
import "./legal.css"; 

const MentionsLegales = () => {
    return (
        <div className="dashboard-layout"> {/* Même classe que ton Dashboard CSS */}
            <Sidebar />
            
            <div className="dashboard-content"> {/* Le margin-left de 260px s'applique ici */}
                <div className="dashboard-header">
                    <h1>Mentions Légales & RGPD</h1>
                    <p>Protection de vos données de santé Safe-T-Wrist.</p>
                </div>

                <div className="mentions-box">
                    <section className="legal-section">
                        <h2>1. Édition du projet</h2>
                        <p>Ce système est un prototype de surveillance médicale connectée.</p>
                        <p><strong>Responsable :</strong> Équipe Projet Safe-T-Wrist</p>
                    </section>

                    <div className="automation-banner"> {/* Réutilisation du style bleu du dashboard */}
                        <div className="status-label">
                            <span className="status-icon">🛡️</span>
                            <div>
                                <h4>Confidentialité des données</h4>
                                <p>Vos données cardiaques (BPM) sont cryptées et accessibles uniquement via votre Token sécurisé.</p>
                            </div>
                        </div>
                    </div>

                    <section className="legal-section">
                        <h2>2. Droits d'accès</h2>
                        <p>Conformément à la loi, vous disposez d'un droit d'accès et de suppression de vos informations de santé enregistrées en base de données.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MentionsLegales;