// Fonction complémentaire à ajouter dans index.js après displayContactDetails()

// Ajouter les boutons d'action sur la page de détails
function addActionButtons() {
  if (!currentContact) return;

  // Vérifier si les boutons existent déjà
  if ($("#contact-details .action-buttons").length === 0) {
    const $actionButtons = $(`
            <div class="action-buttons">
                <a href="tel:${
                  currentContact.phone
                }" id="call-btn" class="action-btn">
                    <div class="action-icon">📞</div>
                    <span>Appeler</span>
                </a>
                <a href="sms:${
                  currentContact.phone
                }" id="sms-btn" class="action-btn">
                    <div class="action-icon">✉️</div>
                    <span>SMS</span>
                </a>
                <a href="${
                  currentContact.email ? "mailto:" + currentContact.email : "#"
                }" 
                   id="email-btn" class="action-btn ${
                     !currentContact.email ? "ui-state-disabled" : ""
                   }">
                    <div class="action-icon">📧</div>
                    <span>Email</span>
                </a>
                <a href="#" id="share-btn" class="action-btn">
                    <div class="action-icon">🔗</div>
                    <span>Partager</span>
                </a>
            </div>
        `);

    $("#contact-details").append($actionButtons);

    // Gestionnaire pour le bouton de partage
    $("#share-btn").on("click", function (e) {
      e.preventDefault();
      shareContact();
    });
  } else {
    // Mettre à jour les liens si les boutons existent déjà
    $("#call-btn").attr("href", "tel:" + currentContact.phone);
    $("#sms-btn").attr("href", "sms:" + currentContact.phone);

    if (currentContact.email) {
      $("#email-btn")
        .attr("href", "mailto:" + currentContact.email)
        .removeClass("ui-state-disabled");
    } else {
      $("#email-btn").attr("href", "#").addClass("ui-state-disabled");
    }
  }
}

// Fonction pour partager un contact
function shareContact() {
  if (!currentContact) return;

  // Créer le texte à partager
  const shareText = `Contact: ${currentContact.name}\nTéléphone: ${
    currentContact.phone
  }${currentContact.email ? "\nEmail: " + currentContact.email : ""}`;

  // Vérifier si l'API Web Share est disponible
  if (navigator.share) {
    navigator
      .share({
        title: `Contact: ${currentContact.name}`,
        text: shareText,
      })
      .then(() => console.log("Partage réussi"))
      .catch((error) => {
        console.log("Erreur lors du partage", error);
        fallbackShare();
      });
  } else {
    fallbackShare();
  }
}

