import { getCookie } from './cookies.mjs';

export function loggedIn() {
  return !!getCookie('token');
}