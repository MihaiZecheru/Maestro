import { getCookie, setCookie, deleteCookie } from './cookies.mjs';
import API from './api.mjs';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function loggedIn() {
  return !!getCookie('token');
}

export async function login(username, password) {
  const user = await API.get('users/' + username);
  
  if (user && user.password === password) {
    setCookie('token', user.token);
    return true;
  }

  return false;
}

export function logout() {
  deleteCookie('token');
}

export async function register(username, password) {
  const token = uuid();
  await API.post('users/' + username, { username, password, token });
}