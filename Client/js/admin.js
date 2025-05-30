document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const message = document.getElementById('formMessage');

  if (!token) {
    return (window.location.href = '/signin.html');
  }

  // Verify token and check if user is admin
  fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(user => {
      if (user.role !== 'admin') {
        alert('Access denied: Admins only.');
        window.location.href = '/dashboard.html';
      }
    })
    .catch(err => {
      console.error(err);
      window.location.href = '/signin.html';
    });

  // Handle form submission
  const form = document.getElementById('addSceneForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const scene = {
      title: document.getElementById('sceneTitle').value,
      description: document.getElementById('sceneDescription').value,
      link: document.getElementById('sceneLink').value,
      isAvailable: document.getElementById('isAvailable').checked
    };

    try {
      const res = await fetch('/api/scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scene)
      });

      const data = await res.json();

      if (res.ok) {
        message.textContent = 'Scene added successfully!';
        message.style.color = 'green';
        form.reset();
      } else {
        message.textContent = data.message || 'Failed to add scene';
        message.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      message.textContent = 'Server error';
      message.style.color = 'red';
    }
  });

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/signin.html';
  });
});
