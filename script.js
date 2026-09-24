// INITIAL SEASONS DATA
const initialSeasons = [
    { id: 1, title: "Season 1", status: "Completed", regPassword: "114477", description: "", winner: "", registrations: [], points: [] },
    { id: 2, title: "Season 2", status: "Completed", regPassword: "114477", description: "", winner: "", registrations: [], points: [] },
    { id: 3, title: "Season 3", status: "Completed", regPassword: "114477", description: "", winner: "", registrations: [], points: [] },
    { id: 4, title: "Season 4", status: "Completed", regPassword: "114477", description: "", winner: "", registrations: [], points: [] },
    { id: 5, title: "Season 5", status: "Live / Registration Open", regPassword: "114477", description: "", winner: "", registrations: [], points: [] }
  ];
  
  let adminPassword = localStorage.getItem("ff_admin_password") || "1144";
  let tournamentData = JSON.parse(localStorage.getItem("ff_tournaments_v4")) || initialSeasons;
  let activeSeasonId = tournamentData[tournamentData.length - 1].id;
  
  function saveData() {
    localStorage.setItem("ff_tournaments_v4", JSON.stringify(tournamentData));
  }
  
  /* ================= CUSTOM MODAL POPUP SYSTEM ================= */
  let modalConfirmCallback = null;
  
  function showModal({ title, message, hasInput = false, inputPlaceholder = "Enter password", showCancel = false, onConfirm }) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-message").textContent = message;
  
    const inputContainer = document.getElementById("modal-input-container");
    const inputField = document.getElementById("modal-input-field");
    const cancelBtn = document.getElementById("modal-cancel-btn");
  
    if (hasInput) {
      inputContainer.classList.remove("hidden");
      inputField.value = "";
      inputField.placeholder = inputPlaceholder;
      setTimeout(() => inputField.focus(), 100);
    } else {
      inputContainer.classList.add("hidden");
    }
  
    if (showCancel) {
      cancelBtn.classList.remove("hidden");
    } else {
      cancelBtn.classList.add("hidden");
    }
  
    modalConfirmCallback = onConfirm;
    document.getElementById("custom-modal").classList.remove("hidden");
  }
  
  function closeModal() {
    document.getElementById("custom-modal").classList.add("hidden");
    modalConfirmCallback = null;
  }
  
  document.getElementById("modal-confirm-btn").onclick = () => {
    const inputValue = document.getElementById("modal-input-field").value.trim();
    if (modalConfirmCallback) {
      modalConfirmCallback(inputValue);
    } else {
      closeModal();
    }
  };
  
  /* ================= NAVIGATION & ADMIN PROTECTION ================= */
  function openAdminPasswordModal() {
    const adminPanel = document.getElementById("admin-panel");
    if (!adminPanel.classList.contains("hidden")) {
      return; // Already on admin panel
    }
  
    showModal({
      title: "🔒 Admin Access Required",
      message: "Please enter the admin password to access control panel:",
      hasInput: true,
      inputPlaceholder: "Enter password",
      showCancel: true,
      onConfirm: (pass) => {
        if (pass === adminPassword) {
          closeModal();
          switchTab('admin');
        } else {
          showModal({
            title: "❌ Access Denied",
            message: "Incorrect Admin Password!",
            hasInput: false,
            showCancel: false
          });
        }
      }
    });
  }
  
  function switchTab(tab) {
    const userPortal = document.getElementById("user-portal");
    const adminPanel = document.getElementById("admin-panel");
    const userBtn = document.getElementById("view-user-btn");
    const adminBtn = document.getElementById("view-admin-btn");
  
    if (tab === "user") {
      userPortal.classList.remove("hidden");
      adminPanel.classList.add("hidden");
      userBtn.classList.add("active-tab");
      adminBtn.classList.remove("active-tab");
      renderUserPortal();
    } else {
      userPortal.classList.add("hidden");
      adminPanel.classList.remove("hidden");
      adminBtn.classList.add("active-tab");
      userBtn.classList.remove("active-tab");
      renderAdminPanel();
    }
  }
  
  function changeAdminPassword(e) {
    e.preventDefault();
    const newPass = document.getElementById("new-admin-pass").value.trim();
    if (newPass) {
      adminPassword = newPass;
      localStorage.setItem("ff_admin_password", newPass);
      showModal({
        title: "✅ Success",
        message: "Admin Security Password Updated!",
        hasInput: false
      });
      document.getElementById("admin-pass-form").reset();
    }
  }
  
  /* ================= USER PORTAL ================= */
  function renderUserPortal() {
    const buttonContainer = document.getElementById("season-buttons");
    buttonContainer.innerHTML = "";
  
    tournamentData.forEach((season) => {
      const btn = document.createElement("button");
      btn.className = `season-btn ${season.id === activeSeasonId ? 'active' : ''}`;
      btn.textContent = season.title;
      btn.onclick = () => {
        activeSeasonId = season.id;
        renderUserPortal();
      };
      buttonContainer.appendChild(btn);
    });
  
    const season = tournamentData.find(s => s.id === activeSeasonId) || tournamentData[0];
    
    document.getElementById("season-title").textContent = season.title;
    document.getElementById("season-desc").textContent = season.description;
    document.getElementById("season-winner").textContent = season.winner || "TBD";
  
    const statusEl = document.getElementById("season-status");
    statusEl.textContent = season.status;
  
    const regSection = document.getElementById("registration-section");
    const winnerBox = document.getElementById("winner-container");
  
    if (season.status === "Completed") {
      statusEl.className = "badge badge-completed";
      regSection.style.display = "none";
      winnerBox.style.display = season.winner ? "block" : "none";
    } else {
      statusEl.className = "badge badge-live";
      regSection.style.display = "block";
      winnerBox.style.display = "none";
    }
  
    // Points Table
    const tbody = document.getElementById("user-points-tbody");
    tbody.innerHTML = "";
    const sortedPoints = [...(season.points || [])].sort((a, b) => b.total - a.total);
  
    if (sortedPoints.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No standings added for this season yet.</td></tr>`;
    } else {
      sortedPoints.forEach((p, idx) => {
        const row = `<tr>
          <td style="font-weight:bold; color: ${idx === 0 ? '#ffd700' : '#fff'};">#${idx + 1}</td>
          <td>${p.team}</td>
          <td>${p.kills}</td>
          <td>${p.booyah}</td>
          <td style="color:#39ff14; font-weight:bold;">${p.total}</td>
        </tr>`;
        tbody.innerHTML += row;
      });
    }
  }
  
  // REGISTRATION SUBMISSION WITH BEAUTIFUL POPUP
  function handleRegistration(e) {
    e.preventDefault();
  
    const teamName = document.getElementById("reg-team-name").value.trim();
    const leaderUid = document.getElementById("reg-leader-uid").value.trim();
    const whatsapp = document.getElementById("reg-whatsapp").value.trim();
    const enteredPass = document.getElementById("reg-password").value.trim();
  
    const season = tournamentData.find(s => s.id === activeSeasonId);
  
    const requiredPass = season.regPassword || "114477";
    if (enteredPass !== requiredPass) {
      showModal({
        title: "❌ Registration Failed",
        message: "Invalid Registration Password! Please ask admin for correct password.",
        hasInput: false
      });
      return;
    }
  
    if (!season.registrations) season.registrations = [];
  
    const exists = season.registrations.some(r => r.leaderUid === leaderUid || r.teamName.toLowerCase() === teamName.toLowerCase());
    if (exists) {
      showModal({
        title: "⚠️ Already Registered",
        message: "This Team Name or Leader FF UID is already registered for this season!",
        hasInput: false
      });
      return;
    }
  
    season.registrations.push({
      teamName,
      leaderUid,
      whatsapp,
      date: new Date().toLocaleDateString()
    });
  
    saveData();
  
    // SUCCESS POPUP
    showModal({
      title: "🎉 REGISTRATION SUCCESSFUL!",
      message: `Congratulations! Team "${teamName}" has been successfully registered for ${season.title}!`,
      hasInput: false
    });
  
    document.getElementById("team-register-form").reset();
  }
  
  /* ================= ADMIN PANEL FUNCTIONS ================= */
  function renderAdminPanel() {
    const select = document.getElementById("admin-season-select");
    select.innerHTML = "";
  
    tournamentData.forEach(season => {
      const opt = document.createElement("option");
      opt.value = season.id;
      opt.textContent = season.title;
      if (season.id === activeSeasonId) opt.selected = true;
      select.appendChild(opt);
    });
  
    loadAdminSeasonData();
  }
  
  function loadAdminSeasonData() {
    const selectId = parseInt(document.getElementById("admin-season-select").value);
    activeSeasonId = selectId;
    const season = tournamentData.find(s => s.id === selectId);
  
    if (!season) return;
  
    document.getElementById("admin-title").value = season.title;
    document.getElementById("admin-status").value = season.status;
    document.getElementById("admin-reg-pass").value = season.regPassword || "114477";
    document.getElementById("admin-desc").value = season.description;
    document.getElementById("admin-winner").value = season.winner || "";
  
    // Render Registered Teams
    const regTbody = document.getElementById("admin-reg-tbody");
    regTbody.innerHTML = "";
  
    if (!season.registrations || season.registrations.length === 0) {
      regTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No teams registered for this season yet.</td></tr>`;
    } else {
      season.registrations.forEach((r, idx) => {
        const row = `<tr>
          <td>${idx + 1}</td>
          <td><strong>${r.teamName}</strong></td>
          <td>${r.leaderUid}</td>
          <td><a href="https://wa.me/${r.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="color:#39ff14;">${r.whatsapp}</a></td>
          <td><button class="neon-btn btn-red" onclick="deleteRegistration(${idx})">X</button></td>
        </tr>`;
        regTbody.innerHTML += row;
      });
    }
  
    // Render Points Table Editor
    const pointsTbody = document.getElementById("admin-points-tbody");
    pointsTbody.innerHTML = "";
  
    (season.points || []).forEach((p, idx) => {
      const row = `<tr>
        <td><input type="text" value="${p.team}" class="adm-team"></td>
        <td><input type="number" value="${p.kills}" class="adm-kills"></td>
        <td><input type="number" value="${p.booyah}" class="adm-booyah"></td>
        <td><input type="number" value="${p.total}" class="adm-total"></td>
        <td><button class="neon-btn btn-red" onclick="removeTeamRow(${idx})">X</button></td>
      </tr>`;
      pointsTbody.innerHTML += row;
    });
  }
  
  function saveSeasonDetails(e) {
    e.preventDefault();
    const season = tournamentData.find(s => s.id === activeSeasonId);
  
    if (season) {
      season.title = document.getElementById("admin-title").value;
      season.status = document.getElementById("admin-status").value;
      season.regPassword = document.getElementById("admin-reg-pass").value.trim();
      season.description = document.getElementById("admin-desc").value;
      season.winner = document.getElementById("admin-winner").value;
  
      saveData();
      showModal({
        title: "💾 Saved",
        message: "Season Details and Registration Password updated!",
        hasInput: false
      });
      renderUserPortal();
    }
  }
  
  function deleteRegistration(index) {
    const season = tournamentData.find(s => s.id === activeSeasonId);
    season.registrations.splice(index, 1);
    saveData();
    loadAdminSeasonData();
  }
  
  function downloadRegistrationsCSV() {
    const season = tournamentData.find(s => s.id === activeSeasonId);
    if (!season.registrations || season.registrations.length === 0) {
      showModal({ title: "⚠️ Empty", message: "No registrations available to export!", hasInput: false });
      return;
    }
  
    let csvContent = "data:text/csv;charset=utf-8,S.No,Team Name,Leader FF UID,WhatsApp Number,Date\n";
    season.registrations.forEach((r, idx) => {
      csvContent += `${idx + 1},"${r.teamName}","${r.leaderUid}","${r.whatsapp}","${r.date || ''}"\n`;
    });
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${season.title.replace(/\s+/g, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  function addTeamRow() {
    const tbody = document.getElementById("admin-points-tbody");
    const row = `<tr>
      <td><input type="text" value="New Team" class="adm-team"></td>
      <td><input type="number" value="0" class="adm-kills"></td>
      <td><input type="number" value="0" class="adm-booyah"></td>
      <td><input type="number" value="0" class="adm-total"></td>
      <td><button class="neon-btn btn-red" onclick="this.closest('tr').remove()">X</button></td>
    </tr>`;
    tbody.innerHTML += row;
  }
  
  function removeTeamRow(index) {
    const season = tournamentData.find(s => s.id === activeSeasonId);
    season.points.splice(index, 1);
    loadAdminSeasonData();
  }
  
  function savePointsTable() {
    const season = tournamentData.find(s => s.id === activeSeasonId);
    const teams = document.querySelectorAll(".adm-team");
    const kills = document.querySelectorAll(".adm-kills");
    const booyahs = document.querySelectorAll(".adm-booyah");
    const totals = document.querySelectorAll(".adm-total");
  
    const updatedPoints = [];
    teams.forEach((tInput, idx) => {
      if (tInput.value.trim() !== "") {
        updatedPoints.push({
          team: tInput.value,
          kills: parseInt(kills[idx].value) || 0,
          booyah: parseInt(booyahs[idx].value) || 0,
          total: parseInt(totals[idx].value) || 0
        });
      }
    });
  
    season.points = updatedPoints;
    saveData();
    showModal({ title: "📊 Saved", message: "Points Table updated successfully!", hasInput: false });
  }
  
  function addNewSeasonPrompt() {
    showModal({
      title: "➕ Create New Season",
      message: "Set a registration password for this new season:",
      hasInput: true,
      inputPlaceholder: "Enter password",
      showCancel: true,
      onConfirm: (regPass) => {
        if (!regPass) return;
        const newId = tournamentData.length + 1;
        const newSeason = {
          id: newId,
          title: `Season ${newId}`,
          status: "Live / Registration Open",
          regPassword: regPass,
          description: "",
          winner: "",
          registrations: [],
          points: []
        };
  
        tournamentData.push(newSeason);
        activeSeasonId = newId;
        saveData();
        closeModal();
        renderAdminPanel();
      }
    });
  }
  
  // Initial Load
  renderUserPortal();
