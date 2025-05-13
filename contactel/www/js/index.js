// Attendre que Cordova soit complètement chargé
document.addEventListener('deviceready', onDeviceReady, false);

// État global de l'application
const app = {
    contacts: [],
    recentCalls: [],
    currentContactId: null,
    currentView: 'recents', // 'recents', 'contacts', 'favorites', 'keypad', 'voicemail'
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
    
    // Mettre à jour l'heure dans la barre de statut
    updateStatusBarTime();
    
    // Mettre à jour l'heure toutes les minutes
    setInterval(updateStatusBarTime, 60000);
    
    // Charger les contacts et les appels récents depuis le stockage local
    loadContacts();
    loadRecentCalls();
    
    // Initialiser les gestionnaires d'événements
    initEventListeners();
    
    // Générer l'index alphabétique
    generateAlphabetIndex();
    
    // Afficher la vue initiale (récents par défaut)
    switchView('recents');
}

// Mettre à jour l'heure dans la barre de statut
function updateStatusBarTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.status-bar-time').textContent = `${hours}:${minutes}`;
}

// Gérer l'événement pause (application en arrière-plan)
function onPause() {
    console.log('Application mise en pause');
    // Sauvegarder l'état si nécessaire
    saveContacts();
    saveRecentCalls();
}

// Gérer l'événement resume (retour au premier plan)
function onResume() {
    console.log('Application reprise');
    // Rafraîchir les données si nécessaire
    loadContacts();
    loadRecentCalls();
    updateStatusBarTime();
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
    
    // Si la vue détaillée est ouverte, revenir à la liste
    if (document.getElementById('contactDetailView').style.display === 'flex') {
        document.getElementById('contactDetailView').style.display = 'none';
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
    
    // Si aucun contact n'existe, créer des contacts de démonstration
    if (app.contacts.length === 0) {
        createDemoContacts();
    }
    
    // Trier les contacts par nom
    app.contacts.sort((a, b) => {
        const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
        const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    // Afficher les contacts si on est dans cette vue
    if (app.currentView === 'contacts') {
        displayContacts();
    }
}

// Créer des contacts de démonstration
function createDemoContacts() {
    app.contacts = [
        {
            id: '1',
            nom: 'Francescon',
            prenom: 'Alberto',
            telephone: '+39 351 5289817',
            email: 'alberto@example.com',
            type: 'mobile',
            pays: 'France'
        },
        {
            id: '2',
            nom: 'Kalpi',
            prenom: '',
            telephone: '+39 351 1234567',
            email: 'kalpi@example.com',
            type: 'mobile',
            pays: 'France'
        },
        {
            id: '3',
            nom: 'Kalpi',
            prenom: 'Maman',
            telephone: '+39 351 7654321',
            email: 'maman.kalpi@example.com',
            type: 'mobile',
            pays: 'France'
        },
        {
            id: '4',
            nom: 'Mauro',
            prenom: 'Brini',
            telephone: '+39 351 9876543',
            email: 'brini.mauro@example.com',
            type: 'mobile',
            pays: 'France'
        },
        {
            id: '5',
            nom: 'Enrico',
            prenom: 'Cervo',
            telephone: '+39 351 3456789',
            email: 'cervo.enrico@example.com',
            type: 'mobile',
            pays: 'France'
        },
        {
            id: '6',
            nom: 'Clf Nettoyage',
            prenom: 'Elida',
            telephone: '+39 351 8765432',
            email: 'elida@clfnettoyage.fr',
            type: 'téléphone',
            pays: 'France'
        },
        {
            id: '7',
            nom: '',
            prenom: '',
            telephone: '+39 0437 950437',
            email: '',
            type: 'inconnu',
            pays: 'Paris, France'
        },
        {
            id: '8',
            nom: '',
            prenom: '',
            telephone: '347 4634881',
            email: '',
            type: 'inconnu',
            pays: 'France'
        }
    ];
    saveContacts();
}

// Charger les appels récents depuis le stockage local
function loadRecentCalls() {
    const savedCalls = localStorage.getItem('recentCalls');
    app.recentCalls = savedCalls ? JSON.parse(savedCalls) : [];
    
    // Si aucun appel récent n'existe, créer des appels de démonstration
    if (app.recentCalls.length === 0) {
        createDemoRecentCalls();
    }
    
    // Afficher les appels récents si on est dans cette vue
    if (app.currentView === 'recents') {
        displayRecentCalls();
    }
}

// Créer des appels récents de démonstration
function createDemoRecentCalls() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    app.recentCalls = [
        {
            id: '1',
            contactId: '1', // Alberto Francescon
            date: yesterday,
            duration: '01:04',
            type: 'entrant',
            status: 'répondu',
            count: 4
        },
        {
            id: '2',
            contactId: '2', // Kalpi
            date: yesterday,
            duration: '00:00',
            type: 'sortant',
            status: 'manqué',
            count: 1
        },
        {
            id: '3',
            contactId: null,
            telephone: 'Numéro inconnu',
            type: 'inconnu',
            date: yesterday,
            duration: '00:00',
            status: 'manqué',
            count: 1
        },
        {
            id: '4',
            contactId: null,
            telephone: 'Numéro inconnu',
            type: 'inconnu',
            date: yesterday,
            duration: '00:00',
            status: 'manqué',
            count: 1
        },
        {
            id: '5',
            contactId: '1', // Alberto Francescon
            date: yesterday,
            duration: '00:23',
            type: 'entrant',
            status: 'répondu',
            count: 2
        },
        {
            id: '6',
            contactId: '6', // Elida Clf Nettoyage
            date: yesterday,
            duration: '03:15',
            type: 'sortant',
            status: 'répondu',
            count: 1
        },
        {
            id: '7',
            contactId: '4', // Brini Mauro
            date: yesterday,
            duration: '01:42',
            type: 'entrant',
            status: 'répondu',
            count: 1
        },
        {
            id: '8',
            contactId: '3', // Maman Kalpi
            date: yesterday,
            duration: '05:11',
            type: 'entrant',
            status: 'répondu',
            count: 1
        },
        {
            id: '9',
            contactId: '5', // Cervo Enrico
            date: yesterday,
            duration: '00:47',
            type: 'sortant',
            status: 'répondu',
            count: 1
        },
        {
            id: '10',
            contactId: '7', // +39 0437 950437
            date: yesterday,
            duration: '02:18',
            type: 'entrant',
            status: 'répondu',
            count: 1
        },
        {
            id: '11',
            contactId: '8', // 347 4634881
            date: now,
            duration: '00:00',
            type: 'sortant',
            status: 'annulé',
            count: 1
        }
    ];
    saveRecentCalls();
}

// Enregistrer les contacts dans le stockage local
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(app.contacts));
}

