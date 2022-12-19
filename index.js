import { loggedIn } from './auth.mjs';

if (loggedIn()) {
  const login = document.getElementById('login');
  login.style.content = 'Account';
  login.href = './account/';
}