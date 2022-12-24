import { teacherOnly } from '/auth.mjs';
import API from '/api.mjs';

teacherOnly();
const nameBox = document.getElementById('name');
const pointValueBox = document.getElementById('point-value');
const moduleBox = document.getElementById('module');
const descriptionBox = document.getElementById('description');
const submissionTypeBox = document.getElementById('submission-type');
const allowCommentsBox = document.getElementById('allow-comments');
const dateBox = document.getElementById('date');
const submit = document.getElementById('submit');

// disable past on datepicker
new mdb.Datepicker(document.querySelector('.datepicker-disable-past'), {
  disablePast: true,
  format: 'mm/dd/yyyy',
});

API.getModules().then((modules) => {
  // populate modules selector
  modules.forEach((module) => {
    const option = document.createElement('option');
    option.value = module;
    option.innerText = module;
    moduleBox.appendChild(option);
  });
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
  if (/[^\w\-\s]/.test(e.target.value) || !e.target.value) {
    setInvalid(e);
  } else {
    setValid(e);
  }
});

pointValueBox.addEventListener('input', (e) => {
  const v = e.target.value;

  if (/[^\d\.]/.test(v) || (v.match(/\./g) || []).length > 1 || v.startsWith('.') || v.endsWith('.') || !v) {
    setInvalid(e);
  } else {
    setValid(e);
  }
});

moduleBox.addEventListener('input', (e) => {
  if (e.target.value) {
    setValid(e);
  } else {
    setInvalid(e);
  }
});

descriptionBox.addEventListener('input', (e) => {
  if (!!e.target.value) {
    e.target.classList.remove('is-invalid');
    e.target.classList.remove('is-valid');
  }
  
  if (e.target.value.length <= 500) {
    document.getElementById('valid-charcount').innerText = e.target.value.length;
    setValid(e);
  } else {
    document.getElementById('invalid-charcount').innerText = e.target.value.length;
    setInvalid(e);
  }
});

submissionTypeBox.addEventListener('change', (e) => {
  if (e.target.value) {
    setValid(e);
  } else {
    setInvalid(e);
  }
});

allowCommentsBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    allowCommentsBox.click();
  }
});

function dateboxHandler(e) {
  const today = new Date();
  const date = new Date(e.target.value);

  // set time to 00:00:00:000
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date == "Invalid Date" || date < today) {
    setInvalid(e);
    return;
  }

  if ((/^\d\d\/\d\d\/\d\d\d\d$/).test(e.target.value)) {
    setValid(e);
  } else {
    setInvalid(e);
  }
}

const datetimeBtn = document.querySelector('.far.fa-calendar.datepicker-toggle-icon');
dateBox.addEventListener('input', dateboxHandler);
dateBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    datetimeBtn.click();
  }
});

datetimeBtn.addEventListener('click', () => {
  (async () => {
    setTimeout(() => {
      document.querySelector('.datepicker-footer-btn.datepicker-ok-btn').addEventListener('click', () => {
        dateboxHandler({ target: dateBox });
      });
    }, 100);
  })();
});

submit.addEventListener('click', (e) => {
  if (nameBox.classList.contains('is-invalid') || pointValueBox.classList.contains('is-invalid') || moduleBox.classList.contains('is-invalid') || descriptionBox.classList.contains('is-invalid') || submissionTypeBox.classList.contains('is-invalid') || dateBox.classList.contains('is-invalid')) {
    e.preventDefault();
    return;
  }

  if (!nameBox.value || !pointValueBox.value || !moduleBox.value || !submissionTypeBox.value || !dateBox.value) {
    // don't prevent default otherwise the tooltip won't show
    return;
  }

  submit.disabled = true;
  e.preventDefault();

  API.createAssignment({
    name: nameBox.value,
    points: parseInt(pointValueBox.value),
    module: moduleBox.value,
    description: descriptionBox.value,
    submissionType: submissionTypeBox.value,
    due: dateBox.value,
    posted: new Date(Date.now()).toLocaleString(),
    allowComments: allowCommentsBox.checked,
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