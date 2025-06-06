document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = '/signin.html';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Add new scene
  document.getElementById('addSceneForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const scene = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      link: document.getElementById('link').value,
      isAvailable: document.getElementById('isAvailable').checked,
      featured: document.getElementById('featured').checked,
      images: document.getElementById('images').value.split(',').map(img => img.trim())
    };

    const res = await fetch('/api/admin/scenes', {
      method: 'POST',
      headers,
      body: JSON.stringify(scene)
    });

    if (res.ok) {
      alert('Scene added!');
      loadScenes();
    } else {
      alert('Failed to add scene');
    }
  });

  // Load all scenes
  async function loadScenes() {
    const res = await fetch('/api/admin/scenes', { headers });
    const scenes = await res.json();
    const list = document.getElementById('sceneList');
    list.innerHTML = '';
    scenes.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${s.title}</strong> (${s.featured ? '⭐' : ''}) - 
        ${s.isAvailable ? 'Available' : 'Unavailable'} 
        <button onclick="deleteScene('${s._id}')">Delete</button>
      `;
      list.appendChild(li);
    });
  }

  window.deleteScene = async (id) => {
    if (!confirm('Delete this scene?')) return;
    await fetch(`/api/admin/scenes/${id}`, {
      method: 'DELETE',
      headers
    });
    loadScenes();
  };

  loadScenes();
});
