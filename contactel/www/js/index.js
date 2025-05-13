// Variable globale pour stocker le contact actuellement sélectionné
let currentContact = null;

// Attendre que l'appareil soit prêt
document.addEventListener('deviceready', onDeviceReady, false);

// Fallback pour le développement dans le navigateur
document.addEventListener('DOMContentLoaded', function() {
    if (typeof cordova === 'undefined') {
        onDeviceReady();
    }
});

function onDeviceReady() {
    console.log('Application ContactEl prête!');
    
    // Initialiser les contacts de démonstration s'ils n'existent pas
    initDemoContacts();
    
    // Charger la liste des contacts
    loadContactList();
    
    // Gérer la recherche
    $('#search-input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterContacts(searchTerm);
    });
    
    // Gestionnaires d'événements pour les formulaires
    $('#add-form').on('submit', function(e) {
        e.preventDefault();
        addContact();
    });
    
    $('#edit-form').on('submit', function(e) {
        e.preventDefault();
        updateContact();
    });
    
    // Gestionnaire pour le bouton de suppression
    $('#delete-btn').on('click', function() {
        confirmAndDeleteContact();
    });
    
    // Gestionnaire pour les boutons d'action
    $('#call-btn').on('click', function() {
        if (currentContact && currentContact.phone) {
            window.location.href = 'tel:' + currentContact.phone;
        }
    });
    
    $('#sms-btn').on('click', function() {
        if (currentContact && currentContact.phone) {
            window.location.href = 'sms:' + currentContact.phone;
        }
    });
    
    $('#email-btn').on('click', function() {
        if (currentContact && currentContact.email) {
            window.location.href = 'mailto:' + currentContact.email;
        }
    });
    
    // Gérer le scroll vers les initiales lorsqu'on clique sur l'index alphabétique
    $('.alphabet-index a').on('click', function(e) {
        e.preventDefault();
        const initial = $(this).text();
        scrollToInitial(initial);
    });
}

// Initialiser les contacts de démonstration avec émojis
function initDemoContacts() {
    if (!localStorage.getItem('contacts')) {
        const demoContacts = [
            {
                id: generateId(),
                name: 'Diana Smith',
                phone: '70 123 45 67',
                email: 'diana.smith@example.com',
                emoji: '🪐',
                group: 'amis'
            },
            {
                id: generateId(),
                name: 'Elizabeth Johnson',
                phone: '77 456 78 90',
                email: 'elizabeth.j@example.com',
                emoji: '🦞',
                group: 'famille'
            },
            {
                id: generateId(),
                name: 'Emily Davis',
                phone: '76 234 56 78',
                email: 'emily.d@example.com',
                emoji: '🦋',
                group: 'travail'
            },
            {
                id: generateId(),
                name: 'Erin Wilson',
                phone: '78 567 89 01',
                email: 'erin.w@example.com',
                emoji: '🌻',
                group: 'amis'
            },
            {
                id: generateId(),
                name: 'Evan Brown',
                phone: '70 890 12 34',
                email: 'evan.b@example.com',
                emoji: '🎸',
                group: 'travail'
            },
            {
                id: generateId(),
                name: 'Faith Miller',
                phone: '77 123 45 67',
                email: 'faith.m@example.com',
                emoji: '🥥',
                group: 'famille'
            },
            {
                id: generateId(),
                name: 'Finley Taylor',
                phone: '76 456 78 90',
                email: 'finley.t@example.com',
                emoji: '💥',
                group: 'travail'
            },
            {
                id: generateId(),
                name: 'Freya Anderson',
                phone: '78 234 56 78',
                email: 'freya.a@example.com',
                emoji: '🍒',
                group: 'amis'
            }
        ];
        
        localStorage.setItem('contacts', JSON.stringify(demoContacts));
    }
}

