import { teacherOnly } from '/auth.mjs';
import API from '/api.mjs';

teacherOnly();
const nameBox = document.getElementById('name');
const description = document.getElementById('description');
const submit = document.getElementById('submit');

let modules;
API.getModules().then((_modules) => {
  modules = _modules;
});

function setInvalid(e) {
  e.target.classList.add('is-invalid');
  e.target.classList.remove('is-valid');
}

function setValid(e) {
  e.target.classList.add('is-valid');
  e.target.classList.remove('is-invalid');
}

nameBox.addEventListener('input', (e) => {
  if (modules.includes(e.target.value)) {
    document.getElementById('invalid-name').innerText = "Module already exists.";
  } else if (e.target.value.length > 25) {
    document.getElementById('invalid-name').innerText = "Must be less than 25 characters.";
  } else {
    document.getElementById('invalid-name').innerText = "Must be alphanumeric (no spaces)";
  }

  if (/[^\w\-]/.test(e.target.value) || !e.target.value || e.target.value.length > 25 || modules.includes(e.target.value)) {
    setInvalid(e);
  } else {
    setValid(e);
  }
});

description.addEventListener('input', (e) => {
  if (e.target.value.length <= 500) {
    document.getElementById('valid-charcount').innerText = e.target.value.length;
    setValid(e);
  } else {
    document.getElementById('invalid-charcount').innerText = e.target.value.length;
    setInvalid(e);
  }
});

submit.addEventListener('click', (e) => {
  if (nameBox.classList.contains('is-invalid') || description.classList.contains('is-invalid')) {
    e.preventDefault();
    return;
  }

  if (!nameBox.value) {
    // don't prevent default otherwise the tooltip won't show
    return;
  }

  submit.disabled = true;
  e.preventDefault();

  API.createModule({
    name: nameBox.value,
    description: description.value,
    assignmentCount: 0,
    resourceCount: 0,
    pointsInModule: 0
  }).then((res) => {
    if (res.status === 200) {
      window.location.href = '/dashboard/';
    } else {
      new bootstrap.Modal(document.getElementById('error-modal')).show();
    }
  });
});

submit.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submit.click();
  }
});

nameBox.focus();