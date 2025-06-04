// profile-settings.js
function loadProfileSettingsModal() {
  fetch('/partials/profile-settings.html')
    .then(res => res.text())
    .then(async (modalHTML) => {
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      const token = localStorage.getItem('token');

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        document.getElementById('settingsName').value = data.name || '';
        document.getElementById('settingsEmail').value = data.email || '';
        document.getElementById('settingsAddress').value = data.address || '';
      } catch (err) {
        console.error('Failed to load user info into modal', err);
      }

      // Open modal
      document.getElementById('settingsModal').classList.remove('hidden');

      // Close modal
      document.getElementById('closeSettingsModal').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
      });

      // Submit update
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

          // Update UI
          document.getElementById('userName').textContent = updated.name;
          document.getElementById('userProfileImage').src = updated.profilePicture;

          localStorage.setItem('userName', updated.name);
          localStorage.setItem('userPicture', updated.profilePicture);

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

      // Change password handler
      const changePassBtn = document.getElementById('changePasswordBtn');
      if (changePassBtn) {
        changePassBtn.addEventListener('click', async () => {
          try {
            const res = await fetch('/api/user/request-password-reset', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (!res.ok) throw new Error('Failed to send password reset email');
            alert('Password reset email sent.');
          } catch (err) {
            alert('Failed: ' + err.message);
          }
        });
      }
    });
}
