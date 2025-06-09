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
      localStorage.clear();
      window.location.href = 'signin.html';
    });
  }

  // ================================
  // Dynamic Scene Card Loading (projects.html)
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

        projectCardsContainer.innerHTML = '';

        scenes.forEach(scene => {
          const card = document.createElement('div');
          card.className = 'project-card';

          const imagePath = scene.images?.[0] || '';
          const imageUrl = imagePath
            ? `/scenes/${imagePath.split('/').slice(1).join('/')}`
            : 'assets/images/fallback.jpg';

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

  // ================================
  // Scene Viewer Page (scenes.html)
  // ================================
  if (window.location.pathname.endsWith('scenes.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const sceneId = urlParams.get('id');

    if (sceneId) {
      fetch(`/api/scenes/${sceneId}`)
        .then(response => {
          if (!response.ok) throw new Error('Scene not found');
          return response.json();
        })
        .then(scene => {
          // Update scene text details
          const detailsContainer = document.getElementById('scene-details');
          if (detailsContainer) {
            const [storyEl, descEl] = detailsContainer.querySelectorAll('p');
            detailsContainer.querySelector('h1').textContent = scene.title || 'Untitled Scene';
            storyEl.innerHTML = `<strong>Story:</strong> ${scene.story || 'No story available.'}`;
            descEl.innerHTML = `<strong>Description:</strong> ${scene.description || 'No description available.'}`;
          }

          // Load images
          const gallery = document.querySelector('.gallery');
          if (gallery) {
            gallery.innerHTML = ''; // Clear old images
            if (Array.isArray(scene.images) && scene.images.length > 0) {
              scene.images.forEach(imagePath => {
                const imageUrl = `/scenes/${imagePath.split('/').slice(1).join('/')}`;
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${scene.title || 'Scene'} Image`;
                gallery.appendChild(img);
              });
            } else {
              gallery.innerHTML = '<p>No images available for this scene.</p>';
            }
          }
        })
        .catch(error => {
          console.error('Error loading scene:', error);
          const details = document.getElementById('scene-details');
          const images = document.getElementById('scene-images');
          if (details) details.innerHTML = '<p>Scene not found.</p>';
          if (images) images.innerHTML = '';
        });
    }
  }
});
