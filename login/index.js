import { login } from '../auth.mjs';

document.getElementById('profilepic').addEventListener('click', () => {
  document.getElementById('pic-input').click();
});

document.getElementById('submit').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  await login(username, password).then((success) => {
    if (success) {
      window.location.href = '/home';
    } else {
      new bootstrap.Modal(document.getElementById('login-error')).show();
      document.getElementById('close').focus();
    }
  });
});

document.getElementById('show-password').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.getElementById('password').type = 'text';
  } else {
    document.getElementById('password').type = 'password';
  }
});

document.getElementById('username').addEventListener('keydown', (e) => {
  // only allow alphanumeric characters
  switch (e.key) {
    case 'Backspace':
    case 'Tab':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'Delete':
      return;
  }
  
  if (!(/^[a-zA-Z0-9]$/).test(e.key)) {
    e.preventDefault();
  }
});

document.getElementById('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('submit').click();
  }
});

document.getElementById('username').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('submit').click();
  }
});

document.getElementById('login-error').addEventListener('hidden.bs.modal', () => {
  document.querySelector('.modal-backdrop.show')?.remove();
  document.getElementById('username').focus();
});

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.target.children[0].click();
    }
  });
});

document.getElementById('show-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.target.click();
    e.preventDefault();
  }
});