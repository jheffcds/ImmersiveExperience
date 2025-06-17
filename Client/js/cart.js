document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const token = localStorage.getItem('token');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Handle logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      window.location.href = 'index.html';
    });
  }
  // If cart is empty
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    checkoutBtn.style.display = "none";
    return;
  }

  // Fetch all scenes to get info about items in cart
  fetch('/api/scenes')
    .then(res => res.json())
    .then(allScenes => {
      let total = 0;
      cartItemsContainer.innerHTML = '';
      cartItemsContainer.classList.add('card-grid');

      cart.forEach(id => {
        const scene = allScenes.find(s => s._id === id);
        if (scene) {
          total += scene.price || 0;

          const card = document.createElement('div');
          card.className = 'project-card';

          const imagePath = scene.images?.[0] || '';
          const imageUrl = imagePath
            ? `/scenes/${imagePath.split('/').slice(1).join('/')}`
            : 'assets/images/fallback.jpg';

          const shortDescription = scene.description?.slice(0, 100) || '';

          card.innerHTML = `
            <img src="${imageUrl}" alt="${scene.title}" />
            <div class="card-content">
              <h3>${scene.title}</h3>
              <p>${shortDescription}...</p>
              <p><strong>Price:</strong> ${scene.price === 0 ? 'Free' : `$${scene.price.toFixed(2)}`}</p>
              <button class="btn-secondary remove-item" data-id="${scene._id}">Remove</button>
            </div>
          `;
          cartItemsContainer.appendChild(card);
        }
      });

      cartTotal.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;

      // Remove item handler
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idToRemove = btn.getAttribute('data-id');
          cart = cart.filter(id => id !== idToRemove);
          localStorage.setItem('cart', JSON.stringify(cart));
          location.reload();
        });
      });

      // Checkout handler
      checkoutBtn.addEventListener('click', () => {
        fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sceneIds: cart })
        })
          .then(res => res.json())
          .then(data => {
            if (data.url) {
              // Redirect to Stripe checkout
              window.location.href = data.url;
            } else {
              throw new Error('Checkout URL missing');
            }
          })
          .catch(err => {
            console.error('Checkout failed:', err);
            alert('Checkout failed. Please try again.');
          });
      });
    })
    .catch(err => {
      console.error('Failed to load scenes:', err);
      alert('Could not load cart items.');
    });
});
