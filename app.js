const Form = document.getElementById('join');

function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.add('show');

        setTimeout(() => {
            errorMessageDiv.classList.remove('show');
        }, 5000);
    } else {
        errorMessageDiv.textContent = '';
        errorMessageDiv.classList.remove('show');
    }
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function validatePassword(password) {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
}

async function handleRegister(form) {

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value.trim();
    
    let errors = [];
    const inputFields = form.querySelectorAll('input[required]');

    inputFields.forEach(field => {
        if (field.value.trim() === '') {
            errors.push(`Field ${field.name} is required.`);
        }
    });

    validateEmail(email);

    console.log('email test:', validateEmail(email));
    if (email && !validateEmail(email)) {
        errors.push("Please enter a valid email address.");
    }

    validatePassword(password);
    if (password && !validatePassword(password)) {
        errors.push("Password must be at least 8 characters long, contain at least one uppercase letter and one number.");
    }

    const users = await getUsers();
    const emailExists = users.some(user => user.email === email);
    
    if (emailExists) {
        errors.push("This email is already registered. Please use a different email.");
    }

    if (errors.length > 0) {
        displayErrorMessage(errors.join("\n"));
        return;
    }

    // Clear error messages if no errors
    displayErrorMessage('');

    const sessionToken = btoa(email + ':' + Date.now());

    const user = {
        name,
        email,
        password,
        sessionToken
    };

    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const newUser = await response.json();
            console.log(`User ${newUser.name} registered successfully!`);

            localStorage.setItem('sessionToken', newUser.sessionToken);
            localStorage.setItem('currentUser', JSON.stringify({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }));
           
            window.location.href = 'artifacts.html';
        } else {
            alert('Failed to register user. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering the user.');
    }
}


async function getUsers() {
    try {
        let response = await fetch('http://localhost:3000/users');
        
        if (response.ok) {
            let users = await response.json();
            return users; 
        } else {
            console.error('Error:', response.status);
            return []; 
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return []; 
    }
}


Form.addEventListener('click', (event) => {
    if (event.target.id === 'loginSwitch') {
        Form.innerHTML = `
            <div id="errorMessage" class="error-message"></div>
            <h1>Welcome Back!</h1>
            <form>
                <input type="email" placeholder="Email" name="email" id="login-email">
                <input type="password" name="password" placeholder="Password" id="login-password">
                <button type="submit" id="login">Login</button>
            </form>
            <p>Don't have an account? <a href="#" id="registerSwitch">Register</a></p>
        `;
    } else if (event.target.id === 'registerSwitch') {
        Form.innerHTML = `
            <div id="errorMessage" class="error-message"></div>
            <h1>Join Us Today!</h1>
            <form>
                <input type="text" name="name" placeholder="Name">
                <input type="email" name="email" placeholder="Email" >
                <input type="password" name="password" placeholder="Password" >
                <button type="submit" id="register">Register</button>
            </form>
            <p>Already have an account? <a id="loginSwitch" href="#">Login</a></p>
        `;
    }
});


// Event delegation for form submissions
Form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    if (submitButton.id === 'register') {
        await handleRegister(event.target);
    } else if (submitButton.id === 'login') {
        await handleLogin(event.target);
    }
});


async function handleLogin(form) {
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value.trim();

    let errors = [];

    const inputFields = form.querySelectorAll('input[required]');
    inputFields.forEach(field => {
        if (field.value.trim() === '') {
            errors.push(`Field ${field.name} is required.`);
        }
    });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    if (!password) {
        errors.push("Password is required.");
    }

    if (errors.length > 0) {
        displayErrorMessage(errors.join("\n"));
        return;
    }

    // Clear any previous error messages
    displayErrorMessage('');

    try {
        const users = await getUsers();
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            const sessionToken = btoa(email + ':' + Date.now());
            console.log('sessionToken:', sessionToken);

            const updateResponse = await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionToken })
            });

            if (updateResponse.ok) {
                const updatedUser = await updateResponse.json();

                localStorage.setItem('sessionToken', sessionToken);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email
                }));
                console.log(`Login successful! Welcome back, ${updatedUser.name}!`);
                window.location.href = 'artifacts.html';
            } else {
                displayErrorMessage('Error updating session. Please try again.');
            }
        } else {
            displayErrorMessage('Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        displayErrorMessage('An error occurred while logging in.');
    }
}

// Handle admin login form submission
const adminLoginForm = document.getElementById('adminLoginForm');

adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    let errors = [];

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    // Validate password presence
    if (!password) {
        errors.push("Password is required.");
    }

    // Show errors if any
    if (errors.length > 0) {
        alert(errors.join("\n")); 
        return; 
    }

    try {
        const users = await getUsers(); // Fetch users from JSON server

        
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
             const sessionToken = btoa(email + ':' + Date.now());
            console.log('sessionToken:', sessionToken);
           
            const updateResponse = await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionToken })
            });

            if (updateResponse.ok) {
                const updatedUser = await updateResponse.json();
               
                localStorage.setItem('sessionToken', sessionToken);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email
                }));
            if (email === 'admin@gmail.com') {
               
                window.location.href = 'admin.html';
            } else {
                
                alert(`Login successful! Welcome back, ${user.name}!`);
                console.log(`Login successful! Welcome back, ${user.name}!`);
                
                window.location.href = 'artifacts.html';
            }
        } else {
            alert('Invalid email or password. Please try again.');
        }
    }
 }catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('adminLoginModal');
    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.querySelector('.close');
    
    
    openModalButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        modal.style.display = 'block'; 
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'; 
        }
    });

});
async function verifySession(sessionToken) {
    try {
        const users = await getUsers();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const user = users.find(u => u.id === currentUser.id);
        
        return user && user.sessionToken === sessionToken;
    } catch (error) {
        console.error('Session verification error:', error);
        return false;
    }
}

function logout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser?.id) {
        // Clear session token in JSON Server
        fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionToken: null })
        }).catch(error => console.error('Error clearing session:', error));
    }

    localStorage.removeItem('sessionToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
}

// Function to protect routes
function requireAuth() {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
        window.location.href = '/';
        return;
    }

    verifySession(sessionToken).then(isValid => {
        if (!isValid) {
            logout();
        }
    });
}



