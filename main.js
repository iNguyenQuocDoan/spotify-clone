import httpRequest from "./utils/httpRequest.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });

  signupForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.querySelector("#signupEmail").value; // lấy cái value ở trong cái input
      const password = e.target.querySelector("#signupPassword").value; // lấy cái value ở trong cái input

      // xác thực thông tin đăng ký
      const credentials = {
        email,
        password,
      };

      try {
        const { user, access_token } = await httpRequest.post(
          "auth/register",
          credentials
        );
        localStorage.setItem("accessToken", access_token);

        // dong modal
        closeModal();
        location.reload(); // reload
      } catch (error) {
        if (error?.response?.error?.code === "EMAIL_EXISTS") {
          console.log(error.response.error.message);
        }
      }

      // console.log(user, access_token, "User Data");
    });

  loginForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.querySelector("#loginEmail").value;
      const password = e.target.querySelector("#loginPassword").value;

      const credentials = {
        email,
        password,
      };

      try {
        const { user, access_token } = await httpRequest.post(
          "auth/login",
          credentials
        );
        localStorage.setItem("accessToken", access_token);

        // dong modal
        closeModal();
        location.reload(); // reload
      } catch (error) {}
    });

  logoutBtn;
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", function () {
    // Close dropdown first
    userDropdown.classList.remove("show");

    console.log("Logout clicked");
    // TODO: Students will implement logout logic here
    localStorage.removeItem("accessToken");
    location.reload();
  });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
  const authButtons = document.querySelectorAll(".auth-buttons");
  const userMenu = document.querySelector(".user-menu");
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.querySelector("#userName");

  try {
    const { user } = await httpRequest.get("users/me");
    console.log(user, "User Data");
    // logged
    authButtons.forEach((btn) => (btn.style.display = "none"));
    if (userMenu) userMenu.style.display = "flex";

    if (userAvatar) {
      userAvatar.src =
        user.avatar_url ||
        "https://via.placeholder.com/32x32?text=" +
          (user.username?.charAt(0) || "U");
      userAvatar.alt = user.username || "User Avatar";
    }

    if (userName) {
      userName.textContent = user.username || "Anonymous";
    }
  } catch (error) {
    // not logged
    authButtons.forEach((btn) => (btn.style.display = "flex"));
    if (userMenu) userMenu.style.display = "none";
  }
});
