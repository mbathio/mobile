document.addEventListener('deviceready', onDeviceReady, false);

// Fallback pour les tests dans un navigateur
document.addEventListener('DOMContentLoaded', function() {
    if (typeof cordova === 'undefined') {
        onDeviceReady();
    }
});

function onDeviceReady() {
    console.log('Application IMC prête!');
    // Attacher l'événement au bouton
    document.getElementById('calculButton').addEventListener('click', calculerIMC);
}

function calculerIMC() {
    const poids = parseFloat(document.getElementById('poids').value);
    const taille = parseFloat(document.getElementById('taille').value);
    const resultatDiv = document.getElementById('resultat');

    if (isNaN(poids) || isNaN(taille) || poids <= 0 || taille <= 0) {
        resultatDiv.innerHTML = '<p style="color: red;">Veuillez entrer des valeurs valides</p>';
        return;
    }

    const imc = poids / (taille * taille);
    let interpretation = '';
    let couleur = '';

    if (imc < 18.5) {
        interpretation = 'Insuffisance pondérale';
        couleur = '#2196F3';
    } else if (imc < 25) {
        interpretation = 'Poids normal';
        couleur = '#4CAF50';
    } else if (imc < 30) {
        interpretation = 'Surpoids';
        couleur = '#FFC107';
    } else {
        interpretation = 'Obésité';
        couleur = '#F44336';
    }

    resultatDiv.innerHTML = `
        <div style="background-color: ${couleur}20; padding: 15px; border-radius: 4px;">
            <p>Votre IMC est : <strong>${imc.toFixed(1)}</strong></p>
            <p>Interprétation : <strong>${interpretation}</strong></p>
        </div>
    `;
}