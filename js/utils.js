/**
 * Gets a Cookie by name
 * @param {string} name the name of the cookie to reterive
 * @return {string|null} the cookie value, or null if not found. 
 */
function getCookie(name){
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i< ca.length; i++){
        let c = ca[i];
        while(c.charAt(0) === ' ') c = c.substring(1, c.length);
        if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Sets a cookie.
 * @param {string} name The name of the cookie.
 * @param {string} value The value of the cookie.
 * @param {number} days The number of days until the cookie expires.
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; secure; SameSite=Strict"; // SameSite is important
}

/**
 * Deletes a cookie.
 * @param {string} name The name of the cookie to delete.
 */
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}