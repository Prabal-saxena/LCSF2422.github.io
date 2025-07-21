const API_PRODUCT_URL = 'http://localhost:8081/api/product';

const productsContainer = document.getElementById('productsContainer');
const paginationControls = document.getElementById('paginationControls');

const cartItemCountBadge = document.getElementById('cart-item-count');
const CART_SERVICE_API_URL = 'http://localhost:8082/api/cart';

// --- Cookie related variables ---
const GUEST_CART_ID_COOKIE_NAME = 'guestCartId';
const GUEST_CART_COOKIE_EXPIRY_DAYS = 90; // Persist guest cart for 90 days

const appState = {
    categoryId: '',
    subCategoryId: '',
    page: '',
    size: '',
    totalProducts: 0
};

async function fetchData() {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '<p style="text-align: center; color: #555;">Loading products...</p>';
    paginationControls.innerHTML = '';

    let apiUrl = API_PRODUCT_URL;
    const params = new URLSearchParams();
        
    if (appState.categoryId) {
        params.append('category', appState.categoryId);
    }

    if (appState.subCategoryId) {
        params.append('subCategory', appState.subCategoryId);
    }

    // Add pagination parameters
    params.append('page', appState.page);
    params.append('size', appState.size);

    // Append query parameters if any
    if (params.toString()) {
        apiUrl += `?${params.toString()}`;
    }

    try {
        const response = await fetch(apiUrl); // Calling the product API

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Server sends the JSON data
        console.log('Fetched paginated data', data);

        if(data && Array.isArray(data.content) && data.content.length >0){
            appState.totalProducts = data.totalElements;
            appState.size = data.size;
            appState.page = data.number;
            displayProducts(data.content);
            setupPaginationControls();
            window.initializeNavbar();
        }
        else {
            productsContainer.innerHTML = '<p class="error-message">No products found or data format is incorrect.</p>';
            paginationControls.innerHTML = '';
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        productsContainer.innerHTML = `<p class="error-message">Failed to load products: ${error.message}. Please ensure your server is running and accessible at ${API_PRODUCT_URL}.</p>`;
        paginationControls.innerHTML = '';
    }
}

function displayProducts(products) {

    productsContainer.innerHTML = ''; // Clear existing content before adding new products

    products.forEach (product => {
        // Create the <figaure> element
        const figure = document.createElement('figuare');
        figure.className = 'frame'; // Apply styling class

        // Create the <a> element for the image link
        const anchor = document.createElement('a');
        anchor.href = product.imageUrl || '#'; // Use productPageUrl or a default '#'

        // Create the <img> element
        const image = document.createElement('img');
        image.className = 'productimage'; // Apply styling class
        image.src = product.imageUrl || 'https://placehold.co/200x200/cccccc/333333?text=No+Image'; // Fallback placeholder image
        image.alt = product.name || 'Product Image';

        // Append image to anchor
        anchor.appendChild(image);
        // Append anchor to figure
        figure.appendChild(anchor);

        // Create the <figcaption> element
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'product-pic-text'; // Apply styling class

        let priceText = '';
        if (product.price !== undefined && product.price !== null) {
            priceText = `$${product.price.toFixed(2)}`; // Format price to two decimal places
        }
        figcaption.textContent = `${priceText} ${product.name || 'Unknown Product'}`;

        // Append figcaption to figure
        figure.appendChild(figcaption);

        // Append button to figure
        figure.appendChild(createAddToCartButton(product.id));

        // Append the complete figure to the main container
        productsContainer.appendChild(figure);
    });
}

// Helper function to update the global cart count display
function updateCartCountUI(count) {
    if (cartItemCountBadge) {
        cartItemCountBadge.textContent = count > 0 ? count : 0;
        cartItemCountBadge.style.display = count > 0 ? 'inline-block' : 'none'; // Show/hide badge
    }
}

function createAddToCartButton(productId){
    const addToCartButton = document.createElement('button');
    addToCartButton.type = 'button';
    addToCartButton.textContent = 'Add To Cart';
    addToCartButton.className = 'add-to-cart-btn';
    addToCartButton.setAttribute("data-product-id", productId);
    addToCartButton.style = 'grid-column: 2;'
    return addToCartButton;
}

// Event listener for "Add to Cart" buttons using event delegation
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart-btn')) {
        const productId = event.target.dataset.productId;
        if (productId) {
            addProductToCart(productId, event.target);
        }
    }
});

