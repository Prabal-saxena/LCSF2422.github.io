const CART_SERVICE_API_URL = 'http://localhost:8082/api/cart';

const GUEST_CART_ID_COOKIE_NAME = 'guestCartId';

const cartContainer = document.getElementById('cart-container');
const cartProductDiv = document.getElementById('cart-product-list-container-div');
const cartItemsList = document.getElementById('cart-items-list');
const cartSummaryDiv = document.getElementById('cart-summary-div');
const cartItemCount = document.getElementById('cart-item-count');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
let guestCartId = getCookie(GUEST_CART_ID_COOKIE_NAME);

async function fetchCartData(){

    if(!cartProductDiv){
        alert("Couldn't fetch the appropriate container, please reload the page...");
        return;
    }

    if(!guestCartId){
        cartProductDiv.innerHTML = '<h2 style="text-align: center; color: #555;">Could not load the session or the cart is empty. Please reload the page or make a selection from Product page.</h2>';
        return;
    }

    const response = await fetch(`${CART_SERVICE_API_URL}/items`, {
        headers: {'X-Guest-Cart-Id': guestCartId}
    });

    if(!response.ok)
        throw new Error(`Failed to fetch cart count: ${response.statusText}`);
    
    const cartData = await response.json();
    console.log('Fetched cart data', cartData);

    if(cartData && Array.isArray(cartData) && cartData.length >0){
        updateCartUI(cartData);   
    }else {
        cartItemsList.innerHTML = '<p class="error-message">No products found or data format is incorrect.</p>';
        cartItemsList.innerHTML = '';
    }
}

function updateCartUI(cartData){
    if(!cartItemsList)return;
    cartItemsList.innerHTML = '';
    cartItemCount.innerHTML = cartData.reduce((sum, item) => sum + item.count, 0);

    cartData.forEach(item => {
        const productId = item.productId;

        // Create a div containing specific item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'sole-item';
        itemDiv.id = productId;

        // Create a div for img element
        const imgDiv = document.createElement('div');
        imgDiv.className = 'img-div';

        // Create the <a> element for the image link
        const anchor = document.createElement('a');
        anchor.href = item.productImgUrl || '#';

        // Create the <img> element
        const imgElement = document.createElement('img');
        imgElement.className = 'productimg'; //Apply Styling
        imgElement.src = item.productImgUrl || 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
        imgElement.alt = item.productName || 'Product Image';

        // Appending image to anchor
        anchor.appendChild(imgElement);
        // Appending anchor to Div
        imgDiv.appendChild(anchor);


        // Create a div for cart-item-information
        const itemInformation = document.createElement('div');
        itemInformation.className = 'item-information';

        // Create a div to remove item from the cart
        const removeItemDiv = document.createElement('div');
        removeItemDiv.className = 'remove-cart-item'; // Apply Style to flex both productName and remove icon

        // Create the <a> element for the image link
        const textAnchor = document.createElement('a');
        textAnchor.href = item.productImgUrl || '#';

        // Create a <span> element for the product Name
        const spanText = document.createElement('span');
        spanText.textContent = item.productName || 'No Name';
        spanText.className = 'item-name-link';

        // Create a remove from cart (X) icon.
        // Create the <a> element for the image link
        const removeFromCartButton = document.createElement('button');
        removeFromCartButton.type = 'button';
        removeFromCartButton.textContent = 'X';
        removeFromCartButton.className = 'remove-from-cart-btn';
        removeFromCartButton.setAttribute("data-product-id", productId);        

        textAnchor.appendChild(spanText);
        removeItemDiv.appendChild(textAnchor);
        removeItemDiv.appendChild(removeFromCartButton);
        
        // Create middle (quantity control, price, total Price)
        const bottleInfo = document.createElement('div');
        bottleInfo.className = 'bottle-info';

        // Quantity Control
        const controlQty = document.createElement('div');
        controlQty.className = 'control-qty';

        const bottleQty = document.createElement('span');
        bottleQty.className = 'bottle-qty';
        bottleQty.textContent = item.quantity + ' ml bottle';

        // Div to contain - qty + buttons
        const qtyControlDiv = document.createElement('div');
        qtyControlDiv.className = 'qty-control-div';

        const subtractControl = document.createElement('span');
        subtractControl.className = 'control-qty-addon';

        const subtractButton = document.createElement('button');
        subtractButton.className = 'control-qty-sub-button';
        subtractButton.type = 'button';
        subtractButton.textContent = '-';
        subtractButton.setAttribute("data-product-id", productId);

        const spanItemCount = document.createElement('span');
        spanItemCount.className = 'control-item-count-span';
        spanItemCount.id = 'item-qty-'+ productId;
        spanItemCount.textContent = item.count;

        const addControl = document.createElement('span');
        addControl.className = 'control-qty-addon';

        const addButton = document.createElement('button');
        addButton.className = 'control-qty-add-button';
        addButton.type = 'button';
        addButton.textContent = '+';
        addButton.setAttribute("data-product-id", productId);

        // Individual product Price excluding tax
        const priceDiv = document.createElement('div');
        priceDiv.className = 'item-price-div';

        const priceTag = document.createElement('div');
        priceTag.textContent = 'Item Price';
        priceTag.className = 'price-tag';

        const productPrice = document.createElement('div');
        productPrice.className = 'price';
        productPrice.textContent = '$' + item.productPrice;
        productPrice.id = 'productPrice';

        // Total product Price count based, excluding tax
        const totalPriceDiv = document.createElement('div');
        totalPriceDiv.className = 'total-item-price-div';

        const totalPriceTag = document.createElement('div');
        totalPriceTag.textContent = 'Total Price';
        totalPriceTag.className = 'total-price-tag';

        const totalProductPrice = document.createElement('div');
        totalProductPrice.textContent = '$' + item.productPrice * item.count;
        totalProductPrice.className = 'price';
        totalProductPrice.id = 'totalProductPrice'+productId;

        controlQty.appendChild(bottleQty);

        qtyControlDiv.appendChild(subtractControl);
        subtractControl.appendChild(subtractButton);
        qtyControlDiv.appendChild(spanItemCount);
        qtyControlDiv.appendChild(addControl);
        addControl.appendChild(addButton);
        controlQty.appendChild(qtyControlDiv);
        bottleInfo.appendChild(controlQty);

        priceDiv.appendChild(priceTag);
        priceDiv.appendChild(productPrice);
        bottleInfo.appendChild(priceDiv);

        totalPriceDiv.appendChild(totalPriceTag);
        totalPriceDiv.appendChild(totalProductPrice);
        bottleInfo.appendChild(totalPriceDiv);

        itemDiv.appendChild(imgDiv);
        itemInformation.appendChild(removeItemDiv);
        itemInformation.appendChild(bottleInfo);
        itemDiv.appendChild(itemInformation);
        
        cartItemsList.appendChild(itemDiv);
    });

    orderSummaryCalculation(); // Update total price in Cart Summary
}

