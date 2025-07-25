const CART_SERVICE_API_URL = 'http://localhost:8082/api/cart';

const GUEST_CART_ID_COOKIE_NAME = 'guestCartId';

const cartContainer = document.getElementById('cart-container');
const cartProductDiv = document.getElementById('cart-product-list-container-div');
const cartSummaryDiv = document.getElementById('cart-summary-div');

async function fetchCartData(){

    if(!cartProductDiv){
        alert("Couldn't fetch the appropriate container, please reload the page...");
        return;
    }

    let guestCartId = getCookie(GUEST_CART_ID_COOKIE_NAME);

    if(!guestCartId){
        cartProductDiv.innerHTML = '<h2 style="text-align: center; color: #555;">Could not load the session or the cart is empty. Please reload the page or make a selection from Product page.</h2>';
        return;
    }

    const response = await fetch(`${CART_SERVICE_API_URL}/items`, {
        headers: {'X-Guest-Cart-Id': guestCartId}
    });

    if(!response.ok)
        throw new Error(`Failed to fetch cart count: ${response.statusText}`);
    
    const data = await response.json();
    updateCartUI(data);
}

function updateCartUI(cartData){
    
}

// Initial load of all products when product.js is loaded (and DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    // Only fetch all products if we are on the product listing page
    // This is a simple check; you might use a more robust routing solution
    if (cartContainer) {
        fetchCartData(); // Call without filters to get all products initially
    }
});