// Function to get the guestCartId, creating one if necessary
async function getOrCreateGuestCartId() {
    let guestCartId = getCookie(GUEST_CART_ID_COOKIE_NAME);

    if (!guestCartId) {
        console.log("No guestCartId found, requesting a new one...");
        try {
            // Call backend endpoint to generate a new guest cart ID
            const response = await fetch(`${CART_SERVICE_API_URL}/guest_cart/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create guest cart.');
            }
            const data = await response.json(); // Assuming backend returns { guestCartId: "..." }
            guestCartId = data.guestCartId;
            setCookie(GUEST_CART_ID_COOKIE_NAME, guestCartId, GUEST_CART_COOKIE_EXPIRY_DAYS);
            console.log("New guestCartId created and set:", guestCartId);
        } catch (error) {
            console.error("Critical: Could not create guest cart ID:", error);
            // Handle this gracefully, maybe disable cart features or show a persistent error.
            return null;
        }
    }
    return guestCartId;
}

// Modify fetchCartCount to use the guestCartId
async function fetchCartCount() {
    const guestCartId = await getOrCreateGuestCartId(); // Ensure ID exists

    if (!guestCartId) {
        updateCartCountUI(0); // If we can't get/create ID, assume 0
        return;
    }

    try {
        // Send guestCartId in header or as query param/body
        const response = await fetch(`${CART_SERVICE_API_URL}/count`, {
            headers: { 'X-Guest-Cart-Id': guestCartId } // Custom header is a good way
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch cart count: ${response.statusText}`);
        }
        const data = await response.json();
        updateCartCountUI(data.count);
    } catch (error) {
        console.error("Error fetching cart count:", error);
        updateCartCountUI(0);
    }
}

// Modify addProductToCart to use the guestCartId
async function addProductToCart(productId, buttonElement) {
    console.log("Product added:", productId);
    const guestCartId = await getOrCreateGuestCartId(); // Ensure ID exists
    if (!guestCartId) {
        alert("Could not add to cart: Unable to establish a cart session.");
        return; // Prevent further action if no guestCartId
    }

    buttonElement.disabled = true;
    const originalButtonText = buttonElement.textContent;
    buttonElement.textContent = 'Adding...';

    try {
        const response = await fetch(`${CART_SERVICE_API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Guest-Cart-Id': guestCartId // Send guest cart ID with every request
            },
            body: JSON.stringify({ productId: productId, quantity: 1 })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add product to cart.');
        }

        const cartItem = await response.json();
        console.log("Product added to cart:", cartItem);

        buttonElement.textContent = 'Added!';
        setTimeout(() => {
            buttonElement.textContent = originalButtonText;
            buttonElement.disabled = false;
        }, 1500);

        fetchCartCount(); // Update global cart count

    } catch (error) {
        console.error("Error adding product to cart:", error);
        alert(`Error: ${error.message || 'Could not add product to cart.'}`);
        buttonElement.textContent = originalButtonText;
        buttonElement.disabled = false;
    }
}

function setupPaginationControls(){
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(appState.totalProducts / appState.size);

    if (totalPages <= 1) {
        return; // No need for pagination if only one page
    }

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'pagination-button';
    prevButton.disabled = appState.page === 0;
    prevButton.addEventListener('click', () => {
        appState.page--;
        fetchData();
    });
    paginationControls.appendChild(prevButton);

    for (let i = 0; i < totalPages; i++){
        const pageButton = document.createElement('button');
        pageButton.textContent = i+1;
        pageButton.className = 'pagination-button';
        
        pageButton.classList.toggle('active', i === appState.page); // Highlight active page
        
        pageButton.addEventListener('click', () => {
            appState.page = i;
            fetchData();
        });
        paginationControls.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'pagination-button';
    nextButton.disabled = appState.page === totalPages - 1; // Disable if on the last page
    nextButton.addEventListener('click', () => {
        appState.page++;
        fetchData();
    });
    paginationControls.appendChild(nextButton);

}

// Initial load of all products when product.js is loaded (and DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    // Only fetch all products if we are on the product listing page
    // This is a simple check; you might use a more robust routing solution
    if (productsContainer) {
        fetchData(); // Call without filters to get all products initially
    }
    fetchCartCount(); // Fetch and display initial cart count
});

// Call the fetchData function when the page loads
window.fetchData = fetchData;
window.appState = appState;