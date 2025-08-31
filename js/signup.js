const USER_SERVICE_URL = 'http://localhost:8083/api/user';

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.querySelector('section');
  signupForm.style.opacity = 0;
  let validationTimer;

  const emailInput = document.querySelector('input[type="email"]');
  const usernameInput = document.querySelector('input[type="text"][name="username"]');
  const phoneInput = document.querySelector('input[type="phone"][name="phoneNumber"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const confirmPasswordInput = document.querySelector('input[type="password"][name="passwordcon"]');
  
  const icons = document.getElementsByTagName("ion-icon"); // Select all elements with the tag name 'ion-icon'
  

  setTimeout(() => {
    signupForm.style.transition = 'opacity 1s ease-in-out';
    signupForm.style.opacity = 1;
  }, 500);

  const signupButton = document.querySelector('button');
  signupButton.addEventListener('click', function () {
        
    // Check for a valid email and password (you can add your validation logic here)
    // const isValid = emailInput.checkValidity() && passwordInput.checkValidity() && confirmPasswordInput.checkValidity();
    

    if (!register()) {
      signupForm.classList.add('shake');

      setTimeout(() => {
        signupForm.classList.remove('shake');
      }, 1000);
    }
  });

  async function register(){
    const apiEndpoint = USER_SERVICE_URL + '/register'; 
    const data = {};
    if(emailInput.value != null && usernameInput.value != null && phoneInput.value != null && passwordInput.value == confirmPasswordInput.value != null){
      // Get Data from emailLoginForm
      const registerationForm = document.getElementById('signupform');
      const registerationData = new FormData(registerationForm);
      for (const [key, value] of registerationData.entries()){
        if(key != 'passwordcon')
          data[key] = value
      }
    }
    try {
      const response = await fetch(apiEndpoint, {
          method: 'POST', // Or GET, depending on your API design
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });

      if(!response.ok)
        alert("Something went wrong. Please try again.");
      else
        window.location.href = "login.html";
    }catch(error){
      console.log("Error occured while registering.");
    }
  }


  // This function will validate the email format
    function isValidEmail(email) {
      // Simple regex for email validation
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }

  // This is the main function that will be called after a delay
  function handleEmailInput() {
    const email = emailInput.value.trim();

    if (isValidEmail(email)) {
        // Email format is valid, now check if it exists in the database
        checkEmailExistence(email);
    } else {
        // Email format is invalid
    }
  }

// Make the AJAX call to find email address existance
  async function checkEmailExistence(email) {
    // In a real application, replace this with your actual API endpoint
    const apiEndpoint = USER_SERVICE_URL + '/checkEmail'; 
    const messageElement = document.getElementById('email-availability-message');
    let icon;
    for (let i = 0; i < icons.length; i++) {
      // Check if the current icon's 'name' attribute is "person-outline"
      if (icons[i].getAttribute("name") === "mail-outline" || icons[i].getAttribute("name") === "mail") {
        // If it is, change the 'name' attribute to "mail"
        icon = icons[i];
        icon.setAttribute("name", "mail-outline");
        icon.style.color = "";  
        break;
      }
    }
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST', // Or GET, depending on your API design
            headers: {
                'Content-Type': 'application/json',
            },
            body: email,
        });

        if (!response.ok) {
          icon.setAttribute("name", "mail");
          icon.style.color = "limegreen";
          hideMessage(messageElement);   
        } else {
          // Email does not exist
          icon.setAttribute("name", "mail");
          icon.style.color = "red";
          showMessage(messageElement);
          // alert("Email already exist, try something else.");
        }
    } catch (error) {
        console.error('Error checking email existence:', error);
    }
  }

  // Add an event listener to the email input field
  emailInput.addEventListener('input', () => {
    clearTimeout(validationTimer); // Clear any previous timers
    if(emailInput.value == '') {
      let icon;
      for (let i = 0; i < icons.length; i++) {
        // Check if the current icon's 'name' attribute is "person-outline"
        if (icons[i].getAttribute("name") === "mail-outline" || icons[i].getAttribute("name") === "mail") {
          // If it is, change the 'name' attribute to "mail"
          icon = icons[i];
          icon.setAttribute("name", "mail-outline");
          icon.style.color = "";  
          break;
        }
      }
    }else{
      // Set a new timer to call handleEmailInput after 1 second
      validationTimer = setTimeout(handleEmailInput, 500);
    }
  });

  // This is the main function that will be called after a delay
  function handleUsernameInput() {
    const username = usernameInput.value.trim();

    checkUsernameExistence(username);
  }

  // Check for the username availability
  async function checkUsernameExistence(username){
    const apiEndpoint = USER_SERVICE_URL + '/checkUser'; 
    const messageElement = document.getElementById('user-availability-message');
    let icon;
    for (let i = 0; i < icons.length; i++) {
      // Check if the current icon's 'name' attribute is "person-outline"
      if (icons[i].getAttribute("name") === "person-outline" || icons[i].getAttribute("name") === "person") {
        // If it is, change the 'name' attribute to "person"
        icon = icons[i];
        icon.setAttribute("name", "person-outline");
        icon.style.color = "";  
        break;
      }
    }
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST', // Or GET, depending on your API design
            headers: {
                'Content-Type': 'application/json',
            },
            body: username,
        });

        if (!response.ok && response.status != 200) {
          icon.setAttribute("name", "person");
          icon.style.color = "limegreen";
          hideMessage(messageElement);   
        } else {
          // Email does not exist
          icon.setAttribute("name", "person");
          icon.style.color = "red";
          showMessage(messageElement);
          // alert("Email already exist, try something else.");
        }
    } catch (error) {
        console.error('Error checking email existence:', error);
    }
  }

  // Add an event listener to the email input field
  usernameInput.addEventListener('input', () => {
    clearTimeout(validationTimer); // Clear any previous timers
    if(usernameInput.value == "") {
      let icon;
      for (let i = 0; i < icons.length; i++) {
        // Check if the current icon's 'name' attribute is "person-outline"
        if (icons[i].getAttribute("name") === "person-outline" || icons[i].getAttribute("name") === "person") {
          // If it is, change the 'name' attribute to "mail"
          icon = icons[i];
          icon.setAttribute("name", "person-outline");
          icon.style.color = "";  
          break;
        }
      }
    }else{
      // Set a new timer to call handleEmailInput after 1 second
      validationTimer = setTimeout(handleUsernameInput, 500);
    }
  });


  // This is the main function that will be called after a delay
  function handlePhoneInput() {
    const phone = phoneInput.value.trim();

    checkPhoneExistence(phone);
  }

  // Check for the username availability
  async function checkPhoneExistence(username){
    const apiEndpoint = USER_SERVICE_URL + '/checkPhone'; 
    const messageElement = document.getElementById('phone-availability-message');
    let icon;
    for (let i = 0; i < icons.length; i++) {
      // Check if the current icon's 'name' attribute is "person-outline"
      if (icons[i].getAttribute("name") === "call-outline" || icons[i].getAttribute("name") === "call") {
        // If it is, change the 'name' attribute to "person"
        icon = icons[i];
        icon.setAttribute("name", "call-outline");
        icon.style.color = "";  
        break;
      }
    }
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST', // Or GET, depending on your API design
            headers: {
                'Content-Type': 'application/json',
            },
            body: username,
        });

        if (!response.ok && response.status != 200) {
          icon.setAttribute("name", "call");
          icon.style.color = "limegreen";
          hideMessage(messageElement);   
        } else {
          // Email does not exist
          icon.setAttribute("name", "call");
          icon.style.color = "red";
          showMessage(messageElement);
          // alert("Email already exist, try something else.");
        }
    } catch (error) {
        console.error('Error checking email existence:', error);
    }
  }

  // Add an event listener to the email input field
  phoneInput.addEventListener('input', () => {
    clearTimeout(validationTimer); // Clear any previous timers
    if(phoneInput.value == "") {
      let icon;
      for (let i = 0; i < icons.length; i++) {
        // Check if the current icon's 'name' attribute is "person-outline"
        if (icons[i].getAttribute("name") === "call-outline" || icons[i].getAttribute("name") === "call") {
          // If it is, change the 'name' attribute to "mail"
          icon = icons[i];
          icon.setAttribute("name", "call-outline");
          icon.style.color = "";  
          break;
        }
      }
    }else{
      // Set a new timer to call handleEmailInput after 1 second
      validationTimer = setTimeout(handlePhoneInput, 500);
    }
  });

  // This function will show the popup
  function showMessage(messageElement) {
    messageElement.textContent = "Unavailable, try something else";
    messageElement.classList.add('show');
  }

  // This function will hide the popup
  function hideMessage(messageElement) {
    messageElement.classList.remove('show');
  }
});



