// js/restaurant.js
(function () {
  var rName = document.getElementById("rName");
  var rMeta = document.getElementById("rMeta");
  var statusText = document.getElementById("statusText");
  var logoutBtn = document.getElementById("logoutBtn");

  var reserveForm = document.getElementById("reserveForm");
  var resDate = document.getElementById("resDate");
  var resTime = document.getElementById("resTime");
  var guests = document.getElementById("guests");

  var restaurantId = localStorage.getItem("selectedRestaurantId");

  function setStatus(msg) {
    if (statusText) statusText.innerText = msg || "";
  }

  function logout() {
    API.request("/auth/logout", { method: "POST" })
      .catch(function () {})
      .finally(function () { window.location.href = "login.html"; });
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  if (!restaurantId) {
    alert("No restaurant selected. Please choose a restaurant first.");
    window.location.href = "restaurants.html";
    return;
  }

  function loadRestaurantInfo() {
    setStatus("Loading restaurant...");

    API.request("/restaurants", { method: "GET" })
      .then(function (data) {
        var list = (data && Array.isArray(data.data)) ? data.data : [];
        var found = null;

        for (var i = 0; i < list.length; i++) {
          var x = list[i];
          if (String(x.restaurantId || x.id) === String(restaurantId)) {
            found = x;
            break;
          }
        }

        if (found) {
  if (rName) rName.innerText = found.name || "Restaurant";
  if (rMeta) rMeta.innerText = (found.location ? found.location + " • " : "") + (found.description || "");
  setStatus("");
}
else {
          if (rName) rName.innerText = "Restaurant";
          if (rMeta) rMeta.innerText = "Could not load restaurant info.";
        }
      })
      .catch(function (err) {
        // allow reservation to still work even if info fails
        if (err && err.message === "NOT_AUTHORIZED") return;
      });
  }

  loadRestaurantInfo();

  if (!reserveForm) return;

  reserveForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var dateVal = resDate.value;
    var timeVal = resTime.value;
    var guestsVal = parseInt(guests.value, 10);

    if (!dateVal || !timeVal || !guestsVal) {
      alert("Please fill all fields.");
      return;
    }

    setStatus("Submitting reservation...");

    API.request("/reservations", {
      method: "POST",
      body: JSON.stringify({
        restaurantId: Number(restaurantId),
        date: dateVal,
        time: timeVal,
        guests: guestsVal
      })
    })
      .then(function () {
        setStatus("");
        alert("✅ Reservation created!");
        window.location.href = "my-reservations.html";
      })
      .catch(function (err) {
        if (err && err.message === "NOT_AUTHORIZED") return;
        setStatus("");
        alert((err && err.message) || "Could not connect to backend.");
      });
  });
})();
