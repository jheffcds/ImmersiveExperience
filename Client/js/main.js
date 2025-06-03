document.addEventListener('DOMContentLoaded', () => {
  // Modal Logic
  const openModalBtn = document.getElementById('openModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modal = document.getElementById('projectModal');
  const hero = document.querySelector('.hero-video');

  if (openModalBtn && closeModalBtn && modal && hero) {
    openModalBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      hero.classList.add('blurred');
    });

    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      hero.classList.remove('blurred');
    });
  }

  // Unmute Button Logic
  const unmuteBtn = document.getElementById('unmuteBtn');
  const introVideo = document.getElementById('introVideo');

  if (unmuteBtn && introVideo) {
    unmuteBtn.addEventListener('click', () => {
      introVideo.muted = false;
      introVideo.volume = 1.0;
      introVideo.currentTime = 0;
      introVideo.play().then(() => {
        unmuteBtn.style.display = 'none';
      }).catch((error) => {
        console.error('Autoplay with sound failed:', error);
      });
    });
  }

  // Redirect on View buttons
  const viewButtons = document.querySelectorAll('.view-scene');
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = 'scenes.html';
    });
  });

  // VR to Verity Logo Animation
  const logo = document.getElementById('logoText');
  if (logo) {
    setTimeout(() => {
      logo.innerHTML = `
        VERITY
      `;
    }, 2000);
  }
  document.getElementById('hamburger').addEventListener('click', function () {
  document.getElementById('navLinks').classList.toggle('active');
});

const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');

    signInTab.addEventListener('click', () => {
      signInForm.classList.remove('hidden');
      signUpForm.classList.add('hidden');
      signInTab.classList.add('active');
      signUpTab.classList.remove('active');
    });

    signUpTab.addEventListener('click', () => {
      signUpForm.classList.remove('hidden');
      signInForm.classList.add('hidden');
      signUpTab.classList.add('active');
      signInTab.classList.remove('active');
    });

    const signInEmail = document.getElementById('signInEmail');
    const signInPassword = document.getElementById('signInPassword');
    const signUpName = document.getElementById('signUpName');
    const signUpEmail = document.getElementById('signUpEmail');
    const signUpPassword = document.getElementById('signUpPassword');
    const signInError = document.getElementById('signInError');
    const signUpError = document.getElementById('signUpError');

    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      signInError.classList.add('hidden');
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signInEmail.value,
            password: signInPassword.value,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          signInError.textContent = data.message || 'Login failed';
          signInError.classList.remove('hidden');
          return;
        }
        // Login success - redirect or show message
        alert(`Welcome back, ${data.name}!`);
        // For example, redirect to dashboard
        window.location.href = '/dashboard.html';
      } catch (err) {
        signInError.textContent = 'Network error. Please try again.';
        signInError.classList.remove('hidden');
      }
    });

    signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signUpError.classList.add('hidden');

  // Check if passwords match
  if (signUpPassword.value !== signUpPasswordcopy.value) {
    signUpError.textContent = 'Passwords do not match';
    signUpError.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signUpName.value,
        email: signUpEmail.value,
        password: signUpPassword.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      signUpError.textContent = data.message || 'Signup failed';
      signUpError.classList.remove('hidden');
      return;
    }

    alert('Account created successfully! Please sign in.');
    signInTab.click();
  } catch (err) {
    signUpError.textContent = 'Network error. Please try again.';
    signUpError.classList.remove('hidden');
  }
});


});
