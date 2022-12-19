import { loggedIn } from './auth.mjs';

if (loggedIn()) {
  const login = document.getElementById('login');
  login.innerText = 'Account';
  login.href = '/account/';
}