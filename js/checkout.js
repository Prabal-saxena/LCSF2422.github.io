const CART_SERVICE_API_URL = 'http://localhost:8082/api/cart';
const USER_SERVICE_API_URL = 'http://localhost:8083/api/user';
const AUTH_USER_TOKEN_EXPIRY_DAYS = 0.0138; // Persist guest cart for 90 days
const AUTH_USER_TOKEN_NAME = 'authuserjwt';
const GUEST_CART_ID_COOKIE_NAME = 'guestCartId';
let guestCartId = getCookie(GUEST_CART_ID_COOKIE_NAME);
const itemInfo = document.getElementById('item-info');
const shippingFormSubmitBtn = document.getElementById('shippingformbutton');

const yesBtn = document.getElementById('yesRadio');
const noBtn = document.getElementById('noRadio');
const extraFields = document.getElementById('pickupPersonDetails');

function showSectionFromHash() {
    const hash = window.location.hash.substring(1); // remove '#'
    const sections = document.querySelectorAll(".checkout-section");
    const tabs = document.querySelectorAll(".tab-btn");

    sections.forEach(section => {
        section.classList.toggle("active", section.id === hash);
    });

    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.target === hash);
    });
}

// Code to check registered email
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('customer-email');
    const passwordField = document.getElementById('password-field');
    const loginWhileCheckout = document.getElementById('login-while-checkout-button');
    const emailNote = document.getElementById('email-note');

    let validationTimer;

    // This function will validate the email format
    function isValidEmail(email) {
        // Simple regex for email validation
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // This is the main function that will be called after a delay
    function handleEmailInput() {
        const email = emailInput.value.trim();
        emailNote.style.color = 'initial'; // Reset note color

        if (isValidEmail(email)) {
            // Email format is valid, now check if it exists in the database
            checkEmailExistence(email);
        } else {
            // Email format is invalid
            passwordField.classList.add('hidden');
            emailNote.textContent = 'Please enter a valid email address.';
            emailNote.style.color = 'red';
        }
    }

    // Make the AJAX call to find email address existance
    async function checkEmailExistence(email) {
        // In a real application, replace this with your actual API endpoint
        const apiEndpoint = USER_SERVICE_API_URL + '/checkEmail';

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST', // Or GET, depending on your API design
                headers: {
                    'Content-Type': 'application/json',
                },
                body: email,
            });

            if (!response.ok && response.status != 200) {
                passwordField.classList.add('hidden');
                loginWhileCheckout.classList.add('hidden');
                emailNote.textContent = 'No such registration found, continue as guest or register.';
                return;
            }else{
                // Email exists, unhide the password field
                passwordField.classList.remove('hidden');
                emailNote.textContent = 'Welcome back! Please enter your password to log in.';
                emailNote.style.color = 'green';
                loginWhileCheckout.classList.remove('hidden');
                document.getElementById('loginFailed').classList.add('hidden');
            }
        } catch (error) {
            console.error('Error checking email existence:', error);
            emailNote.textContent = 'An error occurred. Please try again.';
            emailNote.style.color = 'red';
            passwordField.classList.add('hidden');
        }
    }

    // Add an event listener to the email input field
    emailInput.addEventListener('input', () => {
        clearTimeout(validationTimer); // Clear any previous timers

        // Set a new timer to call handleEmailInput after 1 second
        validationTimer = setTimeout(handleEmailInput, 3000);
    });

    // Handle the case where the user clears the input after a successful check
    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() === '') {
            passwordField.classList.add('hidden');
            emailNote.textContent = 'We will send your order confirmation to this email address.';
            emailNote.style.color = 'initial';
        }
    });

    //Login button listener on checkout page
    loginWhileCheckout.addEventListener('click', async () => {
        const customerPassword = document.getElementById('customer-password');
        const loginData = {};

        if (emailInput.value.trim() != '' && customerPassword.value.trim() != '') {
            
            const loginForm = document.getElementById('emailLoginForm');
            const loginCred = new FormData(loginForm);
            for (const [key, value] of loginCred.entries()){
                loginData[key] = value
            }

            if(await callLoginService(loginData)){
                loginForm.style.display = 'none';
                document.getElementById('logged-in-title').classList.remove('hidden');
            }else {
                document.getElementById('loginFailed').classList.remove('hidden');
            }
        }
    });
    
    async function callLoginService(loginData){
        if (loginData.email && loginData.password) {
        
            const response = await fetch(USER_SERVICE_API_URL + '/login', {
                method : 'POST',
                headers : {
                    'Content-Type': 'application/json',
                    'X-Guest-Cart-Id': guestCartId
                },
                body : JSON.stringify(loginData)
            });

            if (!response.ok){
                alert("Username or Password Incorrect. Please try again.");
                return false;
            }
            const responseJson = await response.json();
            if (responseJson != null){
                console.log(responseJson.token);
                setCookie(AUTH_USER_TOKEN_NAME, responseJson.token, AUTH_USER_TOKEN_EXPIRY_DAYS);
                return true;
            }
        }
        return false;
    }
});