// Charger et afficher la liste des contacts
function loadContactList() {
    const contacts = getContacts();
    const $contactList = $('#contact-list');
    
    // Vider la liste
    $contactList.empty();
    
    if (contacts.length === 0) {
        $contactList.html('<li class="empty-list"><p>Aucun contact trouvé. Ajoutez votre premier contact!</p></li>');
        return;
    }
    
    // Trier les contacts par nom
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    
    // Regrouper les contacts par initiale
    const groupedContacts = {};
    
    contacts.forEach(contact => {
        const initial = contact.name.charAt(0).toUpperCase();
        if (!groupedContacts[initial]) {
            groupedContacts[initial] = [];
        }
        groupedContacts[initial].push(contact);
    });
    
    // Ajouter chaque groupe à la liste
    Object.keys(groupedContacts).sort().forEach(initial => {
        // Ajouter l'en-tête de groupe
        $contactList.append(`<li class="section-header">${initial}</li>`);
        
        // Ajouter les contacts de ce groupe
        groupedContacts[initial].forEach(contact => {
            // Formater le nom avec espacement
            const spacedName = contact.name.toLowerCase().split('').join(' ');
            
            const $item = $(`
                <li>
                    <a href="#details-page" class="contact-item" data-id="${contact.id}">
                        <div class="contact-info">
                            <h2>${spacedName}</h2>
                            <span class="contact-emoji">${contact.emoji || '👤'}</span>
                        </div>
                    </a>
                </li>
            `);
            
            $contactList.append($item);
        });
    });
    
    // Rafraîchir la liste pour appliquer le style jQuery Mobile
    if ($contactList.hasClass('ui-listview')) {
        $contactList.listview('refresh');
    }
    
    // Gestionnaire d'événements pour la sélection d'un contact
    $('.contact-item').on('click', function() {
        const contactId = $(this).data('id');
        currentContact = getContactById(contactId);
    });
}

// Filtrer les contacts en fonction du terme de recherche
function filterContacts(searchTerm) {
    const contacts = getContacts();
    const $contactList = $('#contact-list');
    
    // Vider la liste
    $contactList.empty();
    
    if (searchTerm === '') {
        loadContactList(); // Recharger la liste complète si la recherche est vide
        return;
    }
    
    // Filtrer les contacts
    const filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm) || 
        contact.phone.includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm))
    );
    
    if (filteredContacts.length === 0) {
        $contactList.html('<li class="empty-list"><p>Aucun contact trouvé</p></li>');
        return;
    }
    
    // Ajouter les contacts filtrés à la liste
    filteredContacts.forEach(contact => {
        // Formater le nom avec espacement
        const spacedName = contact.name.toLowerCase().split('').join(' ');
        
        const $item = $(`
            <li>
                <a href="#details-page" class="contact-item" data-id="${contact.id}">
                    <div class="contact-info">
                        <h2>${spacedName}</h2>
                        <span class="contact-emoji">${contact.emoji || '👤'}</span>
                    </div>
                </a>
            </li>
        `);
        
        $contactList.append($item);
    });
    
    // Rafraîchir la liste
    if ($contactList.hasClass('ui-listview')) {
        $contactList.listview('refresh');
    }
    
    // Réattacher les gestionnaires d'événements
    $('.contact-item').on('click', function() {
        const contactId = $(this).data('id');
        currentContact = getContactById(contactId);
    });
}

// Scroll vers l'initiale sélectionnée
function scrollToInitial(initial) {
    const $header = $('#contact-list .section-header').filter(function() {
        return $(this).text() === initial;
    });
    
    if ($header.length) {
        $.mobile.silentScroll($header.offset().top - 50);
    }
}

// Fonctions utilitaires
function getContacts() {
    const contactsJson = localStorage.getItem('contacts');
    return contactsJson ? JSON.parse(contactsJson) : [];
}

