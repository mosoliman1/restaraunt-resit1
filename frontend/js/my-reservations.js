// js/my-reservations.js
(function () {
  var listEl = document.getElementById("reservationsList");
  var statusEl = document.getElementById("status");
  var logoutBtn = document.getElementById("logoutBtn");

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

  function fetchMyReservations() {
    setStatus("Loading...");

    return API.request("/reservations/mine", { method: "GET" })
      .then(function (body) {
        // HANDLE ALL BACKEND SHAPES SAFELY
        var rows =
          (body && Array.isArray(body.data)) ? body.data :
          (body && body.data && Array.isArray(body.data.data)) ? body.data.data :
          (body && Array.isArray(body.reservations)) ? body.reservations :
          (Array.isArray(body)) ? body :
          [];

        return rows;
      });
  }

  function cancelReservation(id) {
    return API.request("/reservations/" + encodeURIComponent(id), {
      method: "DELETE"
    });
  }

  function render(rows) {
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!rows.length) {
      listEl.innerHTML =
        '<div class="alert alert-info">No reservations found.</div>';
      setStatus("Loaded 0 reservation(s)");
      return;
    }

    setStatus("Loaded " + rows.length + " reservation(s)");

    rows.forEach(function (r) {
      // SUPPORT id OR reservationId
      var rid = r.reservationId || r.id;

      var card = document.createElement("div");
      card.className = "card bg-dark text-light mb-3";
      card.style.borderRadius = "16px";

      card.innerHTML =
        '<div class="card-body">' +
          '<h3 class="card-title mb-1">' +
            escapeHtml(r.restaurantName || r.name || "Restaurant") +
          '</h3>' +
          '<div class="mb-2 opacity-75">' +
            escapeHtml(r.restaurantLocation || r.location || "") +
          '</div>' +
          '<div><b>Date:</b> ' + escapeHtml(r.date) + '</div>' +
          '<div><b>Time:</b> ' + escapeHtml(r.time) + '</div>' +
          '<div><b>Guests:</b> ' + escapeHtml(r.guests) + '</div>' +
          '<button class="btn btn-danger btn-block mt-3">Cancel</button>' +
        '</div>';

      var btn = card.querySelector("button");

      btn.addEventListener("click", function () {
        if (!confirm("Cancel this reservation?")) return;

        btn.disabled = true;
        btn.innerText = "Cancelling...";

        cancelReservation(rid)
          .then(load)
          .catch(function (e) {
            alert(e.message || "Cancel failed");
            btn.disabled = false;
            btn.innerText = "Cancel";
          });
      });

      listEl.appendChild(card);
    });
  }

  function load() {
    return fetchMyReservations()
      .then(render)
      .catch(function (e) {
        if (e && e.message === "NOT_AUTHORIZED") return;
        setStatus("Could not connect to backend.");
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

  load();
})();
