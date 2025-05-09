window.onload = function() {
    const imcButton = document.querySelector('button');
    imcButton.onclick = function(e) {
        e.preventDefault(); // Empêcher le rechargement de la page
        const poids = document.querySelector('#Poids');
        const taille = document.querySelector('#Hauteur');
        
        // Vérifier que les valeurs sont renseignées
        if(!poids.value || !taille.value) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        // Convertir la taille de cm en m
        const tailleEnMetres = taille.value / 100;
        
        // Calculer l'IMC
        const imc = (poids.value / Math.pow(tailleEnMetres, 2)).toFixed(1);
        
        // Déterminer l'interprétation
        let interpretation = 'Vous êtes ';
        
        if(imc < 18.5){
            interpretation += 'en sous-poids';
        }
        else if(imc < 24.9){
            interpretation += 'de poids normal';
        }
        else if(imc < 29.9){
            interpretation += 'en surpoids';
        }
        else{
            interpretation += 'en situation d\'obésité';
        }
        
        // Afficher le résultat
        const resultatBox = document.querySelector('#result');
        resultatBox.innerHTML = `Votre IMC est de ${imc} <hr> ${interpretation}`;
        
        // Afficher/masquer le bouton si nécessaire
        toggleButton();
    };
};

function toggleButton(){
    const imcButton = document.querySelector('button');
    // Si vous souhaitez cacher puis réafficher le bouton
    if(imcButton.style.display === 'none') {
        imcButton.style.display = 'block';
    } else {
        imcButton.style.display = 'block'; // Maintenir le bouton visible
    }
}