// Event listener for "Remove from Cart" buttons using event delegation
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const productId = event.target.dataset.productId;
        if (productId) {
            removeCompleteProductFromCart(productId, event.target);
        }
    }
});

// Event listener for "Control Qty Sub" buttons using event delegation
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('control-qty-sub-button')) {
        const productId = event.target.dataset.productId;
        if (productId) {
            removeProductFromCart(productId, event.target);
        }
    }
});

// Event listener for "Control Qty Add" buttons using event delegation
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('control-qty-add-button')) {
        const productId = event.target.dataset.productId;
        if (productId) {
            addProductToCart(productId, event.target);
        }
    }
});

async function addProductToCart(productId, buttonElement) {
    const itemCount = parseInt(document.getElementById("item-qty-" + productId).textContent, 10);
    const itemQtyElement = document.getElementById("item-qty-" + productId);

    if (!guestCartId) {
        alert("Could not add to cart: Unable to establish a cart session.");
        return; // Prevent further action if no guestCartId
    }

    buttonElement.disabled = true;
    const originalButtonText = buttonElement.textContent;
    buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

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

        setTimeout(() => {
            buttonElement.disabled = false;
            buttonElement.textContent = originalButtonText;
        }, 2000);

        itemQtyElement.textContent = itemCount + 1;
        calculateTotalCartCount(); // Update global cart count
        document.getElementById('totalProductPrice'+productId).innerText = '$'+cartItem.priceAtAddition;
        orderSummaryCalculation(); // Update total price in Cart Summary 

    } catch (error) {
        console.error("Error adding product to cart:", error);
        alert(`Error: ${error.message || 'Could not add product to cart.'}`);
        buttonElement.textContent = originalButtonText;
        buttonElement.disabled = false;
    }
}

