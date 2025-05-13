document.addEventListener('DOMContentLoaded', function() {
    // Création du formulaire HTML
    document.body.innerHTML = `
        <div class="container">
            <h1>Calculateur d'IMC</h1>
            <div class="form-group">
                <label for="poids">Poids (kg):</label>
                <input type="number" id="poids" class="form-control" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="taille">Taille (m):</label>
                <input type="number" id="taille" class="form-control" step="0.01" required>
            </div>
            <button onclick="calculerIMC()" class="btn-calcul">Calculer</button>
            <div id="resultat"></div>
        </div>
    `;

    // Ajout du style CSS
    const style = document.createElement('style');
    style.textContent = `
        .container {
            max-width: 500px;
            margin: 20px auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-control {
            width: 100%;
            padding: 8px;
            margin-top: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn-calcul {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        #resultat {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
});

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