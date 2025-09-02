const loginFormSubmitBtn = document.getElementById('loginform');
const GUEST_CART_ID_COOKIE_NAME = 'guestCartId';
const USER_SERVICE_API_URL = 'http://localhost:8083/api/user';
let guestCartId = getCookie(GUEST_CART_ID_COOKIE_NAME);
const AUTH_USER_TOKEN_EXPIRY_DAYS = 0.0138; // Persist guest cart for 90 days
const AUTH_USER_TOKEN_NAME = 'authuserjwt';

loginFormSubmitBtn.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop reload
    const loginData = collectLoginFormData();
    const isLoggedIn = await callLoginService(loginData);
    if (isLoggedIn) {
        // ✅ Redirect only after successful login
        window.location.href = "products.html";
    }else{
        alert("EmailId or Password Incorrect. Please try again.");
    }
});

function collectLoginFormData(){
    const data = {};
    
    // Get Data from emailLoginForm
    const loginForm = document.getElementById('loginform');
    const loginCred = new FormData(loginForm);
    for (const [key, value] of loginCred.entries()){
        data[key] = value
    }
    return data;
}

async function callLoginService(loginData){
    try{
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
                console.error("Login failed:", response.status);
                return false;
            }
            const responseJson = await response.json();
            if (responseJson != null){
                console.log(responseJson.token);
                setCookie(AUTH_USER_TOKEN_NAME, responseJson.token, AUTH_USER_TOKEN_EXPIRY_DAYS);
                return true;
            }
        }
    }catch(error){
        console.error("Login failed:", err);
        alert("Server unreachable. Please try later.");
    }
    return false;
}
