import { getCookie, setCookie, deleteCookie } from './cookies.mjs';
import API from './api.mjs';

export function loggedIn() {
  return !!getCookie('token');
}

export async function login(username, password) {
  const user = await API.get('users/' + username);

  if (user && user.password === password) {
    setCookie('token', user.token);
    setCookie('cc-username', user.username);
    return true;
  }

  return false;
}

export function logout() {
  deleteCookie('token');
}

export function getUsername() {
  return getCookie('cc-username');
}