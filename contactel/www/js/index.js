// Attendre que Cordova soit complètement chargé
document.addEventListener('deviceready', onDeviceReady, false);

// État global de l'application
const app = {
    contacts: [],
    currentContactId: null,
    isReady: false
};

// Initialisation après le chargement de Cordova
function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
    // Marquer l'application comme prête
    app.isReady = true;
    
    // Ajouter les écouteurs d'événements pour la plateforme mobile
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
    document.addEventListener('backbutton', onBackButton, false);
    
    // Charger les contacts depuis le stockage local
    loadContacts();
    
    // Initialiser les gestionnaires d'événements
    initEventListeners();
    
    // Générer l'index alphabétique
    generateAlphabetIndex();
}

// Gérer l'événement pause (application en arrière-plan)
function onPause() {
    console.log('Application mise en pause');
    // Sauvegarder l'état si nécessaire
    saveContacts();
}

// Gérer l'événement resume (retour au premier plan)
function onResume() {
    console.log('Application reprise');
    // Rafraîchir les données si nécessaire
    loadContacts();
}

// Gérer le bouton retour sur Android
function onBackButton(e) {
    // Si une modal est ouverte, la fermer au lieu de quitter l'application
    if (document.getElementById('contactModal').style.display === 'block') {
        closeModal('contactModal');
        e.preventDefault();
        return false;
    }
    
    if (document.getElementById('deleteModal').style.display === 'block') {
        closeModal('deleteModal');
        e.preventDefault();
        return false;
    }
    
    // Sinon, confirmer la sortie de l'application
    if (confirm('Voulez-vous quitter l\'application ?')) {
        navigator.app.exitApp();
    } else {
        e.preventDefault();
        return false;
    }
}

// Charger les contacts depuis le stockage local
function loadContacts() {
    const savedContacts = localStorage.getItem('contacts');
    app.contacts = savedContacts ? JSON.parse(savedContacts) : [];
    
    // Trier les contacts par nom
    app.contacts.sort((a, b) => {
        const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
        const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    // Afficher les contacts
    displayContacts();
}

// Enregistrer les contacts dans le stockage local
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(app.contacts));
}

