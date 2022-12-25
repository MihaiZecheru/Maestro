import { getCookie, setCookie, deleteCookie } from './cookies.mjs';
import API from './api.mjs';

export async function login(username, password) {
  const user = await API.get('users/' + username);

  if (user && user.password === password) {
    setCookie('token', user.token);
    setCookie('cc-username', username);
    setCookie('cc-isteacher', user.isteacher);
    return true;
  }

  return false;
}

export function loggedIn() {
  return !!getCookie('token');
}

export function logout() {
  deleteCookie('token');
}

export function getUsername() {
  return getCookie('cc-username');
}

export async function teacherOnly() {
  if (loggedIn() && !getCookie('cc-isteacher')) {
    window.location.href = '/dashboard/?error=teacherOnly';
  }
}

export function isTeacher() {
  return loggedIn() && getCookie('cc-isteacher');
}