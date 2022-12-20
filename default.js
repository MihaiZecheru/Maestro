import { loggedIn } from './auth.mjs';

if (loggedIn()) {
  const login = document.getElementById('login');
  login.innerText = 'Account';
  login.href = '/account/';
} else {
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html' && window.location.pathname !== '/login/' && window.location.pathname !== '/login/index.html') {
    window.location.href = '/';
  }
}

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.target.children[0]?.click();
    }
  });
});