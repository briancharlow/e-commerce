const Form = document.getElementById('join');

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

// Event delegation for form switching
Form.addEventListener('click', (event) => {
    if (event.target.id === 'loginSwitch') {
        Form.innerHTML = `
            <h1>Welcome Back!</h1>
            <form>
                <input type="email" placeholder="Email" name="email" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit" id="login">Login</button>
            </form>
            <p>Don't have an account? <a href="#" id="registerSwitch">Register</a></p>
        `;
    } else if (event.target.id === 'registerSwitch') {
        Form.innerHTML = `
            <h1>Join Us Today!</h1>
            <form>
                <input type="text" name="name" placeholder="Name" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
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

async function handleRegister(form) {
    const name = form.querySelector('input[name="name"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    
    let errors = [];
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
        errors.push("Password must be at least 8 characters long, contain at least one uppercase letter and one number.");
    }

    const users = await getUsers();
    const emailExists = users.some(user => user.email === email);
    
    if (emailExists) {
        errors.push("This email is already registered. Please use a different email.");
    }

    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }

    const user = { name, email, password };

    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            window.location.href = 'artifacts.html';
        } else if (response.status === 409) {
            const errorData = await response.json();
            alert(`Failed to register user: ${errorData.message || 'Email already in use.'}`);
        } else {
            const errorData = await response.json();
            alert(`Failed to register user: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering the user.');
    }
}

async function handleLogin(form) {
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    let errors = [];

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    if (!password) {
        errors.push("Password is required.");
    }

    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }

    try {
        const users = await getUsers();
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            console.log(`Login successful! Welcome back, ${user.name}!`);
            window.location.href = 'artifacts.html';
        } else {
            alert('Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
}

// Initial users fetch
getUsers();