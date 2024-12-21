let currentQuiz = [];
let currentQuestionIndex = 0;
let userScore = 0;
let users = JSON.parse(localStorage.getItem('users')) || {}; // Load users from localStorage
let loggedInUser = localStorage.getItem('loggedInUser'); // Check if a user is already logged in
let stayLoggedIn = JSON.parse(localStorage.getItem('stayLoggedIn')); // Check if the user chose to stay logged in

document.addEventListener('DOMContentLoaded', () => {
    if (loggedInUser && stayLoggedIn) {
        showDashboard();
    } else {
        localStorage.removeItem('loggedInUser'); // Clear logged in user on page load if not staying logged in
        localStorage.removeItem('stayLoggedIn');
    }

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            navigateTo(event.state.page);
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(page).style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showChoiceModal() {
    navigateTo('choice-modal');
    history.pushState({ page: 'choice-modal' }, '', '#choice-modal');
}

function showLoginModal() {
    navigateTo('login-modal');
    history.pushState({ page: 'login-modal' }, '', '#login-modal');
}

function showRegistrationModal() {
    navigateTo('registration-modal');
    history.pushState({ page: 'registration-modal' }, '', '#registration-modal');
}

function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar) {
        return true;
    } else {
        alert('Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, and one special character.');
        return false;
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me-login').checked;

    if (users[username] && users[username] === password) {
        loggedInUser = username;
        localStorage.setItem('loggedInUser', username); // Persist the logged-in user
        localStorage.setItem('stayLoggedIn', rememberMe); // Persist the stay logged in option
        document.getElementById('login-modal').style.display = 'none'; // Hide login modal
        showDashboard();
    } else {
        alert('Invalid username or password');
    }
}

function register() {
    const fullName = document.getElementById('reg-fullname').value;
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const rememberMe = document.getElementById('remember-me-register').checked;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (fullName && username && email && validatePassword(password)) {
        users[username] = password; // Store user
        localStorage.setItem('users', JSON.stringify(users)); // Persist users
        localStorage.setItem('stayLoggedIn', rememberMe); // Persist the stay logged in option
        document.getElementById('registration-modal').style.display = 'none';
        document.getElementById('login-modal').style.display = 'flex';
    } else {
        alert('Please fill in all fields');
    }
}

function showDashboard() {
    navigateTo('user-dashboard');
    history.pushState({ page: 'user-dashboard' }, '', '#user-dashboard');
    document.getElementById('welcome-message').textContent = `Welcome, ${loggedInUser}!`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz(language) {
    currentQuiz = [];
    currentQuestionIndex = 0;
    userScore = 0;

    console.log(`Starting quiz for language: ${language}`); // Debugging log
    fetch('http://localhost:3000/api/questions')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched Questions:', data); // Debugging log
            currentQuiz = data.filter(q => q.type === language);
            currentQuiz = shuffleArray(currentQuiz); // Shuffle questions
            console.log('Shuffled Questions:', currentQuiz); // Debugging log
            displayQuestion();
            navigateTo('quiz-container'); // Ensure the quiz container is displayed
        })
        .catch(error => console.error('Error fetching questions:', error));
}

function displayQuestion() {
    if (currentQuestionIndex < currentQuiz.length) {
        const question = currentQuiz[currentQuestionIndex];
        const quizContainer = document.getElementById('current-question');
        quizContainer.innerHTML = `
            <h3>${question.question}</h3>
            <div class="question-options">
                ${question.options.map((opt, index) => `<button class="option-btn" onclick="checkAnswer(${index})">${opt}</button>`).join('')}
            </div>
            <button class="modal-button" onclick="exitQuiz()">Exit Quiz</button>
        `;
        document.getElementById('quiz-container').style.display = 'block';
    } else {
        displayScore();
        navigateTo('score-card'); // Ensure the score card is displayed
    }
}

function checkAnswer(selectedIndex) {
    const question = currentQuiz[currentQuestionIndex];
    if (question && selectedIndex === question.correctAnswer) {
        userScore++;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
        displayQuestion();
    } else {
        displayScore();
        navigateTo('score-card'); // Ensure the score card is displayed
    }
}

function displayScore() {
    const scorePercentage = ((userScore / currentQuiz.length) * 100).toFixed(2);
    const scoreCard = document.getElementById('score-card');
    scoreCard.innerHTML = `
        <div class="falling-flowers"></div>
        <div class="falling-sparkles"></div>
        <h2 class="congratulations">Congratulations!</h2>
        <h2>Your Quiz Score</h2>
        <p id="final-score">You scored ${userScore} out of ${currentQuiz.length} (${scorePercentage}%)</p>
        <button class="modal-button" onclick="returnToDashboard()">Back to Home</button>
    `;
    scoreCard.style.display = 'block';
    console.log('Displayed score card with user score:', userScore, 'out of', currentQuiz.length, '(', scorePercentage, '%)'); // Debugging log
}

function returnToDashboard() {
    // Reset quiz state
    currentQuiz = [];
    currentQuestionIndex = 0;
    userScore = 0;

    // Hide quiz elements
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('score-card').style.display = 'none';

    // Reset inner HTML to ensure elements are properly cleared
    document.getElementById('current-question').innerHTML = '';
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('score-card').innerHTML = '';

    // Show dashboard
    showDashboard();
    console.log('Returned to dashboard'); // Debugging log
}

function exitQuiz() {
    // Reset quiz state
    currentQuiz = [];
    currentQuestionIndex = 0;
    userScore = 0;

    // Hide quiz elements
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('score-card').style.display = 'none';

    // Reset inner HTML to ensure elements are properly cleared
    document.getElementById('current-question').innerHTML = '';
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('score-card').innerHTML = '';

    // Show dashboard
    showDashboard();
    console.log('Exited quiz and returned to dashboard'); // Debugging log
}
