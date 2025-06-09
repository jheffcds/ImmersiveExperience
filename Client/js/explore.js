document.addEventListener('DOMContentLoaded', () => {
  const sceneContainer = document.getElementById('exploreSceneCards');

  if (!sceneContainer) return;

  fetch('/api/scenes')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch scenes');
      return response.json();
    })
    .then(scenes => {
      if (!Array.isArray(scenes) || scenes.length === 0) {
        sceneContainer.innerHTML = '<p>No scenes available at the moment.</p>';
        return;
      }

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

        sceneContainer.appendChild(card);
      });

      document.querySelectorAll('.view-scene').forEach(button => {
        button.addEventListener('click', () => {
          const sceneId = button.getAttribute('data-id');
          window.location.href = `scenes.html?id=${sceneId}`;
        });
      });
    })
    .catch(error => {
      console.error('Error loading explore scenes:', error);
      sceneContainer.innerHTML = '<p>Unable to load scenes. Please try again later.</p>';
    });
});
