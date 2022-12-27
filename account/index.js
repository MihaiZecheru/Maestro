import API from '../../api.mjs';
import { getUsername } from '../../auth.mjs';
// TODO: GET TOTAL NUMBER OF ASSIGNMENTS / QUIZZES / POINTS ETC. AND DISPLAY THE USER'S STATS AS X/Y
let password;

API.get('/users/' + getUsername()).then((user) => {
  document.getElementById('username').innerHTML = user.username;
  document.getElementById('password').value = user.password;
  document.getElementById('pfp').src = user.pfp;
  password = user.password;
  
  if (user.isteacher) {
    document.getElementById('stats').innerHTML = `<a class="btn btn-success" href="/dashboard/">View Teacher Dashboard</a>`
  } else {
    document.getElementById('rank').innerHTML = user.rank;
    document.getElementById('points').innerHTML = user.points;
    document.getElementById('completed').innerHTML = `
      <ul>
        <li>Assignments: ${user.completed.assignments}</li>
        <li>Quizzes: ${user.completed.quizzes}</li>
      </ul>
    `;
  }
});

document.getElementById('show-password').addEventListener('change', () => {
  if (document.getElementById('show-password').checked) {
    document.getElementById('password').type = 'text';
  } else {
    document.getElementById('password').type = 'password';
  }
});

document.getElementById('show-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('show-password').click();
});

document.getElementById('password').addEventListener('keydown', (e) => {
  const ele = document.getElementById('password');
  const newPassword = ele.value;

  if (e.key === 'Enter' && newPassword !== password) {
    API.put(`/users/${getUsername()}/password`, newPassword).then(() => {
      ele.value = password;
      ele.blur();
    });
  }
});