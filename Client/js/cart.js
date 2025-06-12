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

  fetch(`/api/scenes`, {
    method: 'GET'
  })
  .then(res => res.json())
  .then(allScenes => {
    let total = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach(id => {
      const scene = allScenes.find(s => s._id === id);
      if (scene) {
        total += scene.price;

        const card = document.createElement('div');
        card.className = 'cart-item';
        card.innerHTML = `
          <h4>${scene.title}</h4>
          <p>${scene.price === 0 ? 'Free' : `$${scene.price.toFixed(2)}`}</p>
          <button class="remove-item" data-id="${scene._id}">Remove</button>
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
      .then(res => res.json())
      .then(data => {
        alert('Purchase complete!');
        localStorage.removeItem('cart');
        window.location.href = '/dashboard.html'; // or your preferred redirect
      })
      .catch(err => {
        console.error('Checkout failed:', err);
        alert('Checkout failed. Please try again.');
      });
    });
  });
});