// Load Order Summary
async function loadOrderSummary() {
    if(!itemInfo){
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
        updateOrderSummary(cartData);   
    }else {
        cartItemsList.innerHTML = '<p class="error-message">No products found or data format is incorrect.</p>';
        cartItemsList.innerHTML = '';
    }
}

function updateOrderSummary(cartData){
    const totalItemCount = document.getElementById('cart-item-count');
    totalItemCount.innerHTML = cartData.reduce((sum, item) => sum + item.count, 0);

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

        // div for product name and quantity of bottle
        const itemNameAndQty = document.createElement('div');
        itemNameAndQty.className = 'item-name-qty'; 

        // Create the <a> element for the product name and link
        const textAnchor = document.createElement('a');
        textAnchor.href = item.productImgUrl || '#';

        // Create a <span> element for the product Name
        const spanText = document.createElement('span');
        spanText.textContent = item.productName || 'No Name';
        spanText.className = 'item-name-link';

        // Quantity of item
        const spanItemCount = document.createElement('div');
        spanItemCount.className = 'control-item-count-span';
        spanItemCount.id = 'item-qty-'+ productId;
        spanItemCount.textContent = 'Qty: ' + item.count;

        textAnchor.appendChild(spanText);
        itemNameAndQty.appendChild(textAnchor);
        itemNameAndQty.appendChild(spanItemCount);
        
        // Create a div for cart-item-information
        const itemInformation = document.createElement('div');
        itemInformation.className = 'item-information';

        // Create total item Price 
        const bottleInfo = document.createElement('div');
        bottleInfo.className = 'bottle-info';

        // Total product Price count based, excluding tax
        const totalPriceDiv = document.createElement('div');
        totalPriceDiv.className = 'total-item-price-div';

        const totalProductPrice = document.createElement('div');
        totalProductPrice.textContent = '$' + item.productPrice * item.count;
        totalProductPrice.className = 'price';
        totalProductPrice.id = 'totalProductPrice'+productId;

        totalPriceDiv.appendChild(totalProductPrice);
        bottleInfo.appendChild(totalPriceDiv);
        
        itemInformation.appendChild(bottleInfo);

        itemDiv.appendChild(imgDiv);
        
        itemDiv.appendChild(itemNameAndQty);
        itemDiv.appendChild(itemInformation);
        
        itemInfo.appendChild(itemDiv);
    });
}

// Submit Shipping Info Button Function
function submitShippingFormInfo(){
    const data = {};

    // Get Data from store-pickup-form
    const storePickupForm = document.getElementById('store-pickup-form');
    const storePickupData = new FormData(storePickupForm);
    for (const [key, value] of storePickupData.entries()){
        data[key] = value
    }

    return data;
}

shippingFormSubmitBtn.addEventListener('click', () => {
    const allData = submitShippingFormInfo();

    if (!allData.firstName || !allData.email || !allData.phoneNumber) {
        alert('Please fill out all required fields.');
        return;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
});

yesBtn.addEventListener('change', () => {
    if (yesBtn.checked) {
    extraFields.classList.remove('hidden');
    }
});

noBtn.addEventListener('change', () => {
    if (noBtn.checked) {
    extraFields.classList.add('hidden');
    }
});

// Handle hash change and initial load
window.addEventListener("hashchange", showSectionFromHash);
window.addEventListener("DOMContentLoaded", showSectionFromHash);

// Optional: tab click updates the hash
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.hash = btn.dataset.target;
    });
});