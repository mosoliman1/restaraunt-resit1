// js/restaurants.js
(function () {
  var grid = document.getElementById("restaurantsGrid");
  var searchInput = document.getElementById("searchInput");
  var refreshBtn = document.getElementById("refreshBtn");
  var logoutBtn = document.getElementById("logoutBtn");
  var statusText = document.getElementById("statusText");
  var pageLoader = document.getElementById("pageLoader");
  var allRestaurants = [];

  function setStatus(msg) {
    if (statusText) statusText.innerText = msg || "";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getRestaurantImage(name) {
    if (!name) return "images/restaurant-default.jpg";

    var key = String(name).toLowerCase().replace(/\s+/g, "");

    var map = {
      "pizzapalace": "images/pizzapalace.png",
      "mandopizzeria": "images/mandopizza.png",
      "nilegrill": "images/nilegrills.jpeg",
      "downtownburgers": "images/dtburgers.jpg",
      "lychee": "images/lychee.png",
      "sushisakura": "images/sushisakura.jpg",
      "tikkacorner": "images/tikka.jpeg",
      "pattini": "images/pattini.png",
      "alexseafoodhouse": "images/seafoodhouse.jpg"
    };

    return map[key] || "images/restaurant-default.jpg";
  }

  function logout() {
    API.request("/auth/logout", { method: "POST" })
      .catch(function () {})
      .finally(function () { window.location.href = "login.html"; });
  }

  function render(list) {
    if (!grid) return;

    grid.innerHTML = "";

    if (!list || list.length === 0) {
      grid.innerHTML =
        '<div class="col-12">' +
          '<div class="alert alert-info mb-0">No restaurants found.</div>' +
        "</div>";
      return;
    }

    list.forEach(function (r) {
      var id = r.restaurantId || r.id;
      var rawName = r.name || "Restaurant";

      var name = escapeHtml(rawName);
      var location = escapeHtml(r.location || "");
      var description = escapeHtml(r.description || "");
      var img = getRestaurantImage(rawName);

      var col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4 mb-3";

      col.innerHTML =
        '<div class="card restaurant-card h-100 p-3">' +
          '<img src="' + img + '" alt="Restaurant" class="img-fluid mb-2" ' +
            'style="width:100%;height:160px;object-fit:cover;border-radius:12px;" ' +
            'onerror="this.onerror=null;this.src=\'images/restaurant-default.jpg\';" />' +

          '<h5 class="mb-1">' + name + "</h5>" +
          (location ? '<div class="text-muted mb-2">' + location + "</div>" : "") +
          (description ? '<div class="small mb-3">' + description + "</div>" : "") +
          '<button class="btn btn-primary btn-sm viewBtn">View &amp; Reserve</button>' +
        "</div>";

      col.querySelector(".viewBtn").addEventListener("click", function () {
        if (id == null) {
          alert("Restaurant id missing from backend response.");
          return;
        }
        localStorage.setItem("selectedRestaurantId", String(id));
        window.location.href = "restaurant.html";
      });

      grid.appendChild(col);
    });
  }

  function applySearch() {
    var q = (searchInput && searchInput.value ? searchInput.value : "").toLowerCase().trim();

    if (!q) {
      render(allRestaurants);
      return;
    }

    var filtered = allRestaurants.filter(function (r) {
      var n = String(r.name || "").toLowerCase();
      var loc = String(r.location || "").toLowerCase();
      return n.indexOf(q) !== -1 || loc.indexOf(q) !== -1;
    });

    render(filtered);
  }

  function loadRestaurants() {
    setStatus("Loading...");

    API.request("/restaurants", { method: "GET" })
      .then(function (data) {
        var list =
          (data && Array.isArray(data.data)) ? data.data :
          (data && Array.isArray(data.restaurants)) ? data.restaurants :
          (Array.isArray(data)) ? data :
          [];

        allRestaurants = list;
        setStatus("Loaded: " + allRestaurants.length);
        applySearch();
      })
      .catch(function (err) {
        if (err && err.message === "NOT_AUTHORIZED") return;
        setStatus("");
        alert((err && err.message) || "Could not connect to backend. Is it running on port 3000?");
      });
  }

  if (searchInput) searchInput.addEventListener("input", applySearch);
  if (refreshBtn) refreshBtn.addEventListener("click", loadRestaurants);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  loadRestaurants();
})();
