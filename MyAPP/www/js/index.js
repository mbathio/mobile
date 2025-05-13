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
    let statut = '';
    let classeStatut = '';
    let pointerPosition = 0;

    if (imc < 18.5) {
        statut = 'Insuffisance';
        classeStatut = 'underweight';
        pointerPosition = (imc / 18.5) * 25; // Position relative pour la catégorie insuffisance
    } else if (imc < 25) {
        statut = 'Normal';
        classeStatut = 'normal';
        pointerPosition = 25 + ((imc - 18.5) / 6.5) * 25; // Position relative pour la catégorie normale
    } else if (imc < 30) {
        statut = 'Surpoids';
        classeStatut = 'overweight';
        pointerPosition = 50 + ((imc - 25) / 5) * 25; // Position relative pour la catégorie surpoids
    } else {
        statut = 'Obésité';
        classeStatut = 'obese';
        pointerPosition = 75 + Math.min(((imc - 30) / 5) * 25, 25); // Position relative pour la catégorie obésité
    }

    // Limiter la position du pointeur entre 0 et 100%
    pointerPosition = Math.max(0, Math.min(pointerPosition, 100));

    resultatDiv.innerHTML = `
        <div class="result-title">Votre IMC est...</div>
        <div class="bmi-value">${imc.toFixed(1)}</div>
        <div class="status ${classeStatut}">${statut}</div>
        
        <div class="bmi-scale">
            <div class="bmi-pointer" style="left: ${pointerPosition}%;"></div>
        </div>
        
        <div class="bmi-categories">
            <div class="category">
                <div class="category-label">Insuffisance</div>
                <div class="category-range">&lt;18.5</div>
            </div>
            <div class="category">
                <div class="category-label">Normal</div>
                <div class="category-range">18.5-24.9</div>
            </div>
            <div class="category">
                <div class="category-label">Surpoids</div>
                <div class="category-range">25-29.9</div>
            </div>
            <div class="category">
                <div class="category-label">Obésité</div>
                <div class="category-range">&gt;30</div>
            </div>
        </div>
        
        <button class="btn-save">SAVE</button>
    `;
    
    // Ajouter l'événement pour le bouton Save
    resultatDiv.querySelector('.btn-save').addEventListener('click', function() {
        // Ici, vous pourriez implémenter la fonctionnalité de sauvegarde
        alert('IMC sauvegardé: ' + imc.toFixed(1));
    });
}