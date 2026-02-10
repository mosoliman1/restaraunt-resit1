// js/api.js
(function () {
  function isAuthPath(path) {
    return path.indexOf("/auth/login") === 0 || path.indexOf("/auth/signup") === 0;
  }

  function request(path, options) {
    options = options || {};
    options.method = options.method || "GET";
    options.headers = options.headers || {};
    options.credentials = "include";

    if (options.body && !options.headers["Content-Type"]) {
      options.headers["Content-Type"] = "application/json";
    }

    var url = window.APP_CONFIG.API_BASE + path;

    return fetch(url, options).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) {}

        // Handle 401/403:
        if (res.status === 401 || res.status === 403) {
          // If this was login/signup, do NOT redirect — just throw the backend message
          if (isAuthPath(path)) {
            var msgAuth =
              (data && (data.message || data.errorDetails || data.error_details)) ||
              "Invalid credentials";
            throw new Error(msgAuth);
          }

          // Otherwise: protected page session expired -> redirect to login
          if (!/login\.html$/i.test(location.pathname)) {
            alert("Session expired. Please login again.");
            location.href = "login.html";
          }
          throw new Error("NOT_AUTHORIZED");
        }

        if (!res.ok) {
          var msg =
            (data && (data.message || data.errorDetails || data.error_details)) ||
            ("Request failed (" + res.status + ")");
          throw new Error(msg);
        }

        return data;
      });
    });
  }

  window.API = { request: request };
})();
