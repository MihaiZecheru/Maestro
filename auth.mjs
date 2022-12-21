import { getCookie, setCookie, deleteCookie } from './cookies.mjs';
import API from './api.mjs';

export function loggedIn() {
  return !!getCookie('token');
}

export async function login(username, password) {
  const user = await API.get('users/' + username);

  if (user && user.password === password) {
    setCookie('token', user.token);
    setCookie('cc-username', username);
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

export async function teacherOnly() {
  if (loggedIn() && !(await API.get('/users/' + getUsername())).isteacher) {
    window.location.href = '/dashboard/?error=teacherOnly';
  }
}

export async function requireLogin() {
  if (!loggedIn()) {
    window.location.href = '/login/?error=loginRequired';
  }
}