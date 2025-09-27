document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("togglePassword");
  const pwdInput = document.getElementById("password");

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener("click", function () {
      pwdInput.type = pwdInput.type === "password" ? "text" : "password";
    });
  }
});
