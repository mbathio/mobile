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
    
    // Mise à jour de la prévisualisation des images de profil
    $('#profile-select').on('change', function() {
        updateProfilePreview('profile-preview', $(this).val());
    });
    
    $('#edit-profile-select').on('change', function() {
        updateProfilePreview('edit-profile-preview', $(this).val());
    });
    
    // Événements pour gérer la navigation entre les pages
    $(document).on('pagebeforeshow', '#details-page', function() {
        if (currentContact) {
            displayContactDetails();
        }
    });
    
    $(document).on('pagebeforeshow', '#edit-page', function() {
        if (currentContact) {
            populateEditForm();
        }
    });
}

// Initialiser les contacts de démonstration
function initDemoContacts() {
    if (!localStorage.getItem('contacts')) {
        const demoContacts = [
            {
                id: generateId(),
                name: 'Bachir Diallo',
                phone: '70 123 45 67',
                email: 'bachir.diallo@example.com',
                address: 'Dakar, Sénégal',
                photo: 'Bachir Diallo.png',
                group: 'travail'
            },
            {
                id: generateId(),
                name: 'Nabou Gueye',
                phone: '77 456 78 90',
                email: 'nabou.gueye@example.com',
                address: 'Thiès, Sénégal',
                photo: 'Nabou Gueye.png',
                group: 'famille'
            },
            {
                id: generateId(),
                name: 'Samba Sall',
                phone: '76 234 56 78',
                email: 'samba.sall@example.com',
                address: 'Saint-Louis, Sénégal',
                photo: 'Samba Sall.png',
                group: 'amis'
            },
            {
                id: generateId(),
                name: 'Zahra Aidara',
                phone: '78 567 89 01',
                email: 'zahra.aidara@example.com',
                address: 'Kaolack, Sénégal',
                photo: 'zahra aidara.png',
                group: 'travail'
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
    
    // Ajouter chaque contact à la liste
    contacts.forEach(contact => {
        const $item = $(`
            <li>
                <a href="#details-page" class="contact-item" data-id="${contact.id}">
                    <img src="img/${contact.photo || 'logo.png'}" alt="${contact.name}" class="contact-avatar">
                    <div class="contact-info">
                        <h2>${contact.name}</h2>
                        <p>${contact.phone}</p>
                        <span class="contact-group ${contact.group}">${contact.group}</span>
                    </div>
                </a>
            </li>
        `);
        
        $contactList.append($item);
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
        const $item = $(`
            <li>
                <a href="#details-page" class="contact-item" data-id="${contact.id}">
                    <img src="img/${contact.photo || 'logo.png'}" alt="${contact.name}" class="contact-avatar">
                    <div class="contact-info">
                        <h2>${contact.name}</h2>
                        <p>${contact.phone}</p>
                        <span class="contact-group ${contact.group}">${contact.group}</span>
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

// Afficher les détails d'un contact
function displayContactDetails() {
    if (!currentContact) return;
    
    const $detailsContainer = $('#contact-details');
    
    $detailsContainer.html(`
        <img src="img/${currentContact.photo || 'logo.png'}" alt="${currentContact.name}" class="avatar">
        <h2>${currentContact.name}</h2>
        <span class="group-badge ${currentContact.group}">${currentContact.group}</span>
        
        <div class="info-card">
            <div class="label">Téléphone</div>
            <div class="value">${currentContact.phone}</div>
        </div>
        
        <div class="info-card">
            <div class="label">Email</div>
            <div class="value">${currentContact.email || 'Non renseigné'}</div>
        </div>
        
        <div class="info-card">
            <div class="label">Adresse</div>
            <div class="value">${currentContact.address || 'Non renseignée'}</div>
        </div>
    `);
    
    // Désactiver le bouton d'email si non disponible
    if (!currentContact.email) {
        $('#email-btn').addClass('ui-state-disabled');
    } else {
        $('#email-btn').removeClass('ui-state-disabled');
    }
}

// Ajouter un nouveau contact
function addContact() {
    const newContact = {
        id: generateId(),
        name: $('#add-name').val().trim(),
        phone: $('#add-phone').val().trim(),
        email: $('#add-email').val().trim(),
        address: $('#add-address').val().trim(),
        photo: $('#profile-select').val(),
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
    
    // Afficher un message
    showToast('Contact ajouté avec succès');
}

// Mettre à jour un contact existant
function updateContact() {
    if (!currentContact) return;
    
    const updatedContact = {
        id: currentContact.id,
        name: $('#edit-name').val().trim(),
        phone: $('#edit-phone').val().trim(),
        email: $('#edit-email').val().trim(),
        address: $('#edit-address').val().trim(),
        photo: $('#edit-profile-select').val(),
        group: $('#edit-group').val()
    };
    
    // Valider les données
    if (!updatedContact.name || !updatedContact.phone) {
        alert('Veuillez remplir au moins le nom et le numéro de téléphone.');
        return;
    }
    
    // Mettre à jour le contact dans la liste
    const contacts = getContacts();
    const index = contacts.findIndex(c => c.id === currentContact.id);
    
    if (index !== -1) {
        contacts[index] = updatedContact;
        saveContacts(contacts);
        
        // Mettre à jour le contact actuel
        currentContact = updatedContact;
        
        // Revenir à la page de détails et rafraîchir
        $.mobile.changePage('#details-page');
        
        // Rafraîchir la liste des contacts
        loadContactList();
        
        // Afficher un message
        showToast('Contact mis à jour avec succès');
    }
}

// Confirmer et supprimer un contact
function confirmAndDeleteContact() {
    if (!currentContact) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${currentContact.name} ?`)) {
        // Supprimer le contact
        const contacts = getContacts();
        const updatedContacts = contacts.filter(c => c.id !== currentContact.id);
        saveContacts(updatedContacts);
        
        // Revenir à la page d'accueil et rafraîchir la liste
        $.mobile.changePage('#home');
        loadContactList();
        
        // Réinitialiser le contact actuel
        currentContact = null;
        
        // Afficher un message
        showToast('Contact supprimé avec succès');
    }
}

// Pré-remplir le formulaire de modification
function populateEditForm() {
    if (!currentContact) return;
    
    $('#edit-name').val(currentContact.name);
    $('#edit-phone').val(currentContact.phone);
    $('#edit-email').val(currentContact.email || '');
    $('#edit-address').val(currentContact.address || '');
    $('#edit-profile-select').val(currentContact.photo || 'logo.png').selectmenu('refresh');
    $('#edit-group').val(currentContact.group).selectmenu('refresh');
    
    // Mettre à jour la prévisualisation de la photo
    updateProfilePreview('edit-profile-preview', currentContact.photo || 'logo.png');
}

// Mettre à jour la prévisualisation de la photo de profil
function updateProfilePreview(previewId, photoName) {
    $(`#${previewId}`).attr('src', `img/${photoName}`);
}

// Fonctions utilitaires
function getContacts() {
    const contactsJson = localStorage.getItem('contacts');
    return contactsJson ? JSON.parse(contactsJson) : [];
}

// Fonctions utilitaires (suite)
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

// Afficher un message toast
function showToast(message) {
    // Créer l'élément toast s'il n'existe pas déjà
    if ($('#toast').length === 0) {
        $('body').append('<div id="toast" class="toast"></div>');
        
        // Ajouter le style pour le toast
        $('<style>')
            .prop('type', 'text/css')
            .html(`
                .toast {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    z-index: 9999;
                    font-size: 16px;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                    text-align: center;
                    min-width: 200px;
                    max-width: 80%;
                }
                .toast.visible {
                    opacity: 1;
                }
            `)
            .appendTo('head');
    }
    
    // Afficher le toast
    const $toast = $('#toast');
    $toast.text(message).addClass('visible');
    
    // Masquer le toast après un délai
    setTimeout(() => {
        $toast.removeClass('visible');
    }, 3000);
}

// Fonction pour afficher et masquer les groupes de lettres dans la liste de contacts
function organizeContactsByInitial() {
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
        $contactList.append(`
            <li data-role="list-divider" class="ui-li-divider">${initial}</li>
        `);
        
        // Ajouter les contacts de ce groupe
        groupedContacts[initial].forEach(contact => {
            const $item = $(`
                <li>
                    <a href="#details-page" class="contact-item" data-id="${contact.id}">
                        <img src="img/${contact.photo || 'logo.png'}" alt="${contact.name}" class="contact-avatar">
                        <div class="contact-info">
                            <h2>${contact.name}</h2>
                            <p>${contact.phone}</p>
                            <span class="contact-group ${contact.group}">${contact.group}</span>
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

// Fonction pour exporter les contacts (vCard format)
function exportContacts() {
    const contacts = getContacts();
    let vcardContent = '';
    
    contacts.forEach(contact => {
        vcardContent += 'BEGIN:VCARD\n';
        vcardContent += 'VERSION:3.0\n';
        vcardContent += `N:${contact.name};;;\n`;
        vcardContent += `FN:${contact.name}\n`;
        vcardContent += `TEL;TYPE=CELL:${contact.phone}\n`;
        
        if (contact.email) {
            vcardContent += `EMAIL:${contact.email}\n`;
        }
        
        if (contact.address) {
            vcardContent += `ADR:;;${contact.address};;;;\n`;
        }
        
        vcardContent += `CATEGORIES:${contact.group}\n`;
        vcardContent += 'END:VCARD\n';
    });
    
    // Créer un lien de téléchargement pour le fichier vCard
    const blob = new Blob([vcardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.vcf';
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
    
    showToast('Contacts exportés avec succès');
}

// Ajouter un menu d'options pour les fonctionnalités supplémentaires
function setupOptionsMenu() {
    // Ajouter le bouton de menu si non existant
    if ($('#options-button').length === 0) {
        const $optionsButton = $(`
            <a href="#" id="options-button" class="ui-btn ui-btn-left ui-icon-bars ui-btn-icon-notext ui-corner-all">Options</a>
        `);
        
        // Ajouter au header de la page d'accueil
        $('#home [data-role="header"]').prepend($optionsButton);
        
        // Créer le menu popup
        $('body').append(`
            <div data-role="popup" id="options-menu" data-theme="a">
                <ul data-role="listview" data-inset="true" style="min-width:210px;">
                    <li data-role="list-divider">Options</li>
                    <li><a href="#" id="export-contacts">Exporter les contacts</a></li>
                    <li><a href="#" id="group-by-initial">Grouper par initiale</a></li>
                    <li><a href="#" id="sort-by-group">Trier par groupe</a></li>
                </ul>
            </div>
        `);
        
        // Initialiser le popup
        $('#options-menu').popup();
        
        // Associer le bouton au popup
        $('#options-button').on('click', function() {
            $('#options-menu').popup('open', { positionTo: 'window' });
        });
        
        // Gestionnaires d'événements pour les options
        $('#export-contacts').on('click', function() {
            $('#options-menu').popup('close');
            exportContacts();
        });
        
        $('#group-by-initial').on('click', function() {
            $('#options-menu').popup('close');
            organizeContactsByInitial();
        });
        
        $('#sort-by-group').on('click', function() {
            $('#options-menu').popup('close');
            sortContactsByGroup();
        });
    }
}

// Trier les contacts par groupe
function sortContactsByGroup() {
    const contacts = getContacts();
    const $contactList = $('#contact-list');
    
    // Vider la liste
    $contactList.empty();
    
    if (contacts.length === 0) {
        $contactList.html('<li class="empty-list"><p>Aucun contact trouvé. Ajoutez votre premier contact!</p></li>');
        return;
    }
    
    // Trier les contacts par groupe puis par nom
    contacts.sort((a, b) => {
        if (a.group === b.group) {
            return a.name.localeCompare(b.name);
        }
        return a.group.localeCompare(b.group);
    });
    
    // Regrouper les contacts par groupe
    const groupedContacts = {};
    
    contacts.forEach(contact => {
        if (!groupedContacts[contact.group]) {
            groupedContacts[contact.group] = [];
        }
        groupedContacts[contact.group].push(contact);
    });
    
    // Définir l'ordre des groupes
    const groupOrder = ['famille', 'amis', 'travail', 'autre'];
    
    // Ajouter chaque groupe à la liste
    groupOrder.forEach(group => {
        if (groupedContacts[group] && groupedContacts[group].length > 0) {
            // Formater le nom du groupe pour l'affichage
            const groupName = group.charAt(0).toUpperCase() + group.slice(1);
            
            // Ajouter l'en-tête de groupe
            $contactList.append(`
                <li data-role="list-divider" class="ui-li-divider ${group}-header">${groupName}</li>
            `);
            
            // Ajouter les contacts de ce groupe
            groupedContacts[group].forEach(contact => {
                const $item = $(`
                    <li>
                        <a href="#details-page" class="contact-item" data-id="${contact.id}">
                            <img src="img/${contact.photo || 'logo.png'}" alt="${contact.name}" class="contact-avatar">
                            <div class="contact-info">
                                <h2>${contact.name}</h2>
                                <p>${contact.phone}</p>
                            </div>
                        </a>
                    </li>
                `);
                
                $contactList.append($item);
            });
        }
    });
    
    // Rafraîchir la liste pour appliquer le style jQuery Mobile
    if ($contactList.hasClass('ui-listview')) {
        $contactList.listview('refresh');
    }
    
    // Ajouter un style pour les en-têtes de groupe
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .famille-header {
                background-color: #ffebee !important;
                color: #e53935 !important;
                font-weight: bold !important;
            }
            .amis-header {
                background-color: #e0f7fa !important;
                color: #00acc1 !important;
                font-weight: bold !important;
            }
            .travail-header {
                background-color: #e8f5e9 !important;
                color: #43a047 !important;
                font-weight: bold !important;
            }
            .autre-header {
                background-color: #f5f5f5 !important;
                color: #757575 !important;
                font-weight: bold !important;
            }
        `)
        .appendTo('head');
    
    // Gestionnaire d'événements pour la sélection d'un contact
    $('.contact-item').on('click', function() {
        const contactId = $(this).data('id');
        currentContact = getContactById(contactId);
    });
}

// Appeler setupOptionsMenu lors du chargement de la page d'accueil
$(document).on('pageshow', '#home', function() {
    setupOptionsMenu();
});