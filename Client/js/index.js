document.addEventListener('DOMContentLoaded', () => {
  // ================================
  // Modal Logic
  // ================================
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

  // ================================
  // Unmute Button Logic
  // ================================
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

  // ================================
  // Dynamic Scene Card Loading (explore.html)
  // ================================
  const projectCardsContainer = document.getElementById('exploreSceneCard');

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

          const price = parseFloat(scene.price) || 0;
          if (price === 0) {
            card.classList.add('free');
          } else {
            card.classList.add('paid');
          }
          const fullDescription = scene.description || 'No description available.';
          const shortDescription = fullDescription.length > 100
            ? fullDescription.slice(0, 100) + '...'
            : fullDescription;

          card.innerHTML = `
            <img src="${imageUrl}" alt="${scene.title || 'Scene'}" />
            <div class="card-content">
              <h3>${scene.title || 'Untitled Scene'}</h3>
              <p>${shortDescription}</p>
              <p><strong>Price:</strong> ${price === 0 ? 'Free' : `$${price.toFixed(2)}`}</p>
              <button class="btn view-scene" data-id="${scene._id}">View</button>
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
          const detailsContainer = document.getElementById('scene-details');
          if (detailsContainer) {
            const [storyEl, descEl] = detailsContainer.querySelectorAll('p');
            detailsContainer.querySelector('h1').textContent = scene.title || 'Untitled Scene';
            storyEl.innerHTML = `<strong>Story:</strong> ${scene.story || 'No story available.'}`;
            descEl.innerHTML = `<strong>Description:</strong> ${scene.description || 'No description available.'}`;
          }

          const gallery = document.querySelector('.gallery');
          if (gallery) {
            gallery.innerHTML = '';
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

          // ================================
          // Favourites Button Logic
          // ================================
          const favBtn = document.getElementById('favouriteBtn');
          const token = localStorage.getItem('token');

          if (favBtn) {
            if (token) {
              fetch('/api/favourites', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              .then(res => {
                if (!res.ok) throw new Error('Failed to fetch favourites');
                return res.json();
              })
              .then(data => {
                const isFav = data.favourites.includes(sceneId);
                favBtn.textContent = isFav ? '♥' : '♡';
                favBtn.classList.toggle('active', isFav);
              })
              .catch(err => {
                console.error('Error checking favourite status:', err);
              });
            }

            favBtn.addEventListener('click', () => {
              if (!token) {
                if (confirm('You must be logged in to favorite a scene. Go to login page?')) {
                  window.location.href = '/signin.html';
                }
                return;
              }

              fetch('/api/favourites', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sceneId })
              })
              .then(res => {
                if (!res.ok) throw new Error('Failed to toggle favourite');
                return res.json();
              })
              .then(data => {
                const isFavNow = data.favourites.includes(sceneId);
                favBtn.textContent = isFavNow ? '♥' : '♡';
                favBtn.classList.toggle('active', isFavNow);
              })
              .catch(err => {
                console.error('Favourite toggle failed:', err);
              });
            });
          }

          // ================================
          // === Add to Cart Logic ==========
          // ================================
          const price = parseFloat(scene.price) || 0;
          if (price > 0) {
            const addToCartBtn = document.querySelector('.experience-btn');
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.addEventListener('click', () => {
            if (!token) {
              alert("You must be logged in to access your cart.");
              window.location.href = "/signin.html";
              return;
            }
              const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
              const exists = cartItems.find(item => item._id === scene._id);
              if (!exists) {
                cartItems.push(scene._id);
                localStorage.setItem('cart', JSON.stringify(cartItems));
                const cartCount = document.getElementById('cart-count');
                if (cartCount) cartCount.textContent = cartItems.length;
                alert('Scene added to cart!');
              } else {
                alert('Scene is already in your cart.');
              }
            });

            // Append the button below the scene details
            const details = document.getElementById('scene-details');
            if (details) {
              details.appendChild(addToCartBtn);
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
