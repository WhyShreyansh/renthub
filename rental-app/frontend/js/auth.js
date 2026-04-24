function initAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  const navAvatar = document.getElementById('nav-avatar');
  const navUsername = document.getElementById('nav-username');

  if (token && user) {
    if (navAuth) navAuth.style.display = 'none';
    if (navUser) navUser.style.display = 'flex';
    if (navAvatar) {
      if (user.avatar) navAvatar.src = `http://localhost:5000${user.avatar}`;
      else navAvatar.style.cssText = 'background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;border-radius:50%;width:34px;height:34px;';
      navAvatar.textContent = user.avatar ? '' : user.name?.charAt(0).toUpperCase();
    }
    if (navUsername) navUsername.textContent = user.name?.split(' ')[0];
  } else {
    if (navAuth) navAuth.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function openModal(type) {
  const overlay = document.getElementById('modal-overlay');
  const loginDiv = document.getElementById('modal-login');
  const regDiv = document.getElementById('modal-register');
  if (!overlay) return;
  overlay.classList.add('open');
  if (type === 'login') {
    loginDiv.style.display = 'block';
    regDiv.style.display = 'none';
  } else {
    loginDiv.style.display = 'none';
    regDiv.style.display = 'block';
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

async function login() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  if (!email || !pass) { errEl.textContent = 'Please fill all fields'; return; }
  try {
    const res = await api.post('/auth/login', { email, password: pass });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    closeModal();
    initAuth();
    showToast('Welcome back, ' + res.user.name + '!', 'success');
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function register() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-pass').value;
  const phone = document.getElementById('reg-phone').value;
  const location = document.getElementById('reg-location').value;
  const errEl = document.getElementById('reg-error');
  errEl.textContent = '';
  if (!name || !email || !pass) { errEl.textContent = 'Please fill required fields'; return; }
  if (pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters'; return; }
  try {
    const res = await api.post('/auth/register', { name, email, password: pass, phone, location });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    closeModal();
    initAuth();
    showToast('Account created! Welcome, ' + res.user.name + '!', 'success');
  } catch (err) {
    errEl.textContent = err.message;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

function toggleUserMenu() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu')) {
    document.getElementById('user-dropdown')?.classList.remove('open');
  }
});

// Enter key on login/register
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('modal-overlay')?.classList.contains('open')) {
    const loginVisible = document.getElementById('modal-login')?.style.display !== 'none';
    if (loginVisible) login();
    else register();
  }
});

initAuth();

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (nb) nb.classList.toggle('scrolled', window.scrollY > 20);
});
