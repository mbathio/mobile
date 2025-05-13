// Function to backup all data
function backupData() {
  const content = JSON.stringify(db, null, 2);
  const filename = `contact-manager-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  const mimeType = "application/json";

  // Create a blob and download link
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);

  showAlert("Sauvegarde créée avec succès", "success");
}

// Function to restore from backup
function restoreFromBackup() {
  const fileInput = document.getElementById("restore-file");
  const file = fileInput.files[0];

  if (!file) {
    showAlert("Veuillez sélectionner un fichier de sauvegarde", "danger");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Validate data structure
      if (!data.contacts || !data.groups || !data.favorites || !data.recents) {
        throw new Error("Format de fichier invalide");
      }

      // Restore data
      db = data;
      saveToLocalStorage();
      updateUI();

      showAlert("Données restaurées avec succès", "success");
      fileInput.value = "";
    } catch (error) {
      showAlert("Erreur lors de la restauration : " + error.message, "danger");
    }
  };

  reader.readAsText(file);
}

// Function to clear all data
function clearAllData() {
  db = {
    contacts: [],
    groups: [],
    favorites: [],
    recents: [],
    settings: {
      theme: "light",
      language: "fr",
    },
  };

  saveToLocalStorage();
  updateUI();

  closeModal("clear-data-modal");
  showAlert("Toutes les données ont été effacées", "success");
}

// Function to switch between tabs
function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabId).classList.add("active");

  // Update nav buttons
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("active");
  });

  // Find the corresponding nav button and set it active
  const navButtons = {
    "home-tab": "nav-home",
    "contacts-tab": "nav-contacts",
    "groups-tab": "nav-groups",
    "import-export-tab": "nav-import-export",
    "settings-tab": "nav-settings",
  };

  const navButton = document.getElementById(navButtons[tabId]);
  if (navButton) {
    navButton.classList.add("active");
  }
}

// Function to apply theme
function applyTheme() {
  const theme = db.settings.theme;

  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else if (theme === "light") {
    document.body.classList.remove("dark-theme");
  } else if (theme === "system") {
    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }
}

// Fonctions du fichier index.js
// Ajouter les boutons d'action sur la page de détails
function addActionButtons() {
  if (!currentContact) return;

  // Create the action buttons
  const actionButtons = document.createElement("div");
  actionButtons.className = "action-buttons";
  actionButtons.innerHTML = `
        <a href="tel:${currentContact.phone}" id="call-btn" class="action-btn">
            <div class="action-icon">📞</div>
            <span>Appeler</span>
        </a>
        <a href="sms:${currentContact.phone}" id="sms-btn" class="action-btn">
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
    `;

  // Ajouter les boutons au modal de détails du contact
  const modal = document.querySelector("#view-contact-modal .modal-content");

  // Check if action buttons already exist
  if (!modal.querySelector(".action-buttons")) {
    modal.insertBefore(
      actionButtons,
      document.getElementById("view-contact-notes").parentNode.nextSibling
    );
  }

  // Gestionnaire pour le bouton de partage
  document.getElementById("share-btn").addEventListener("click", function (e) {
    e.preventDefault();
    shareContact();
  });
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
                    <div style="font-size: 48px; margin-bottom: 10px;">👤</div>
                    <h2 style="margin: 0; font-size: 20px;">${
                      currentContact.name
                    }</h2>
                    <div style="font-size: 14px; color: #666;">${
                      db.groups.find((g) => g.id === currentContact.groupId)
                        ?.name || ""
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
  document.body.insertAdjacentHTML("beforeend", cardHtml);

  // Gestionnaire pour le bouton de fermeture
  document.getElementById("close-card").addEventListener("click", function () {
    this.closest("div").parentElement.remove();
  });

  // Gestionnaire pour le bouton de copie
  document
    .getElementById("copy-contact")
    .addEventListener("click", function () {
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
      document.getElementById("close-card").click();
    });
}

// Fonction pour améliorer la recherche avec recherche en temps réel
function enhanceSearch() {
  // Améliorer la recherche pour inclure la recherche phonétique
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();

      // Si le terme de recherche est vide, afficher tous les contacts
      if (!searchTerm) {
        updateContactsTables();
        return;
      }

      // Filtrer avec recherche améliorée
      let filteredContacts = [...db.contacts];

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
                newValue =
                  Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
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
      filteredContacts = filteredContacts.filter((contact) => {
        // Correspondance exacte dans le nom, téléphone ou email
        if (
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.phone.includes(searchTerm) ||
          (contact.email && contact.email.toLowerCase().includes(searchTerm))
        ) {
          return true;
        }

        // Correspondance approximative dans le nom
        const nameSimilarity = similarity(
          searchTerm,
          contact.name.toLowerCase()
        );
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

      // Mettre à jour la table des contacts avec les résultats filtrés
      updateContactsTable("contacts-table-body", filteredContacts.slice(0, 5));
    });
  }
}

// Initialisation de l'application
function init() {
  // Load data from localStorage
  loadFromLocalStorage();

  // Tab navigation
  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("home-tab");
  });

  document.getElementById("nav-contacts").addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("contacts-tab");
  });

  document.getElementById("nav-groups").addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("groups-tab");
  });

  document
    .getElementById("nav-import-export")
    .addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("import-export-tab");
    });

  document.getElementById("nav-settings").addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("settings-tab");
  });

  // Add contact button
  document.getElementById("add-contact-btn").addEventListener("click", () => {
    openModal("add-contact-modal");
  });

  // Add contact form submission
  document
    .getElementById("add-contact-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const newContact = {
        name: document.getElementById("contact-name").value,
        phone: document.getElementById("contact-phone").value,
        email: document.getElementById("contact-email").value,
        address: document.getElementById("contact-address").value,
        groupId: document.getElementById("contact-group").value
          ? parseInt(document.getElementById("contact-group").value)
          : null,
        notes: document.getElementById("contact-notes").value,
      };

      addContact(newContact);
      closeModal("add-contact-modal");
      document.getElementById("add-contact-form").reset();
    });

  // Cancel add contact
  document
    .getElementById("cancel-add-contact")
    .addEventListener("click", () => {
      closeModal("add-contact-modal");
      document.getElementById("add-contact-form").reset();
    });

  // Edit contact form submission
  document
    .getElementById("edit-contact-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const id = parseInt(document.getElementById("edit-contact-id").value);
      const updatedContact = {
        name: document.getElementById("edit-contact-name").value,
        phone: document.getElementById("edit-contact-phone").value,
        email: document.getElementById("edit-contact-email").value,
        address: document.getElementById("edit-contact-address").value,
        groupId: document.getElementById("edit-contact-group").value
          ? parseInt(document.getElementById("edit-contact-group").value)
          : null,
        notes: document.getElementById("edit-contact-notes").value,
      };

      updateContact(id, updatedContact);
      closeModal("edit-contact-modal");
    });

  // Cancel edit contact
  document
    .getElementById("cancel-edit-contact")
    .addEventListener("click", () => {
      closeModal("edit-contact-modal");
    });

  // Add group button
  document.getElementById("add-group-btn").addEventListener("click", () => {
    openModal("add-group-modal");
  });

  // Add group form submission
  document.getElementById("add-group-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const newGroup = {
      name: document.getElementById("group-name").value,
      color: document.getElementById("group-color").value,
      description: document.getElementById("group-description").value,
    };

    addGroup(newGroup);
    closeModal("add-group-modal");
    document.getElementById("add-group-form").reset();
  });

  // Cancel add group
  document.getElementById("cancel-add-group").addEventListener("click", () => {
    closeModal("add-group-modal");
    document.getElementById("add-group-form").reset();
  });

  // Delete confirmation
  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", () => {
      const contactId = parseInt(
        document.getElementById("confirm-delete-btn").dataset.id
      );
      deleteContact(contactId);
      closeModal("confirm-delete-modal");
    });

  // Cancel delete
  document.getElementById("cancel-delete").addEventListener("click", () => {
    closeModal("confirm-delete-modal");
  });

  // Export button
  document
    .getElementById("export-btn")
    .addEventListener("click", exportContacts);

  // Backup button
  document.getElementById("backup-btn").addEventListener("click", backupData);

  // Restore button
  document
    .getElementById("restore-btn")
    .addEventListener("click", restoreFromBackup);

  // Clear data button
  document.getElementById("clear-data-btn").addEventListener("click", () => {
    openModal("clear-data-modal");
  });

  // Confirm clear data
  document
    .getElementById("confirm-clear-data-btn")
    .addEventListener("click", clearAllData);

  // Cancel clear data
  document.getElementById("cancel-clear-data").addEventListener("click", () => {
    closeModal("clear-data-modal");
  });

  // Close view contact
  document
    .getElementById("close-view-contact")
    .addEventListener("click", () => {
      closeModal("view-contact-modal");
    });

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      modal.style.display = "none";
    });
  });

  // Filter contacts by group
  document
    .getElementById("group-filter")
    .addEventListener("change", function () {
      const groupId = this.value;

      let filteredContacts = [...db.contacts];

      if (groupId !== "all") {
        filteredContacts = filteredContacts.filter(
          (c) => c.groupId === parseInt(groupId)
        );
      }

      updateContactsTable("all-contacts-table", filteredContacts);
    });

  // Search contacts
  document
    .getElementById("contacts-search")
    .addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();

      let filteredContacts = [...db.contacts];

      if (searchTerm) {
        filteredContacts = filteredContacts.filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.phone.includes(searchTerm) ||
            (c.email && c.email.toLowerCase().includes(searchTerm)) ||
            (c.address && c.address.toLowerCase().includes(searchTerm)) ||
            (c.notes && c.notes.toLowerCase().includes(searchTerm))
        );
      }

      updateContactsTable("all-contacts-table", filteredContacts);
    });

  // Theme selection
  document
    .getElementById("theme-select")
    .addEventListener("change", function () {
      db.settings.theme = this.value;
      saveToLocalStorage();
      applyTheme();
    });

  // Initialize theme
  document.getElementById("theme-select").value = db.settings.theme;
  applyTheme();

  // Améliorer la recherche
  enhanceSearch();

  // Gestionnaire pour ajouter les boutons d'action lors de l'affichage des détails d'un contact
  document.querySelector(".btn-view")?.addEventListener("click", function () {
    setTimeout(() => {
      addActionButtons();
    }, 300);
  });
}

// Initialize the app
document.addEventListener("DOMContentLoaded", init);
