document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/signin.html'; // Redirect if not logged in
    return;
  }

  // Optional: decode JWT on frontend
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (err) {
      return null;
    }
  }

  const userInfo = parseJwt(token);
  if (!userInfo) {
    localStorage.removeItem('token');
    window.location.href = '/signin.html';
    return;
  }

  // Fetch user data from server (requires JWT middleware in backend)
  fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Invalid token');
      return res.json();
    })
    .then(user => {
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userProfileImage').src = user.profileImage || 'uploads/profile/default.png';

      renderScenes(user.preferredScenes, 'preferredScenes');
      renderScenes(user.boughtScenes, 'purchasedScenes');
    })
    .catch(err => {
      console.error('Auth error:', err);
      localStorage.removeItem('token');
      window.location.href = '/signin.html';
    });
});

function renderScenes(scenes, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!scenes || scenes.length === 0) {
    container.innerHTML = '<p>No scenes yet.</p>';
    return;
  }

  scenes.forEach(scene => {
    const item = document.createElement('div');
    item.classList.add('scene-item');
    item.innerHTML = `
      <img src="${scene.link}" alt="${scene.title}" />
      <p>${scene.title}</p>
    `;
    container.appendChild(item);
  });

}