// Enregistrer les appels récents dans le stockage local
function saveRecentCalls() {
    localStorage.setItem('recentCalls', JSON.stringify(app.recentCalls));
}

// Formater la date en style iOS (aujourd'hui, hier, date)
function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const inputDate = new Date(date);
    const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    
    if (inputDay.getTime() === today.getTime()) {
        return 'aujourd\'hui';
    } else if (inputDay.getTime() === yesterday.getTime()) {
        return 'hier';
    } else {
        const day = inputDate.getDate().toString().padStart(2, '0');
        const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        const year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

// Formater l'heure en style iOS
function formatTime(date) {
    const inputDate = new Date(date);
    const hours = inputDate.getHours().toString().padStart(2, '0');
    const minutes = inputDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Afficher les contacts dans la liste
function displayContacts(filteredContacts = null) {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';
    
    // Changer le titre et les boutons selon la vue
    document.querySelector('.nav-bar .back-button').innerHTML = '<i class="fas fa-chevron-left"></i> Récents';
    document.querySelector('.nav-bar .back-button').style.visibility = 'visible';
    document.querySelector('.nav-bar .actions-container').innerHTML = `
        <button id="addContactBtn" class="add-button">
            <i class="fas fa-plus"></i>
        </button>
    `;
    document.getElementById('addContactBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Ajouter un contact';
        document.getElementById('contactId').value = '';
        document.getElementById('contactForm').reset();
        openModal('contactModal');
    });
    
    const contactsToDisplay = filteredContacts || app.contacts;
    
    if (contactsToDisplay.length === 0) {
        contactList.innerHTML = '<li class="contact-item">Aucun contact trouvé</li>';
        return;
    }
    
    // Regrouper les contacts par première lettre
    const groupedContacts = {};
    contactsToDisplay.forEach(contact => {
        // Utiliser le nom ou le prénom comme clé de tri
        const displayName = contact.nom || contact.prenom;
        if (!displayName) {
            // Si pas de nom ni prénom, mettre dans "?"
            const firstLetter = "?";
            if (!groupedContacts[firstLetter]) {
                groupedContacts[firstLetter] = [];
            }
            groupedContacts[firstLetter].push(contact);
            return;
        }
        
        const firstLetter = displayName.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });
    
    // Trier les clés alphabétiquement
    const sortedKeys = Object.keys(groupedContacts).sort();
    
    // Créer les sections par lettre
    sortedKeys.forEach(letter => {
        // Ajouter le séparateur de section
        const divider = document.createElement('li');
        divider.className = 'divider';
        divider.textContent = letter;
        contactList.appendChild(divider);
        
        // Ajouter les contacts de cette section
        groupedContacts[letter].forEach(contact => {
            const contactItem = document.createElement('li');
            contactItem.className = 'contact-item';
            contactItem.dataset.id = contact.id;
            
            // Déterminer le nom à afficher
            let displayName = '';
            if (contact.nom && contact.prenom) {
                displayName = `${contact.nom} ${contact.prenom}`;
            } else if (contact.nom) {
                displayName = contact.nom;
            } else if (contact.prenom) {
                displayName = contact.prenom;
            } else {
                displayName = contact.telephone;
            }
            
            // Type d'appareil (mobile, téléphone, etc.)
            const deviceType = contact.type || 'mobile';
            
            contactItem.innerHTML = `
                <div class="contact-info">
                    <div class="contact-name">${displayName}</div>
                    <div class="contact-phone">${deviceType}</div>
                </div>
                <div class="contact-actions">
                    <button class="info-btn" data-id="${contact.id}">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            `;
            
            contactList.appendChild(contactItem);
            
            // Ajouter l'événement pour afficher les détails du contact
            contactItem.addEventListener('click', () => {
                showContactDetails(contact.id);
            });
        });
    });
    
    // Réattacher les gestionnaires d'événements pour les boutons d'info
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const contactId = btn.dataset.id;
            showContactDetails(contactId);
        });
    });
}

