document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/signin.html';
    return;
  }

  const cachedName = localStorage.getItem('userName') || 'User';
  const cachedPicture = localStorage.getItem('userPicture') || 'uploads/profile/default.png';
  document.getElementById('userName').textContent = cachedName;
  document.getElementById('userProfileImage').src = cachedPicture;

  showUserSection('featured');
});

function showUserSection(section) {
  const content = document.getElementById('userContent');
  content.innerHTML = '';

  switch (section) {
    case 'featured':
      content.innerHTML = `<h2>Featured Scenes</h2><div id="featuredScenes" class="scene-card-container">Loading...</div>`;
      loadScenes('/api/scenes/featured', 'featuredScenes');
      break;
    case 'favourites':
      content.innerHTML = `<h2>My Favourite Scenes</h2><div id="favouriteScenes" class="scene-card-container">Loading...</div>`;
      loadScenes('/api/users/favourites', 'favouriteScenes');
      break;
    case 'purchased':
      content.innerHTML = `<h2>Bought Scenes</h2><div id="purchasedScenes" class="scene-card-container">Loading...</div>`;
      loadScenes('/api/users/purchases', 'purchasedScenes');
      break;
  }
}

function loadScenes(apiUrl, containerId) {
  fetch(apiUrl, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      const featured = data.filter(scene => scene.featured);

      if (featured.length === 0) {
        container.innerHTML = '<p>No featured scenes available.</p>';
        return;
      }

      featured.forEach(scene => {
        const imagePath = scene.images?.[0] ? `/${scene.images[0]}` : 'assets/images/placeholder.png';
        const card = document.createElement('div');
        card.className = 'scene-card';
        card.innerHTML = `
          <img src="${imagePath}" alt="${scene.title}">
          <div class="scene-card-body">
            <h3>${scene.title}</h3>
            <p>${scene.description?.substring(0, 100) || ''}...</p>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Failed to load scenes:', err);
      document.getElementById(containerId).innerHTML = '<p>Error loading scenes.</p>';
    });
}
