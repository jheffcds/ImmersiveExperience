// profile-settings.js
export async function loadProfileSettingsModal() {
  // Load HTML dynamically and inject into body
  const res = await fetch('/partials/profile-settings.html');
  const modalHTML = await res.text();
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const token = localStorage.getItem('token');

  const nameInput = document.getElementById('settingsName');
  const emailInput = document.getElementById('settingsEmail');
  const addressInput = document.getElementById('settingsAddress');
  const userImg = document.getElementById('userProfileImage');
  const userName = document.getElementById('userName');

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    nameInput.value = data.name || '';
    emailInput.value = data.email || '';
    addressInput.value = data.address || '';
  } catch (err) {
    console.error('Failed to load user info into modal', err);
  }

  // Open modal
  document.querySelector('.sidebar a[href="#"]').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('hidden');
  });

  // Close modal
  document.getElementById('closeSettingsModal').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
  });

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

      userName.textContent = updated.name;
      userImg.src = updated.profilePicture;

      alert('Profile updated!');
      document.getElementById('settingsModal').classList.add('hidden');
    } catch (err) {
      alert('Update failed: ' + err.message);
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
}