function saveContacts(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function getContactById(id) {
    const contacts = getContacts();
    return contacts.find(contact => contact.id === id);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Afficher les détails d'un contact
function displayContactDetails() {
    if (!currentContact) return;
    
    // Formater le nom avec espacement
    const spacedName = currentContact.name.toLowerCase().split('').join(' ');
    
    const $detailsContainer = $('#contact-details');
    
    $detailsContainer.html(`
        <div class="contact-header">
            <div class="contact-emoji-large">${currentContact.emoji || '👤'}</div>
            <h1>${spacedName}</h1>
        </div>
        
        <div class="contact-actions">
            <div class="action-btn">
                <div class="action-icon">📱</div>
                <div class="action-label">appeler</div>
            </div>
            <div class="action-btn">
                <div class="action-icon">✉️</div>
                <div class="action-label">message</div>
            </div>
            <div class="action-btn">
                <div class="action-icon">📧</div>
                <div class="action-label">mail</div>
            </div>
        </div>
        
        <ul class="contact-details-list">
            <li>
                <div class="detail-label">téléphone mobile</div>
                <div class="detail-value">${currentContact.phone}</div>
            </li>
            <li>
                <div class="detail-label">e-mail</div>
                <div class="detail-value">${currentContact.email || 'Non renseigné'}</div>
            </li>
            <li>
                <div class="detail-label">groupe</div>
                <div class="detail-value">${currentContact.group || 'Non renseigné'}</div>
            </li>
        </ul>
    `);
    
    // Ajouter des styles spécifiques pour la page de détails
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .contact-header {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 30px 0;
                background-color: #f8f8f8;
            }
            
            .contact-emoji-large {
                font-size: 60px;
                margin-bottom: 15px;
            }
            
            .contact-header h1 {
                font-size: 24px;
                font-weight: normal;
                letter-spacing: 2px;
                text-transform: lowercase;
            }
            
            .contact-actions {
                display: flex;
                justify-content: space-around;
                padding: 20px;
                background-color: #fff;
                border-bottom: 0.5px solid #c8c7cc;
            }
            
            .action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .action-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .action-label {
                font-size: 12px;
                color: #007aff;
                text-transform: lowercase;
            }
            
            .contact-details-list {
                list-style: none;
                margin: 0;
                padding: 0;
                background-color: #fff;
            }
            
            .contact-details-list li {
                padding: 12px 16px;
                border-bottom: 0.5px solid #c8c7cc;
            }
            
            .detail-label {
                font-size: 14px;
                color: #8e8e93;
                margin-bottom: 5px;
                text-transform: lowercase;
            }
            
            .detail-value {
                font-size: 17px;
                color: #000;
            }
            
            @media (prefers-color-scheme: dark) {
                .contact-header {
                    background-color: #1c1c1e;
                }
                
                .contact-header h1 {
                    color: #fff;
                }
                
                .contact-actions {
                    background-color: #1c1c1e;
                    border-bottom-color: #38383a;
                }
                
                .contact-details-list {
                    background-color: #1c1c1e;
                }
                
                .contact-details-list li {
                    border-bottom-color: #38383a;
                }
                
                .detail-value {
                    color: #fff;
                }
            }
        `)
        .appendTo('head');
}

// Ajouter un nouveau contact (avec emoji)
function addContact() {
    // Liste d'émojis à utiliser aléatoirement si l'utilisateur n'en choisit pas
    const defaultEmojis = ['🌟', '🌈', '🌊', '🌸', '🌱', '🍀', '🍒', '🍓', '🎸', '🎯', '🦋', '🦕', '🧠', '🧸', '🪀', '🪁'];
    
    const newContact = {
        id: generateId(),
        name: $('#add-name').val().trim(),
        phone: $('#add-phone').val().trim(),
        email: $('#add-email').val().trim(),
        // Ajouter un emoji aléatoire ou celui choisi par l'utilisateur
        emoji: $('#add-emoji').val() || defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)],
        group: $('#add-group').val()
    };
    
    // Valider les données
    if (!newContact.name || !newContact.phone) {
        alert('Veuillez remplir au moins le nom et le numéro de téléphone.');
        return;
    }
    
    // Ajouter le contact à la liste
    const contacts = getContacts();
    contacts.push(newContact);
    saveContacts(contacts);
    
    // Réinitialiser le formulaire
    $('#add-form')[0].reset();
    
    // Revenir à la page d'accueil et rafraîchir la liste
    $.mobile.changePage('#home');
    loadContactList();
}