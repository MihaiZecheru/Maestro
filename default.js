import { loggedIn, isTeacher } from '/auth.mjs';

if (loggedIn()) {
  const login = document.getElementById('login');
  login.innerText = 'Account';
  login.href = '/account/';
} else {
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html' && window.location.pathname !== '/login/' && window.location.pathname !== '/login/index.html') {
    window.location.href = '/login/?error=loginRequired';
  }
}

if (isTeacher()) {
  // add dropdown for `create <assignment|module|resource>`
  // to the header if the user is a teacher

  document.querySelector('header').innerHTML += `
  <div class="dropdown" id="create-dropdown">
    <button
      class="btn btn-dark dropdown-toggle"
      type="button"
      id="create-dropdown-btn"
      data-mdb-toggle="dropdown"
      aria-expanded="false"
    >
      Create
    </button>
    <ul class="dropdown-menu" aria-labelledby="create-dropdown-btn">
      <li><a class="dropdown-item" href="/create/assignment/">Assignment</a></li>
      <li><a class="dropdown-item" href="/create/module/">Module</a></li>
      <li><a class="dropdown-item" href="/create/quiz/">Quiz</a></li>
      <li><a class="dropdown-item" href="/create/resource/">Resource</a></li>
      <li><hr class="dropdown-divider" /></li>
      <li><a class="dropdown-item" href="/grade/">Admin Dashboard</a></li>
    </ul>
  </div>`;
}

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.target.children[0]?.click();
    }
  });
});