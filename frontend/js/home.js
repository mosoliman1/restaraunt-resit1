// js/home.js
(function () {
  var welcomeText = document.getElementById("welcomeText");
  var statusText = document.getElementById("statusText");
  var logoutBtn = document.getElementById("logoutBtn");

  function setStatus(msg) {
    if (statusText) statusText.innerText = msg || "";
  }

  function loadProfile() {
    setStatus("Checking session...");

    API.request("/users/profile", { method: "GET" })
      .then(function (result) {
        // your backend returns: { success:true, data:{ name: ... } }
        if (!result || !result.success) {
          window.location.href = "login.html";
          return;
        }

        var name = (result.data && result.data.name) ? result.data.name : "User";
        if (welcomeText) welcomeText.innerText = "Welcome " + name;
        setStatus("");
      })
      .catch(function (err) {
        // api.js will redirect on 401/403 automatically
        if (err && err.message === "NOT_AUTHORIZED") return;
        setStatus("Could not reach backend on port 3000.");
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

  loadProfile();
})();
