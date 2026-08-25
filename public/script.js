const firebaseConfig = {
  apiKey: "AIzaSyC2T0pDU7WJaB5RIiuJTOl_QOjrMafhdac",
  authDomain: "electric-36ba4.firebaseapp.com",
  projectId: "electric-36ba4",
  storageBucket: "electric-36ba4.firebasestorage.app",
  messagingSenderId: "988762865455",
  appId: "1:988762865455:web:ccaf72d53ac7be4ab2ebda"
};

const app = window.initializeApp(firebaseConfig);
const auth = window.getAuth(app);
const provider = new window.GoogleAuthProvider();

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const backendStatus = document.getElementById('backend-status');

// Handle Auth State
window.onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailSpan.textContent = user.displayName || user.email;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    userEmailSpan.textContent = '';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
});

// Login
loginBtn.addEventListener('click', () => {
  window.signInWithPopup(auth, provider).catch(console.error);
});

// Logout
logoutBtn.addEventListener('click', () => {
  window.signOut(auth);
});

// Ping Backend
fetch('/api/health')
  .then(res => res.json())
  .then(data => {
    backendStatus.textContent = data.message;
  })
  .catch(err => {
    backendStatus.textContent = 'Failed to connect to backend.';
    console.error(err);
  });
