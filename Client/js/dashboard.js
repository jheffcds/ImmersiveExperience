document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('userName') || 'User';
  const picture = localStorage.getItem('userPicture') || 'uploads/profile/default.png';

  document.getElementById('userName').textContent = name;
  document.getElementById('userProfileImage').src = picture;

  showUserSection('featured'); // default view
});

function showUserSection(section) {
  const content = document.getElementById('userContent');
  content.innerHTML = '';

  switch (section) {
    case 'featured':
      content.innerHTML = `<h2>🌟 Featured Scenes</h2><div id="exploreSceneCards">Loading...</div>`;
      loadFeaturedScenes();
      break;

    case 'favourites':
      content.innerHTML = `<h2>❤️ My Favourite Scenes</h2><div id="exploreSceneCards">Loading...</div>`;
      loadFavouriteScenes();
      break;

    case 'purchased':
      content.innerHTML = `<h2>🛒 Purchased Scenes</h2><div id="exploreSceneCards">Loading...</div>`;
      purchasedScenes();
      break;
  }
}

function loadFeaturedScenes() {
  const container = document.getElementById('exploreSceneCards');

  fetch('/api/scenes', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';
      const featured = data.filter(scene => scene.featured);

      if (featured.length === 0) {
        container.innerHTML = '<p>No featured scenes available.</p>';
        return;
      }

      featured.forEach(scene => {
        const imagePath = scene.images?.[0] || '';
        const imageUrl = imagePath
        ? `/scenes/${imagePath.split('/').slice(1).join('/')}`
        : 'assets/images/fallback.jpg';
        const card = document.createElement('div');
        card.className = 'project-card';
        const price = parseFloat(scene.price) || 0;
        if (price === 0) {
          card.classList.add('free');
        } else {
          card.classList.add('paid');
        }
        const fullDescription = scene.description || 'No description available.';
        const shortDescription =
        fullDescription.length > 100
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
        container.appendChild(card);
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
      container.innerHTML = '<p>Error loading scenes.</p>';
      console.error(err);
    });
}
function loadFavouriteScenes() {
  const container = document.getElementById('exploreSceneCards');
  container.innerHTML = '<p>Loading your favourites...</p>';

  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = '<p>You must be logged in to view favourites.</p>';
    return;
  }

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
      const favIds = data.favourites;
      if (!favIds || favIds.length === 0) {
        container.innerHTML = '<p>You have no favourite scenes yet.</p>';
        return;
      }

      // Fetch each scene by ID
      Promise.all(favIds.map(id =>
        fetch(`/api/scenes/${id}`).then(res => {
          if (!res.ok) throw new Error('Scene not found');
          return res.json();
        })
      ))
        .then(favScenes => {
          container.innerHTML = '';

          favScenes.forEach(scene => {
            const imagePath = scene.images?.[0] || '';
            const imageUrl = imagePath
              ? `/scenes/${imagePath.split('/').slice(1).join('/')}`
              : 'assets/images/fallback.jpg';

            const card = document.createElement('div');
            card.className = 'project-card';

            const price = parseFloat(scene.price) || 0;
            card.classList.add(price === 0 ? 'free' : 'paid');

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

            container.appendChild(card);
          });

          const viewButtons = container.querySelectorAll('.view-scene');
          viewButtons.forEach(button => {
            button.addEventListener('click', () => {
              const sceneId = button.getAttribute('data-id');
              window.location.href = `scenes.html?id=${sceneId}`;
            });
          });
        })
        .catch(err => {
          console.error('Error loading favourite scenes:', err);
          container.innerHTML = '<p>Failed to load some favourite scenes.</p>';
        });
    })
    .catch(err => {
      console.error('Failed to fetch favourites:', err);
      container.innerHTML = '<p>Error loading favourites.</p>';
    });
}


