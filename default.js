import { loggedIn } from './auth.mjs';

if (loggedIn()) {
  const login = document.getElementById('login');
  login.innerText = 'Account';
  login.href = '/account/';
}

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.target.children[0].click();
    }
  });
});