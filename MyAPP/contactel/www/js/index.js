document.addEventListener('deviceready', onDeviceReady, false);

// État global de l'application
const app = {
    contacts: [],
    currentContactId: null
};

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
    // Charger les contacts depuis le stockage local
    loadContacts();
    
    // Initialiser les gestionnaires d'événements
    initEventListeners();
    
    // Générer l'index alphabétique
    generateAlphabetIndex();
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
        window.location.href = `tel:${contact.telephone}`;
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

// Ouvrir une modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Fermer une modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}