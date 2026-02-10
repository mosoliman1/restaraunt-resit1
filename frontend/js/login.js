// js/login.js
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  var email = document.getElementById("loginEmail").value.trim();
  var password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  API.request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email, password: password })
  })
    .then(function () {
      alert("Login successful");
      window.location.href = "home.html";
    })
    .catch(function (err) {
      // If NOT_AUTHORIZED happens here, it means bad credentials or auth rules
      if (err && err.message === "NOT_AUTHORIZED") return;
      alert((err && err.message) || "Could not connect to server. Try again later.");
    });
});
