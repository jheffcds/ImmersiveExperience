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

  // VR to Verity Logo Animation
  const logo = document.getElementById('logoText');
  if (logo) {
    setTimeout(() => {
      logo.innerHTML = `VERITY`;
    }, 2000);
  }

  // Hamburger Menu Toggle
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('active');
    });
  }

  // Logout Button Logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear(); // Remove all stored user data
      window.location.href = 'signin.html'; // Redirect to login
    });
  }

  // ================================
  // Dynamic Scene Card Loading
  // ================================
  const projectCardsContainer = document.getElementById('projectCardsContainer');

  if (projectCardsContainer) {
    fetch('/api/scenes')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch scenes');
        return response.json();
      })
      .then(scenes => {
        if (!Array.isArray(scenes)) return;

        projectCardsContainer.innerHTML = ''; // Clear any placeholders

        scenes.forEach(scene => {
          const card = document.createElement('div');
          card.className = 'project-card';

          const imageUrl = scene.images?.[0]
            ? `/uploads/${scene.images[0]}`
            : 'assets/images/fallback.jpg'; // Fallback if no image

          card.innerHTML = `
            <img src="${imageUrl}" alt="${scene.title || 'Scene'}" />
            <div class="card-content">
              <h3>${scene.title || 'Untitled Scene'}</h3>
              <p>${scene.description || 'No description available.'}</p>
              <button class="card-btn view-scene" data-id="${scene._id}">View</button>
            </div>
          `;

          projectCardsContainer.appendChild(card);
        });

        // Re-bind View buttons after insertion
        const viewButtons = document.querySelectorAll('.view-scene');
        viewButtons.forEach(button => {
          button.addEventListener('click', () => {
            const sceneId = button.getAttribute('data-id');
            window.location.href = `scenes.html?id=${sceneId}`;
          });
        });
      })
      .catch(err => {
        console.error('Error loading scenes:', err);
        projectCardsContainer.innerHTML = '<p>Failed to load scenes. Please try again later.</p>';
      });
  }
});
