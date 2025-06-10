document.addEventListener('DOMContentLoaded', () => {
  // ================================
  // Auth-Based Navbar Rendering
  // ================================
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userPicture = localStorage.getItem('userPicture');
  const navLinks = document.getElementById('navLinks');

  if (navLinks) {
    navLinks.innerHTML = ''; // Clear current nav links if any

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

    if (token && userName) {
      const userRole = localStorage.getItem('userRole');
      const isAdmin = userRole === 'admin';

      const profileLi = document.createElement('li');
      profileLi.innerHTML = `<a href="${isAdmin ? 'adminDashboard.html' : 'dashboard.html'}">Profile</a>`;
      navLinks.appendChild(profileLi);

      const logoutLi = document.createElement('li');
      logoutLi.innerHTML = `<button id="logoutBtn" class="btn-secondary logout-btn">Logout</button>`;
      navLinks.appendChild(logoutLi);
    } else {
      const signInLi = document.createElement('li');
      signInLi.innerHTML = `<a id="signInBtn" href="signin.html">Sign In</a>`;
      navLinks.appendChild(signInLi);
    }
  }

  // Attach Logout Logic (dynamic)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logoutBtn') {
      localStorage.clear();
      window.location.href = 'signin.html';
    }
  });

  // ================================
  // VR to Verity Logo Animation
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
});
