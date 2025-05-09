// Attendre que le document soit chargé
document.addEventListener('DOMContentLoaded', onDocumentReady, false);

// Pour les appareils mobiles, attendre également l'événement deviceready
document.addEventListener('deviceready', onDeviceReady, false);

// État de l'application
const app = {
    isDeviceReady: false,
    isDOMReady: false
};

// Initialisation après chargement du DOM
function onDocumentReady() {
    app.isDOMReady = true;
    console.log('DOM chargé et prêt');
    initApp();
}

// Initialisation après chargement de Cordova
function onDeviceReady() {
    app.isDeviceReady = true;
    console.log('Cordova prêt: ' + cordova.platformId + '@' + cordova.version);
    
    // Ajouter les écouteurs d'événements pour la plateforme mobile
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
    document.addEventListener('backbutton', onBackButton, false);
    
    initApp();
}

// Initialiser l'application si toutes les conditions sont remplies
function initApp() {
    // Sur navigateur, nous n'avons pas besoin d'attendre deviceready
    if (app.isDOMReady && (app.isDeviceReady || !window.cordova)) {
        initEventListeners();
    }
}

// Gérer l'événement pause (application en arrière-plan)
function onPause() {
    console.log('Application mise en pause');
    // Sauvegarder l'état si nécessaire
}

// Gérer l'événement resume (retour au premier plan)
function onResume() {
    console.log('Application reprise');
    // Rafraîchir l'interface si nécessaire
}

// Gérer le bouton retour sur Android
function onBackButton(e) {
    // Confirmer la sortie de l'application
    if (confirm('Voulez-vous quitter l\'application ?')) {
        navigator.app.exitApp();
    } else {
        e.preventDefault();
        return false;
    }
}

// Initialiser tous les écouteurs d'événements
function initEventListeners() {
    const imcForm = document.querySelector('form');
    
    imcForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Empêcher le rechargement de la page
        calculerIMC();
    });
    
    // Ajouter des validateurs en temps réel
    const poidsInput = document.querySelector('#Poids');
    const tailleInput = document.querySelector('#Hauteur');
    
    poidsInput.addEventListener('input', validateInput);
    tailleInput.addEventListener('input', validateInput);
}

// Valider les entrées pour éviter les valeurs absurdes
function validateInput(e) {
    const input = e.target;
    const value = parseFloat(input.value);
    
    if (input.id === 'Poids') {
        // Valider le poids (entre 20 et 500 kg)
        if (value < 20 || value > 500) {
            input.setCustomValidity('Le poids doit être entre 20 et 500 kg');
        } else {
            input.setCustomValidity('');
        }
    } else if (input.id === 'Hauteur') {
        // Valider la taille (entre 50 et 250 cm)
        if (value < 50 || value > 250) {
            input.setCustomValidity('La taille doit être entre 50 et 250 cm');
        } else {
            input.setCustomValidity('');
        }
    }
    
    // Afficher les messages de validation du navigateur
    input.reportValidity();
}

// Calculer l'IMC et afficher le résultat
function calculerIMC() {
    const poids = document.querySelector('#Poids');
    const taille = document.querySelector('#Hauteur');
    const resultatBox = document.querySelector('#result');
    
    // Vérifier que les valeurs sont renseignées
    if(!poids.value || !taille.value) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Convertir en nombres
    const poidsValue = parseFloat(poids.value);
    const tailleValue = parseFloat(taille.value);
    
    // Validation supplémentaire
    if (poidsValue <= 0 || tailleValue <= 0) {
        alert('Les valeurs doivent être positives');
        return;
    }
    
    // Convertir la taille de cm en m
    const tailleEnMetres = tailleValue / 100;
    
    // Calculer l'IMC
    const imc = (poidsValue / Math.pow(tailleEnMetres, 2)).toFixed(1);
    
    // Déterminer l'interprétation et la classe CSS
    let interpretation = 'Vous êtes ';
    let cssClass = '';
    
    if(imc < 18.5){
        interpretation += 'en sous-poids';
        cssClass = 'sous-poids';
    }
    else if(imc < 24.9){
        interpretation += 'de poids normal';
        cssClass = 'poids-normal';
    }
    else if(imc < 29.9){
        interpretation += 'en surpoids';
        cssClass = 'surpoids';
    }
    else{
        interpretation += 'en situation d\'obésité';
        cssClass = 'obesite';
    }
    
    // Afficher le résultat avec un peu d'animation
    resultatBox.innerHTML = '';
    
    // Créer les éléments pour le résultat
    const imcValue = document.createElement('div');
    imcValue.textContent = `Votre IMC est de ${imc}`;
    imcValue.className = 'imc-value';
    
    const separator = document.createElement('hr');
    
    const imcInterpretation = document.createElement('div');
    imcInterpretation.textContent = interpretation;
    imcInterpretation.className = 'imc-interpretation ' + cssClass;
    
    // Ajouter un peu d'animation
    resultatBox.style.opacity = '0';
    resultatBox.appendChild(imcValue);
    resultatBox.appendChild(separator);
    resultatBox.appendChild(imcInterpretation);
    
    // Animation de fondu
    setTimeout(() => {
        resultatBox.style.transition = 'opacity 0.5s ease-in';
        resultatBox.style.opacity = '1';
    }, 10);
    
    // Ajouter des détails sur la catégorie
    ajouterDetailsIMC(imc, resultatBox);
    
    // Vibrer pour donner un feedback tactile (si disponible)
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// Ajouter des détails supplémentaires sur la catégorie d'IMC
function ajouterDetailsIMC(imc, container) {
    const details = document.createElement('div');
    details.className = 'imc-details';
    
    let message = '';
    
    if(imc < 18.5){
        message = 'Un IMC inférieur à 18.5 indique une insuffisance pondérale. Consultez un professionnel de santé pour des conseils adaptés.';
    }
    else if(imc < 24.9){
        message = 'Un IMC entre 18.5 et 24.9 est considéré comme normal. Continuez à maintenir un mode de vie sain.';
    }
    else if(imc < 29.9){
        message = 'Un IMC entre 25 et 29.9 indique un surpoids. Envisagez d\'augmenter votre activité physique et d\'équilibrer votre alimentation.';
    }
    else{
        message = 'Un IMC de 30 ou plus indique une obésité. Il est recommandé de consulter un professionnel de santé pour un suivi adapté.';
    }
    
    details.textContent = message;
    
    // Ajouter un petit délai pour l'affichage progressif
    setTimeout(() => {
        container.appendChild(details);
        details.style.maxHeight = '100px';
    }, 500);
}