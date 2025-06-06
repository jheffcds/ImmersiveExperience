document.addEventListener('DOMContentLoaded', () => {
  const signInTab = document.getElementById('signInTab');
  const signUpTab = document.getElementById('signUpTab');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const signInError = document.getElementById('signInError');
  const signUpError = document.getElementById('signUpError');

  if (!(signInTab && signUpTab && signInForm && signUpForm)) return;

  signInTab.addEventListener('click', () => {
    signInForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
    signInTab.classList.add('active');
    signUpTab.classList.remove('active');
  });

  signUpTab.addEventListener('click', () => {
    signUpForm.classList.remove('hidden');
    signInForm.classList.add('hidden');
    signUpTab.classList.add('active');
    signInTab.classList.remove('active');
  });

  const signInEmail = document.getElementById('signInEmail');
  const signInPassword = document.getElementById('signInPassword');

  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signInError.classList.add('hidden');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInEmail.value,
          password: signInPassword.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        signInError.textContent = data.message || 'Login failed';
        signInError.classList.remove('hidden');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name || 'User');
      localStorage.setItem('userPicture', data.picture || 'uploads/profile/default.png');

      if (data.role === 'admin') {
        window.location.href = '/adminDashboard.html';
      } else {
        window.location.href = '/dashboard.html';
      }

    } catch (err) {
      signInError.textContent = 'Network error. Please try again.';
      signInError.classList.remove('hidden');
    }
  });

  const signUpName = document.getElementById('signUpName');
  const signUpEmail = document.getElementById('signUpEmail');
  const signUpPassword = document.getElementById('signUpPassword');
  const signUpPasswordcopy = document.getElementById('signUpPasswordcopy');

  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signUpError.classList.add('hidden');

    if (signUpPassword.value !== signUpPasswordcopy.value) {
      signUpError.textContent = 'Passwords do not match';
      signUpError.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName.value,
          email: signUpEmail.value,
          password: signUpPassword.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        signUpError.textContent = data.message || 'Signup failed';
        signUpError.classList.remove('hidden');
        return;
      }

      alert('Account created successfully! Please sign in.');
      signInTab.click();
    } catch (err) {
      signUpError.textContent = 'Network error. Please try again.';
      signUpError.classList.remove('hidden');
    }
  });

  // Google SSO Setup
  async function initGoogleSSO() {
    try {
      const res = await fetch('/api/config/google');
      const { clientId } = await res.json();

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large' }
        );
      };
    } catch (err) {
      console.error('Failed to load Google SSO:', err);
    }
  }

  window.handleCredentialResponse = async function (response) {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name || 'User');
      localStorage.setItem('userPicture', data.picture || 'uploads/profile/default.png');
      if (data.role === 'admin') {
        window.location.href = '/adminDashboard.html';
      } else {
        window.location.href = '/dashboard.html';
      }

    } catch (err) {
      alert('Google login error: ' + err.message);
    }
  };

  initGoogleSSO();
});
