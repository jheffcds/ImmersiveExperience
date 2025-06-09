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
      content.innerHTML = `<h2>🌟 Featured Scenes</h2><div id="featuredContainer" class="scene-card-container">Loading...</div>`;
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
  const container = document.getElementById('featuredContainer');

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
      container.innerHTML = '<p>Error loading scenes.</p>';
      console.error(err);
    });
}
