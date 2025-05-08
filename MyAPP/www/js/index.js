window.onload = function() {
    const imcButton = document.querySelector('button');
    imcButton.onclick = function() {
       const poids = document.querySelector('#Poids');
       const taille = document.querySelector('#Hauteur');
       const imc = poids.value / Math.pow(taille.value, 2);
       let interpretation = 'Vous etes ';
    }
    if(imc < 18.5){
        interpretation += 'sous-poids';
    }
    else if(imc < 24.9){
        interpretation += 'sain';
    }
    else if(imc < 29.9){
        interpretation += 'surs-poids';
    }
    else{
        interpretation += 'obes';
    }
    const resultatBox = document.querySelector('#result');
    resultatBox.innerHTML = `votre IMC est de ${imc} <hr> ${interpretation}`;
    hideButton();
    
}

function hideButton(){
    imcButton.style.display = 'none';
    imcButton.style.display = 'block';

    
}   