// Afficher les contacts dans la liste
function displayContacts(filteredContacts = null) {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';
    
    const contactsToDisplay = filteredContacts || app.contacts;
    
    if (contactsToDisplay.length === 0) {
        contactList.innerHTML = '<li class="contact-item">Aucun contact trouvé</li>';
        return;
    }
    
    contactsToDisplay.forEach(contact => {
        const contactItem = document.createElement('li');
        contactItem.className = 'contact-item';
        contactItem.dataset.id = contact.id;
        
        contactItem.innerHTML = `
            <div class="contact-info">
                <div class="contact-name">${contact.nom} ${contact.prenom}</div>
                <div class="contact-phone">${contact.telephone}</div>
            </div>
            <div class="contact-actions">
                <button class="action-btn call-btn" data-id="${contact.id}">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${contact.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${contact.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        contactList.appendChild(contactItem);
    });
    
    // Ajouter les gestionnaires d'événements aux boutons d'action
    document.querySelectorAll('.call-btn').forEach(btn => {
        btn.addEventListener('click', handleCall);
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// Initialiser les gestionnaires d'événements
function initEventListeners() {
    // Bouton d'ajout de contact
    document.getElementById('addContactBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Ajouter un contact';
        document.getElementById('contactId').value = '';
        document.getElementById('contactForm').reset();
        openModal('contactModal');
    });
    
    // Fermeture des modals
    document.getElementById('closeModal').addEventListener('click', () => {
        closeModal('contactModal');
    });
    
    document.getElementById('closeDeleteModal').addEventListener('click', () => {
        closeModal('deleteModal');
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModal('contactModal');
    });
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        closeModal('deleteModal');
    });
    
    // Soumission du formulaire de contact
    document.getElementById('contactForm').addEventListener('submit', handleContactFormSubmit);
    
    // Confirmation de suppression
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    
    // Recherche
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Utilisation de FastClick pour éliminer le délai de 300ms sur les appareils mobiles
    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof FastClick !== 'undefined') {
                FastClick.attach(document.body);
            }
        }, false);
    }
}

// Générer l'index alphabétique
function generateAlphabetIndex() {
    const alphabetIndex = document.getElementById('alphabetIndex');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < alphabet.length; i++) {
        const letter = document.createElement('div');
        letter.className = 'letter';
        letter.textContent = alphabet[i];
        letter.addEventListener('click', () => filterByLetter(alphabet[i]));
        alphabetIndex.appendChild(letter);
    }
}

// Filtrer les contacts par lettre
function filterByLetter(letter) {
    document.querySelectorAll('.letter').forEach(el => {
        el.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    const filteredContacts = app.contacts.filter(contact => {
        const firstLetter = contact.nom.charAt(0).toUpperCase();
        return firstLetter === letter;
    });
    
    displayContacts(filteredContacts);
}

// Gérer la soumission du formulaire de contact
function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const contactId = document.getElementById('contactId').value;
    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!nom || !prenom || !telephone) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (contactId) {
        // Modification d'un contact existant
        const contactIndex = app.contacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
            app.contacts[contactIndex] = {
                id: contactId,
                nom,
                prenom,
                telephone,
                email
            };
        }
    } else {
        // Ajout d'un nouveau contact
        const newContact = {
            id: Date.now().toString(),
            nom,
            prenom,
            telephone,
            email
        };
        app.contacts.push(newContact);
    }
    
    // Enregistrer et actualiser
    saveContacts();
    loadContacts();
    closeModal('contactModal');
}

// Gérer l'appel d'un contact
function handleCall(event) {
    const contactId = event.currentTarget.dataset.id;
    const contact = app.contacts.find(c => c.id === contactId);
    
    if (contact) {
        // Utiliser le plugin cordova pour appeler (plus fiable que l'URL tel:)
        if (app.isReady && typeof navigator.tel !== 'undefined' && navigator.tel.dial) {
            navigator.tel.dial(contact.telephone, 
                function() { console.log('Appel réussi'); },
                function() { console.log('Échec de l\'appel'); }
            );
        } else {
            // Fallback sur la méthode standard
            window.location.href = `tel:${contact.telephone}`;
        }
    }
}

// Gérer la modification d'un contact
function handleEdit(event) {
    const contactId = event.currentTarget.dataset.id;
    const contact = app.contacts.find(c => c.id === contactId);
    
    if (contact) {
        document.getElementById('modalTitle').textContent = 'Modifier le contact';
        document.getElementById('contactId').value = contact.id;
        document.getElementById('nom').value = contact.nom;
        document.getElementById('prenom').value = contact.prenom;
        document.getElementById('telephone').value = contact.telephone;
        document.getElementById('email').value = contact.email || '';
        
        openModal('contactModal');
    }
}

// Gérer la suppression d'un contact
function handleDelete(event) {
    const contactId = event.currentTarget.dataset.id;
    app.currentContactId = contactId;
    
    openModal('deleteModal');
}

// Confirmer la suppression d'un contact
function confirmDelete() {
    if (app.currentContactId) {
        app.contacts = app.contacts.filter(c => c.id !== app.currentContactId);
        saveContacts();
        loadContacts();
        closeModal('deleteModal');
        app.currentContactId = null;
    }
}

// Gérer la recherche de contacts
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        loadContacts();
        return;
    }
    
    const filteredContacts = app.contacts.filter(contact => {
        const fullName = `${contact.nom} ${contact.prenom}`.toLowerCase();
        const phone = contact.telephone.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        
        return fullName.includes(searchTerm) || 
               phone.includes(searchTerm) || 
               email.includes(searchTerm);
    });
    
    displayContacts(filteredContacts);
}

// Ouvrir une modal avec animation
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Animation facultative
    setTimeout(() => {
        modal.querySelector('.modal-content').style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 10);
}

// Fermer une modal avec animation
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    
    // Animation de fermeture
    const content = modal.querySelector('.modal-content');
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px)';
    
    // Attendre la fin de l'animation avant de cacher la modal
    setTimeout(() => {
        modal.style.display = 'none';
        // Réinitialiser les styles pour la prochaine ouverture
        content.style.opacity = '';
        content.style.transform = '';
    }, 300);
}