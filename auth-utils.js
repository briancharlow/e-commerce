// auth-utils.js

// Get all users from the server
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

// Verify session token against JSON Server
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

// Logout function
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



function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function validatePassword(password) {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
}

// Export the functions so they can be imported by other files
// export { requireAuth, verifySession, logout, getUsers };

module.exports = {validateEmail, validatePassword, requireAuth }