// js/signup.js
(function () {
  var form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nameEl = document.getElementById("signupName");
    var emailEl = document.getElementById("signupEmail");
    var passEl = document.getElementById("signupPassword");

    var name = (nameEl ? nameEl.value : "").trim();
    var email = (emailEl ? emailEl.value : "").trim();
    var password = (passEl ? passEl.value : "").trim();

    var valid = true;

    var nameErrEl = document.getElementById("nameErr");
    var emailErrEl = document.getElementById("signupEmailErr");
    var passErrEl = document.getElementById("signupPassErr");

    if (nameErrEl) nameErrEl.innerText = "";
    if (emailErrEl) emailErrEl.innerText = "";
    if (passErrEl) passErrEl.innerText = "";

    if (name.length < 2) {
      if (nameErrEl) nameErrEl.innerText = "Name too short";
      valid = false;
    }

    if (email.indexOf("@") === -1) {
      if (emailErrEl) emailErrEl.innerText = "Invalid email";
      valid = false;
    }

    if (password.length < 6) {
      if (passErrEl) passErrEl.innerText = "Min 6 characters";
      valid = false;
    }

    if (!valid) return;

    API.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: name, email: email, password: password })
    })
      .then(function (data) {
        // Your backend seems to return { success:true, ... } on success
        if (data && data.success) {
          alert("Signup successful! Now login.");
          window.location.href = "login.html";
          return;
        }

        // In case backend returns 200 with success:false
        var msg =
          (data && (data.errorDetails || data.error_details || data.message)) ||
          "Signup failed";
        alert(msg);
      })
      .catch(function (err) {
        if (err && err.message === "NOT_AUTHORIZED") return;
        alert((err && err.message) || "Could not connect to server. Is backend running on port 3000?");
      });
  });
})();
