(function () {
  var listEl = document.getElementById("reservationsList");
  var statusEl = document.getElementById("statusText");
  var logoutBtn = document.getElementById("logoutBtn");
  var addForm = document.getElementById("addRestaurantForm");
  var rNameInput = document.getElementById("rNameInput");
  var rLocationInput = document.getElementById("rLocationInput");
  var rDescriptionInput = document.getElementById("rDescriptionInput");

  function setStatus(msg) {
    if (statusEl) statusEl.innerText = msg || "";
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[c];
    });
  }

  function fetchAllReservations() {
    setStatus("Loading reservations...");

    return API.request("/admin/reservations", { method: "GET" })
      .then(function (body) {
        var rows =
          (body && Array.isArray(body.data)) ? body.data :
          (Array.isArray(body)) ? body :
          [];

        return rows;
      });
  }

  function sendDecision(id, status) {
    return API.request("/admin/reservations/" + encodeURIComponent(id) + "/decision", {
      method: "POST",
      body: JSON.stringify({ status: status })
    });
  }

  function addRestaurant(name, location, description) {
    return API.request("/admin/restaurants", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        location: location,
        description: description
      })
    });
  }

  function render(rows) {
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!rows.length) {
      listEl.innerHTML =
        '<div class="col-12">' +
          '<div class="alert alert-info mb-0">No reservations found.</div>' +
        '</div>';
      setStatus("Loaded 0 reservation(s)");
      return;
    }

    setStatus("Loaded " + rows.length + " reservation(s)");

    rows.forEach(function (r) {
      var rid = r.reservationId || r.id;

      var col = document.createElement("div");
      col.className = "col-12 mb-3";

      var statusText = r.status || "pending";

      col.innerHTML =
        '<div class="card bg-dark text-light" style="border-radius:14px;">' +
          '<div class="card-body">' +
            '<div class="d-flex justify-content-between flex-wrap" style="gap:10px;">' +
              '<div>' +
                '<div><b>Reservation ID:</b> ' + escapeHtml(rid) + '</div>' +
                '<div><b>User ID:</b> ' + escapeHtml(r.userId) + '</div>' +
                '<div><b>Restaurant ID:</b> ' + escapeHtml(r.restaurantId) + '</div>' +
                '<div><b>Date:</b> ' + escapeHtml(r.date) + ' <b>Time:</b> ' + escapeHtml(r.time) + '</div>' +
                '<div><b>Guests:</b> ' + escapeHtml(r.guests) + '</div>' +
                '<div><b>Status:</b> <span class="badge bg-secondary">' + escapeHtml(statusText) + '</span></div>' +
              '</div>' +
              '<div class="d-flex flex-column" style="gap:8px;min-width:160px;">' +
                '<button class="btn btn-success btn-sm js-accept">Accept</button>' +
                '<button class="btn btn-danger btn-sm js-decline">Decline</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      var acceptBtn = col.querySelector(".js-accept");
      var declineBtn = col.querySelector(".js-decline");

      function handleDecision(newStatus) {
        if (!confirm("Mark this reservation as " + newStatus + "?")) return;

        acceptBtn.disabled = true;
        declineBtn.disabled = true;

        sendDecision(rid, newStatus)
          .then(load)
          .catch(function (e) {
            alert(e.message || "Update failed");
            acceptBtn.disabled = false;
            declineBtn.disabled = false;
          });
      }

      acceptBtn.addEventListener("click", function () {
        handleDecision("accepted");
      });

      declineBtn.addEventListener("click", function () {
        handleDecision("declined");
      });

      listEl.appendChild(col);
    });
  }

  function load() {
    return fetchAllReservations()
      .then(render)
      .catch(function (e) {
        if (e && e.message === "NOT_AUTHORIZED") return;
        setStatus("Could not load reservations.");
        if (listEl) listEl.innerHTML = "";
      });
  }

  function logout() {
    API.request("/auth/logout", { method: "POST" })
      .catch(function () {})
      .finally(function () {
        window.location.href = "login.html";
      });
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (addForm) {
    addForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = rNameInput ? rNameInput.value.trim() : "";
      var location = rLocationInput ? rLocationInput.value.trim() : "";
      var description = rDescriptionInput ? rDescriptionInput.value.trim() : "";

      if (!name) {
        alert("Please enter a restaurant name.");
        return;
      }

      setStatus("Adding restaurant...");

      addRestaurant(name, location, description)
        .then(function () {
          setStatus("Restaurant added.");
          if (rNameInput) rNameInput.value = "";
          if (rLocationInput) rLocationInput.value = "";
          if (rDescriptionInput) rDescriptionInput.value = "";
        })
        .catch(function (e) {
          if (e && e.message === "NOT_AUTHORIZED") return;
          setStatus("");
          alert(e.message || "Could not add restaurant.");
        });
    });
  }

  load();
})();