// Afficher les appels récents
function displayRecentCalls(filteredCalls = null) {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';
    
    // Changer le titre et les boutons selon la vue
    document.querySelector('.nav-bar .back-button').style.visibility = 'hidden';
    document.querySelector('.nav-bar .actions-container').innerHTML = `
        <button id="editCallsBtn" class="edit-button">
            Modifier
        </button>
    `;
    document.getElementById('editCallsBtn').addEventListener('click', () => {
        // Logique pour éditer les appels récents
        alert('Fonction d\'édition non implémentée');
    });
    
    // Ajouter les onglets de filtre (Tous, Manqués)
    const filterTabs = document.createElement('div');
    filterTabs.className = 'filter-tabs';
    filterTabs.innerHTML = `
        <button class="filter-tab active">Tous</button>
        <button class="filter-tab">Manqués</button>
    `;
    contactList.parentNode.insertBefore(filterTabs, contactList);
    
    // Gestionnaires d'événements pour les onglets
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Filtrer les appels selon l'onglet
            if (e.target.textContent === 'Manqués') {
                const missedCalls = app.recentCalls.filter(call => call.status === 'manqué');
                displayRecentCalls(missedCalls);
            } else {
                displayRecentCalls();
            }
        });
    });
    
    const callsToDisplay = filteredCalls || app.recentCalls;
    
    if (callsToDisplay.length === 0) {
        contactList.innerHTML = '<li class="contact-item">Aucun appel récent</li>';
        return;
    }
    
    // Regrouper les appels par date
    const groupedCalls = {};
    callsToDisplay.forEach(call => {
        const dateGroup = formatDate(call.date);
        if (!groupedCalls[dateGroup]) {
            groupedCalls[dateGroup] = [];
        }
        groupedCalls[dateGroup].push(call);
    });
    
    // Trier les clés de date (aujourd'hui, hier, dates)
    const sortOrder = { 'aujourd\'hui': 0, 'hier': 1 };
    const sortedKeys = Object.keys(groupedCalls).sort((a, b) => {
        if (a in sortOrder && b in sortOrder) {
            return sortOrder[a] - sortOrder[b];
        } else if (a in sortOrder) {
            return -1;
        } else if (b in sortOrder) {
            return 1;
        } else {
            // Pour les autres dates, trier du plus récent au plus ancien
            const dateA = new Date(a.split('/').reverse().join('/'));
            const dateB = new Date(b.split('/').reverse().join('/'));
            return dateB - dateA;
        }
    });
    
    // Créer les sections par date
    sortedKeys.forEach(dateGroup => {
        // Ajouter le séparateur de section
        const divider = document.createElement('li');
        divider.className = 'divider';
        divider.textContent = dateGroup;
        contactList.appendChild(divider);
        
        // Trier les appels du plus récent au plus ancien au sein de chaque groupe
        const sortedCalls = groupedCalls[dateGroup].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Ajouter les appels de cette section
        sortedCalls.forEach(call => {
            const callItem = document.createElement('li');
            callItem.className = 'contact-item';
            
            // Déterminer les informations de contact
            let displayName = '';
            let displayType = '';
            let phoneNumber = '';
            
            if (call.contactId) {
                const contact = app.contacts.find(c => c.id === call.contactId);
                if (contact) {
                    if (contact.nom && contact.prenom) {
                        displayName = `${contact.nom} ${contact.prenom}`;
                    } else if (contact.nom) {
                        displayName = contact.nom;
                    } else if (contact.prenom) {
                        displayName = contact.prenom;
                    } else {
                        displayName = contact.telephone;
                    }
                    displayType = contact.type || 'mobile';
                    phoneNumber = contact.telephone;
                }
            } else {
                displayName = call.telephone || 'Numéro inconnu';
                displayType = 'inconnu';
                phoneNumber = call.telephone || '';
            }
            
            // Ajouter la classe pour les appels manqués
            if (call.status === 'manqué') {
                callItem.classList.add('missed-call');
            }
            
            // Icône selon le type d'appel
            let callIcon = '';
            if (call.type === 'entrant') {
                callIcon = '<i class="fas fa-phone-alt incoming"></i>';
            } else if (call.type === 'sortant') {
                callIcon = '<i class="fas fa-phone-alt outgoing"></i>';
            } else {
                callIcon = '<i class="fas fa-phone-alt"></i>';
            }
            
            // Afficher le compteur d'appels si > 1
            const countBadge = call.count > 1 ? `<span class="call-count">(${call.count})</span>` : '';
            
            callItem.innerHTML = `
                <div class="contact-info">
                    <div class="contact-name ${call.status === 'manqué' ? 'missed-call-text' : ''}">
                        ${displayName} ${countBadge}
                    </div>
                    <div class="contact-phone">${displayType}</div>
                </div>
                <div class="contact-time">
                    ${formatTime(call.date)} ${callIcon}
                </div>
            `;
            
            contactList.appendChild(callItem);
            
            // Ajouter l'événement pour afficher les détails du contact ou de l'appel
            callItem.addEventListener('click', () => {
                if (call.contactId) {
                    showContactDetails(call.contactId);
                } else if (phoneNumber) {
                    // Créer un contact temporaire pour afficher les détails
                    const tempContact = {
                        id: 'temp',
                        nom: '',
                        prenom: '',
                        telephone: phoneNumber,
                        email: '',
                        type: 'inconnu',
                        pays: call.pays || 'France'
                    };
                    showContactDetailsFromObject(tempContact);
                }
            });
        });
    });
}

