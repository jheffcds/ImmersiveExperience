// settings.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  const nameInput = document.getElementById('settingsName');
  const emailInput = document.getElementById('settingsEmail');
  const addressInput = document.getElementById('settingsAddress');

  // Load user data
  fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      nameInput.value = data.name || '';
      emailInput.value = data.email || '';
      addressInput.value = data.address || '';
    })
    .catch(err => console.error('Failed to load user info', err));

  // Form submit
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Update failed');

      const updated = await res.json();
      localStorage.setItem('userName', updated.name);
      localStorage.setItem('userPicture', updated.profilePicture);

      alert('Profile updated!');
      window.location.href = '/dashboard.html';
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  });

  // Change password
  document.getElementById('changePasswordBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/user/request-password-reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to send password reset email');
      alert('An email has been sent to change your password.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Delete account
  document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account?')) return;

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Deletion failed');
      localStorage.clear();
      alert('Account deleted');
      window.location.href = '/signin.html';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
  document.getElementById('profilePictureInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const preview = document.getElementById('profilePreview');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  }
});
});
