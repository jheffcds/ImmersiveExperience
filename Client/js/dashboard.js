document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch user info');

    const { name, profilePicture } = await res.json();

    // Optionally cache in localStorage
    localStorage.setItem('userName', name);
    localStorage.setItem('userPicture', profilePicture);

    // Update the DOM
    document.getElementById('userName').textContent = name || 'John Doe';
    document.getElementById('userProfileImage').src = profilePicture || 'uploads/profile/default.png';

  } catch (err) {
    console.error('Error loading user info:', err);
    document.getElementById('userName').textContent = 'John Doe';
    document.getElementById('userProfileImage').src = 'uploads/profile/default.png';
  }
});