// Afficher les détails d'un contact
function showContactDetails(contactId) {
    const contact = app.contacts.find(c => c.id === contactId);
    if (contact) {
        showContactDetailsFromObject(contact);
    }
}

// Afficher les détails d'un contact à partir d'un objet contact
function showContactDetailsFromObject(contact) {
    const detailView = document.getElementById('contactDetailView');
    
    // Déterminer le nom à afficher
    let displayName = '';
    if (contact.nom && contact.prenom) {
        displayName = `${contact.nom} ${contact.prenom}`;
    } else if (contact.nom) {
        displayName = contact.nom;
    } else if (contact.prenom) {
        displayName = contact.prenom;
    } else {
        displayName = contact.telephone;
    }
    
    // Mettre à jour les détails
    document.getElementById('contactDetailName').textContent = displayName;
    document.getElementById('phoneNumberDetail').querySelector('.data-value').textContent = contact.telephone;
    
    // Ajouter le pays si disponible
    const countryElement = document.getElementById('countryDetail');
    if (!countryElement) {
        const newCountryElement = document.createElement('div');
        newCountryElement.id = 'countryDetail';
        newCountryElement.className = 'data-item';
        newCountryElement.innerHTML = `
            <div class="data-label">Pays</div>
            <div class="data-value">${contact.pays || 'France'}</div>
        `;
        document.querySelector('.data-section').appendChild(newCountryElement);
    } else {
        countryElement.querySelector('.data-value').textContent = contact.pays || 'France';
    }
    
    // Ajouter l'email si disponible
    const emailElement = document.getElementById('emailDetail');
    if (contact.email) {
        if (!emailElement) {
            const newEmailElement = document.createElement('div');
            newEmailElement.id = 'emailDetail';
            newEmailElement.className = 'data-item';
            newEmailElement.innerHTML = `
                <div class="data-label">Email</div>
                <div class="data-value">${contact.email}</div>
            `;
            document.querySelector('.data-section').appendChild(newEmailElement);
        } else {
            emailElement.querySelector('.data-value').textContent = contact.email;
            emailElement.style.display = 'flex';
        }
    } else if (emailElement) {
        emailElement.style.display = 'none';
    }
    
    // Ajouter les gestionnaires d'événements pour les actions
    document.querySelector('.message-btn').onclick = () => handleMessage(contact);
    document.querySelector('.call-btn').onclick = () => handleCall(null, contact);
    document.querySelector('.video-btn').onclick = () => handleVideoCall(contact);
    document.querySelector('.mail-btn').onclick = () => handleEmail(contact);
    document.querySelector('.share-btn').onclick = () => handleShare(contact);
    document.querySelector('.add-fav-btn').onclick = () => handleAddToFavorites(contact);
    document.querySelector('.add-emergency-btn').onclick = () => handleAddToEmergency(contact);
    document.querySelector('.share-location-btn').onclick = () => handleShareLocation(contact);
    document.querySelector('.block-btn').onclick = () => handleBlockContact(contact);
    
    // Afficher la vue détaillée
    detailView.style.display = 'flex';
    
    // Gestionnaire pour le bouton retour
    document.getElementById('backToListBtn').onclick = () => {
        detailView.style.display = 'none';
    };
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
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Onglets de navigation
    document.querySelectorAll('.tab-button').forEach((tab, index) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Changer de vue selon l'onglet
            switch (index) {
                case 0: // Favoris
                    switchView('favorites');
                    break;
                case 1: // Récents
                    switchView('recents');
                    break;
                case 2: // Contacts
                    switchView('contacts');
                    break;
                case 3: // Clavier
                    switchView('keypad');
                    break;
                case 4: // Messagerie
                    switchView('voicemail');
                    break;
            }
        });
    });
    
    // Bouton retour
    document.querySelector('.back-button').addEventListener('click', () => {
        switchView('recents');
    });
    
    // Bouton retour de la vue détaillée
    document.getElementById('backToListBtn').addEventListener('click', () => {
        document.getElementById('contactDetailView').style.display = 'none';
    });
}

// Fonctions manquantes à implémenter

// Générer l'index alphabétique
function generateAlphabetIndex() {
    const alphabetIndex = document.getElementById('alphabetIndex');
    alphabetIndex.innerHTML = '';
    
    // Créer les lettres de A à Z
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        
        // Ajouter l'événement pour faire défiler jusqu'à la section correspondante
        letterElement.addEventListener('click', () => {
            const dividers = document.querySelectorAll('.divider');
            dividers.forEach(divider => {
                if (divider.textContent.toLowerCase().startsWith(letter.toLowerCase())) {
                    divider.scrollIntoView({ behavior: 'smooth' });
                    return;
                }
            });
        });
        
        alphabetIndex.appendChild(letterElement);
    }
}