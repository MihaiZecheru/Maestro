import { teacherOnly } from '/auth.mjs';
import API from '/api.mjs';

teacherOnly();
const nameBox = document.getElementById('name');
const url = document.getElementById('url');
const body = document.getElementById('body');
const moduleBox = document.getElementById('module');
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

moduleBox.addEventListener('input', (e) => {
  if (modules.includes(e.target.value)) {
    setValid(e);
  } else {
    setInvalid(e);
  }
});

url.addEventListener('input', (e) => {
  if (!e.target.value) {
    e.target.classList.remove('is-invalid');
    e.target.classList.remove('is-valid');
    return;
  }

  if ((/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm).test(e.target.value)) {
    setValid(e);
  } else {
    setInvalid(e);
  }
});

body.addEventListener('input', (e) => {
  if (!e.target.value) {
    e.target.classList.remove('is-invalid');
    e.target.classList.remove('is-valid');
    return;
  }

  if (e.target.value.length <= 9999) {
    document.getElementById('valid-charcount').innerText = e.target.value.length;
    setValid(e);
  } else {
    document.getElementById('invalid-charcount').innerText = e.target.value.length;
    setInvalid(e);
  }
});

submit.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submit.click();
  }
});

submit.addEventListener('click', (e) => {
  if (!nameBox.value || !moduleBox.value) {
    return;
  }
  
  e.preventDefault();

  if (nameBox.classList.contains('is-invalid') || moduleBox.classList.contains('is-invalid') || body.classList.contains('is-invalid') || url.classList.contains('is-invalid')) {
    return;
  }

  if (body.value.length === 0 && url.value.length === 0) {
    new bootstrap.Modal(document.getElementById('cartesian-dualism-modal')).show();
    document.getElementById('close-2').focus();  
    document.getElementById('cartesian-dualism-modal').addEventListener('hidden.bs.modal', () => {
      url.focus();
    });
    return;
  }

  submit.disabled = true;
  API.createResource({
    name: nameBox.value,
    module: moduleBox.value,
    description: body.value || "",
    url: url.value || ""
  }).then((res) => {
    if (res.status === 200) {
      window.location.href = '/dashboard/';
    } else {
      new bootstrap.Modal(document.getElementById('error-modal')).show();
    }
  });
});

nameBox.focus();