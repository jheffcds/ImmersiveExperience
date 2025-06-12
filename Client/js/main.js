document.addEventListener('DOMContentLoaded', () => {
  // ================================
  // Auth-Based Navbar Rendering
  // ================================
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userPicture = localStorage.getItem('userPicture');
  const navLinks = document.getElementById('navLinks');

  if (navLinks) {
    navLinks.innerHTML = ''; // Clear current nav links

    // Common nav items
    const commonLinks = [
      { href: 'index.html', label: 'Home' },
      { href: 'explore.html', label: 'Explore' },
      { href: 'about.html', label: 'About' }
    ];

    commonLinks.forEach(link => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${link.href}">${link.label}</a>`;
      navLinks.appendChild(li);
    });

    // === Authenticated User ===
    if (token && userName) {
      const userRole = localStorage.getItem('userRole');
      const isAdmin = userRole === 'admin';

      // Cart Icon
      const cartLi = document.createElement('li');
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      cartLi.innerHTML = `
        <a href="cart.html" id="cartIcon">
          🛒 <span id="cart-count">${cartItems.length}</span>
        </a>
      `;
      navLinks.appendChild(cartLi);

      // Profile Link
      const profileLi = document.createElement('li');
      profileLi.innerHTML = `<a href="${isAdmin ? 'adminDashboard.html' : 'dashboard.html'}">Profile</a>`;
      navLinks.appendChild(profileLi);

      // Logout Button
      const logoutLi = document.createElement('li');
      logoutLi.innerHTML = `<button id="logoutBtn" class="btn-secondary logout-btn">Logout</button>`;
      navLinks.appendChild(logoutLi);
    }
    // === Guest User ===
    else {
      const signInLi = document.createElement('li');
      signInLi.innerHTML = `<a id="signInBtn" href="signin.html">Sign In</a>`;
      navLinks.appendChild(signInLi);
    }
  }

  // ================================
  // Logout Button Handler
  // ================================
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logoutBtn') {
      localStorage.clear();
      window.location.href = 'signin.html';
    }
  });

  // ================================
  // VR to VERITY Logo Animation
  // ================================
  const logo = document.getElementById('logoText');
  if (logo) {
    setTimeout(() => {
      logo.innerHTML = `VERITY`;
    }, 2000);
  }

  // ================================
  // Hamburger Menu Toggle
  // ================================
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('active');
    });
  }

  // ================================
  // Contact Us Button
  // ================================
  const contactBtn = document.getElementById('contactUsBtn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      window.location.href = 'contact.html';
    });
  }
});
