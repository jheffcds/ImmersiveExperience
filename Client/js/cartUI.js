document.addEventListener('DOMContentLoaded', () => {
  const cartIcon = document.getElementById('cartIcon');
  const cartCount = document.getElementById('cart-count');
  const token = localStorage.getItem('token');

  if (!cartIcon || !cartCount) return;

  if (!token) {
    cartIcon.style.display = 'none';
  } else {
    cartIcon.style.display = 'inline-block';
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartCount.textContent = cartItems.length;
  }
});