// Méthode de partage alternative
function fallbackShare() {
  if (!currentContact) return;

  // Créer une carte de visite simple
  const cardHtml = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; border-radius: 10px; padding: 20px; width: 80%; max-width: 350px; position: relative;">
                <div style="position: absolute; top: 10px; right: 10px; font-size: 24px; cursor: pointer;" id="close-card">×</div>
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">${
                      currentContact.photo ? "📷" : "👤"
                    }</div>
                    <h2 style="margin: 0; font-size: 20px;">${
                      currentContact.name
                    }</h2>
                    <div style="font-size: 14px; color: #666;">${
                      currentContact.group
                    }</div>
                </div>
                <div style="margin: 15px 0;">
                    <div style="margin: 10px 0;">
                        <div style="font-size: 12px; color: #999;">Téléphone</div>
                        <div style="font-size: 16px;">${
                          currentContact.phone
                        }</div>
                    </div>
                    ${
                      currentContact.email
                        ? `
                    <div style="margin: 10px 0;">
                        <div style="font-size: 12px; color: #999;">Email</div>
                        <div style="font-size: 16px;">${currentContact.email}</div>
                    </div>
                    `
                        : ""
                    }
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button id="copy-contact" style="background: #007aff; color: white; border: none; padding: 10px 15px; border-radius: 5px; font-size: 16px;">Copier les informations</button>
                </div>
            </div>
        </div>
    `;

  // Ajouter la carte au DOM
  $("body").append(cardHtml);

  // Gestionnaire pour le bouton de fermeture
  $("#close-card").on("click", function () {
    $(this).closest("div").parent().remove();
  });

  // Gestionnaire pour le bouton de copie
  $("#copy-contact").on("click", function () {
    const shareText = `Contact: ${currentContact.name}\nTéléphone: ${
      currentContact.phone
    }${currentContact.email ? "\nEmail: " + currentContact.email : ""}`;

    // Copier dans le presse-papier
    const textarea = document.createElement("textarea");
    textarea.value = shareText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Afficher un message
    showToast("Informations copiées dans le presse-papier");

    // Fermer la carte
    $("#close-card").click();
  });
}

// Fonction pour améliorer la recherche avec recherche en temps réel
function enhanceSearch() {
  // Styliser le champ de recherche
  const $searchInput = $("#search-input");

  // Ajouter une animation sur focus
  $searchInput
    .on("focus", function () {
      $(this).closest(".ui-input-search").css({
        "box-shadow": "0 0 0 2px #007aff",
        transition: "box-shadow 0.2s ease-in-out",
      });
    })
    .on("blur", function () {
      $(this).closest(".ui-input-search").css("box-shadow", "none");
    });

  // Améliorer la recherche pour inclure la recherche phonétique
  $searchInput.on("input", function () {
    const searchTerm = $(this).val().toLowerCase();

    // Si le terme de recherche est vide, afficher tous les contacts
    if (!searchTerm) {
      loadContactList();
      return;
    }

    // Filtrer avec recherche améliorée
    const contacts = getContacts();
    const $contactList = $("#contact-list");

    // Vider la liste
    $contactList.empty();

    // Fonction pour calculer la similarité entre deux chaînes
    function similarity(s1, s2) {
      let longer = s1;
      let shorter = s2;

      if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
      }

      const longerLength = longer.length;
      if (longerLength === 0) {
        return 1.0;
      }

      return (
        (longerLength - editDistance(longer, shorter)) /
        parseFloat(longerLength)
      );
    }

    // Algorithme de distance de Levenshtein
    function editDistance(s1, s2) {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();

      const costs = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) {
          costs[s2.length] = lastValue;
        }
      }
      return costs[s2.length];
    }

    // Filtrer les contacts avec un seuil de similarité
    const filteredContacts = contacts.filter((contact) => {
      // Correspondance exacte dans le nom, téléphone ou email
      if (
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm))
      ) {
        return true;
      }

      // Correspondance approximative dans le nom
      const nameSimilarity = similarity(searchTerm, contact.name.toLowerCase());
      return nameSimilarity > 0.4; // seuil de similarité
    });

    // Trier par pertinence
    filteredContacts.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchTerm);
      const bNameMatch = b.name.toLowerCase().includes(searchTerm);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      const aSimScore = similarity(searchTerm, a.name.toLowerCase());
      const bSimScore = similarity(searchTerm, b.name.toLowerCase());

      return bSimScore - aSimScore;
    });

    if (filteredContacts.length === 0) {
      $contactList.html(
        '<li class="empty-list"><p>Aucun contact trouvé</p></li>'
      );
      return;
    }

    // Ajouter les contacts filtrés à la liste
    filteredContacts.forEach((contact) => {
      const $item = $(`
                <li>
                    <a href="#details-page" class="contact-item" data-id="${
                      contact.id
                    }">
                        <img src="img/${contact.photo || "logo.png"}" alt="${
        contact.name
      }" class="contact-avatar">
                        <div class="contact-info">
                            <h2>${contact.name}</h2>
                            <p>${contact.phone}</p>
                            <span class="contact-group ${contact.group}">${
        contact.group
      }</span>
                        </div>
                    </a>
                </li>
            `);

      $contactList.append($item);
    });

    // Rafraîchir la liste
    if ($contactList.hasClass("ui-listview")) {
      $contactList.listview("refresh");
    }

    // Réattacher les gestionnaires d'événements
    $(".contact-item").on("click", function () {
      const contactId = $(this).data("id");
      currentContact = getContactById(contactId);
    });
  });
}

// Appeler cette fonction dans onDeviceReady
function initApp() {
  // Initialiser les fonctionnalités avancées
  enhanceSearch();

  // Appeler addActionButtons() après avoir affiché les détails d'un contact
  $(document).on("pageshow", "#details-page", function () {
    if (currentContact) {
      displayContactDetails();
      addActionButtons();
    }
  });
}

// Modification à apporter à onDeviceReady
// Ajoutez cet appel à la fin de la fonction onDeviceReady :
// initApp();
