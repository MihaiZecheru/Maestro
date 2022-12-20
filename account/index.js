import API from '../api.mjs';
import { getUsername } from '../auth.mjs';

API.get('/users/' + getUsername()).then((user) => {
  if (user.isteacher) {
    document.getElementById('stats').innerHTML = `<button class="btn btn-success">View Teacher Dashboard</button>`
  }
});