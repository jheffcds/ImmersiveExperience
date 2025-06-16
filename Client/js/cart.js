document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const token = localStorage.getItem('token');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    checkoutBtn.style.display = "none";
    return;
  }
  fetch(`/api/scenes`)
    .then(res => res.json())
    .then(allScenes => {
      let total = 0;
      cartItemsContainer.innerHTML = '';
      cartItemsContainer.classList.add('card-grid'); // Use same layout as explore

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
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idToRemove = btn.getAttribute('data-id');
          cart = cart.filter(id => id !== idToRemove);
          localStorage.setItem('cart', JSON.stringify(cart));
          location.reload();
        });
      });
      checkoutBtn.addEventListener('click', () => {
        fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sceneIds: cart })
        })
        console.log('Checkout request sent with cart:', cart)
          .then(res => res.json())
          console.log('Checkout response:', res)
          .then(data => {
            console.log('Checkout data:', data);
            if (data.url) {
              // Clear cart before redirect to prevent duplicates if they come back
              localStorage.removeItem('cart');
              window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
              throw new Error('Checkout URL missing');
            }
          })
          .catch(err => {
            console.error('Checkout failed:', err);
            alert('Checkout failed. Please try again.');
          });
      });
    });
});
