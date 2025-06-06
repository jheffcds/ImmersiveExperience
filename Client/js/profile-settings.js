document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  const nameInput = document.getElementById('settingsName');
  const emailInput = document.getElementById('settingsEmail');
  const addressInput = document.getElementById('settingsAddress');
  const profileInput = document.getElementById('profilePictureInput');

  const passwordModal = document.getElementById('passwordModal');
  const newPasswordInput = document.getElementById('newPassword');
  const repeatPasswordInput = document.getElementById('repeatPassword');
  const savePasswordBtn = document.getElementById('savePasswordBtn');
  const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');

  let originalData = {};

  // Load user data
  fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      nameInput.value = data.name || '';
      emailInput.value = data.email || '';
      addressInput.value = data.address || '';

      originalData = {
        name: data.name || '',
        email: data.email || '',
        address: data.address || ''
      };
    })
    .catch(err => console.error('Failed to load user info', err));

  // Form submit
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedFields = {};

    if (nameInput.value !== originalData.name) updatedFields.name = nameInput.value;
    if (emailInput.value !== originalData.email) updatedFields.email = emailInput.value;
    if (addressInput.value !== originalData.address) updatedFields.address = addressInput.value;

    const profilePictureFile = profileInput.files[0];
    if (profilePictureFile) {
      updatedFields.profilePicture = profilePictureFile;
    }

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes to update.");
      return;
    }

    const formData = new FormData();
    for (const key in updatedFields) {
      formData.append(key, updatedFields[key]);
    }

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
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

  // Handle Change Password Modal
  document.getElementById('changePasswordBtn').addEventListener('click', () => {
    passwordModal.classList.remove('hidden');
    newPasswordInput.value = '';
    repeatPasswordInput.value = '';
  });

  cancelPasswordBtn.addEventListener('click', () => {
    passwordModal.classList.add('hidden');
  });

  savePasswordBtn.addEventListener('click', async () => {
    const newPassword = newPasswordInput.value.trim();
    const repeatPassword = repeatPasswordInput.value.trim();

    if (!newPassword || !repeatPassword) {
      alert("Please fill in both password fields.");
      return;
    }

    if (newPassword !== repeatPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!res.ok) throw new Error('Password change failed');

      alert('Password updated successfully!');
      passwordModal.classList.add('hidden');
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

  // Profile picture preview
  profileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const preview = document.getElementById('profilePreview');
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    }
  });
});