async function removeProductFromCart(productId, buttonElement) {
    
    const itemCount = parseInt(document.getElementById("item-qty-" + productId).textContent, 10);
    const itemQtyElement = document.getElementById("item-qty-" + productId);
    const completelyRemovalFlag = false;

    if(itemCount > 1){
        buttonElement.disabled = true;
        const originalButtonText = buttonElement.textContent;
        buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        // Simulate async process
        setTimeout(() => {
            buttonElement.disabled = false;
            buttonElement.textContent = originalButtonText;
        }, 2000);

        const response = await fetch(`${CART_SERVICE_API_URL}/items?productId=${productId}&completeRemove=${completelyRemovalFlag}`, {
            method: 'DELETE',
            headers: {
                'X-Guest-Cart-Id': guestCartId,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok){
            alert("Couldn't remove the product due to internal server error. Please try again...");
            buttonElement.textContent = originalButtonText;
            return;
        }  

        itemQtyElement.textContent = itemCount - 1;
        calculateTotalCartCount(); // Update global cart count

        const priceAtAddition = await fetch(`${CART_SERVICE_API_URL}/price?productId=${productId}`, {
            headers: {'X-Guest-Cart-Id': guestCartId}
        });

        const price = await priceAtAddition.json();

        document.getElementById('totalProductPrice'+productId).innerText = '$'+ price;

        orderSummaryCalculation(); // Update total price in Cart Summary 
    }else {
        removeCompleteProductFromCart(productId, buttonElement);
    }
}

async function removeCompleteProductFromCart(productId, buttonElement) {
    
    const itemElement = document.getElementById(productId);
    const completelyRemovalFlag = true;

    if(!itemElement){
        alert("No such item found, please reload the page.")
        return;
    }

    buttonElement.disabled = true;
    const originalButtonText = buttonElement.textContent;
    buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

    // Simulate async process
    setTimeout(() => {
        buttonElement.disabled = false;
        buttonElement.textContent = originalButtonText;
    }, 2000);

    const response = await fetch(`${CART_SERVICE_API_URL}/items?productId=${productId}&completeRemove=${completelyRemovalFlag}`, {
        method: 'DELETE',
        headers: {
            'X-Guest-Cart-Id': guestCartId,
            'Content-Type': 'application/json'
        }
    });

    if(!response.ok){
        alert("Couldn't remove the product due to internal server error. Please try again...");
        buttonElement.textContent = originalButtonText;
        return;
    }  

    itemElement.remove();
    calculateTotalCartCount(); // Update global cart count
    orderSummaryCalculation(); // Update total price in Cart Summary 
}

// Update global cart count
async function calculateTotalCartCount() {

    const responseCartInfo = await fetch(`${CART_SERVICE_API_URL}/count`, {
        headers: {'X-Guest-Cart-Id': guestCartId}
    });

    const cartCount = await responseCartInfo.json();
    console.log('Fetched cart data', cartCount.count);

    cartItemCount.innerHTML = ''
    cartItemCount.innerHTML = cartCount.count;
}

// Update total price in Cart Summary 
async function orderSummaryCalculation() {
    if(!cartTotal){
        alert("Couldn't fetch the summary for this cart, please reload the page...");
        return;
    }

    if(!guestCartId){
        cartTotal.innerHTML = '<h2 style="text-align: center; color: #555;">Could not load the session for this user. Please reload the page...</h2>';
        return;
    }

    const response = await fetch(`${CART_SERVICE_API_URL}/price`, {
        headers: {'X-Guest-Cart-Id': guestCartId}
    });

    if(!response.ok)
        throw new Error(`Failed to fetch cart count: ${response.statusText}`);
    
    const price = await response.json();
    console.log('Fetched cart sub total price as ', price);

    if(price){
        document.getElementById('subTotalPrice').textContent = '$'+price;
        document.getElementById('grandTotalPrice').textContent = '$'+price;
    }else {
        document.getElementById('subTotalPrice').textContent = 'NA';
        document.getElementById('grandTotalPrice').textContent = 'NA';
    }
}

checkoutButton.addEventListener('click', () => {
    if(checkoutButton != null){
        window.location.href = "checkout.html#shipping";
    }
});

// Initial load of all products when product.js is loaded (and DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    // Only fetch all products if we are on the product listing page
    // This is a simple check; you might use a more robust routing solution
    if (cartContainer) {
        fetchCartData(); // Call without filters to get all products initially
    }
});