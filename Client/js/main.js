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

});
