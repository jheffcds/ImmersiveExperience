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
      content.innerHTML = `<h2>🌟 Featured Scenes</h2><div id="exploreSceneCards" class="scene-card-container">Loading...</div>`;
      loadFeaturedScenes();
      break;

    case 'favourites':
      content.innerHTML = `<h2>❤️ My Favourite Scenes</h2><div class="scene-card-container">Coming soon...</div>`;
      break;

    case 'purchased':
      content.innerHTML = `<h2>🛒 Purchased Scenes</h2><div class="scene-card-container">Coming soon...</div>`;
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
    })
    .catch(err => {
      container.innerHTML = '<p>Error loading scenes.</p>';
      console.error(err);
    });
}
