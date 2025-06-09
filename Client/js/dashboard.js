document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/signin.html';
    return;
  }

  // Load from localStorage immediately for fast UI
  const cachedName = localStorage.getItem('userName') || 'John Doe';
  const cachedPicture = localStorage.getItem('userPicture') || 'uploads/profile/default.png';
  document.getElementById('userName').textContent = cachedName;
  document.getElementById('userProfileImage').src = cachedPicture;

  // Then fetch fresh data from backend if needed
  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch user info');

    const { name, profilePicture } = await res.json();

    localStorage.setItem('userName', name);
    localStorage.setItem('userPicture', profilePicture);
    localStorage.setItem('userRole', user.role);

    document.getElementById('userName').textContent = name || 'John Doe';
    document.getElementById('userProfileImage').src = profilePicture || 'uploads/profile/default.png';

  } catch (err) {
    console.error('Error loading user info:', err);
  }

});
