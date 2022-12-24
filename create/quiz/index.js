import { teacherOnly } from '/auth.mjs';
import Question from './question.mjs';
import API from '/api.mjs';

teacherOnly();
const nameBox = document.getElementById('name');
const descriptionBox = document.getElementById('description');
const moduleBox = document.getElementById('module');
const submissionTypeBox = document.getElementById('submission-type');
const allowCommentsBox = document.getElementById('allow-comments');
const dateBox = document.getElementById('date');
const addQuestion = document.getElementById('add-question');
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

nameBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.value) {
    e.preventDefault();
    descriptionBox.focus();
  }
});

descriptionBox.addEventListener('input', (e) => {
  if (!e.target.value.length) {
    e.target.classList.remove('is-valid');
    e.target.classList.remove('is-invalid');
  }

  if (e.target.value.length <= 500) {
    document.getElementById('valid-charcount').innerText = e.target.value.length;
    setValid(e);
  } else {
    document.getElementById('invalid-charcount').innerText = e.target.value.length;
    setInvalid(e);
  }
});

moduleBox.addEventListener('input', (e) => {
  if (e.target.value) {
    setValid(e);
  } else {
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

Array.from(document.querySelectorAll('.question-point-value > input')).forEach((ele) => {
  ele.addEventListener('input', (e) => {
    const v = e.target.value;

    if (/[^\d\.]/.test(v) || (v.match(/\./g) || []).length > 1 || v.startsWith('.') || v.endsWith('.') || !v) {
      setInvalid(e);
    } else {
      setValid(e);
    }
  });
});

submit.addEventListener('click', (e) => {
  if (nameBox.classList.contains('is-invalid') || moduleBox.classList.contains('is-invalid') || descriptionBox.classList.contains('is-invalid') || submissionTypeBox.classList.contains('is-invalid') || dateBox.classList.contains('is-invalid')) {
    e.preventDefault();
    return;
  }

  if (!nameBox.value || !moduleBox.value || !submissionTypeBox.value || !dateBox.value) {
    // don't prevent default otherwise the tooltip won't show
    return;
  }

  submit.disabled = true;
  e.preventDefault();
  
  const forms = document.querySelectorAll('.tab-pane.fade:not(#list-buttons)');
  let questions = [];

  // validate every form
  for (let i = 1; i <= forms.length; i++) {
    const form = forms[i - 1];
    const question = form.querySelector('.question').value;

    if (!question) {
      // modal showing the question number (i) that has no question given
      submit.disabled = false;
      document.getElementById('no-question-given-modal-question-number').innerText = i;
      new mdb.Modal(document.getElementById('no-question-given-modal')).show();
      document.getElementById('no-question-given-modal').addEventListener('hidden.mdb.modal', () => {
        document.querySelectorAll('modal-backdrop').forEach((ele) => ele.remove());
        new mdb.Tab(document.getElementById(`list-q${i}-list`)).show();
      });
      return;
    }

    const points = form.querySelector('.question-point-value > input').value;

    if (/[^\d\.]/.test(points) || (points.match(/\./g) || []).length > 1 || points.startsWith('.') || points.endsWith('.') || !points) {
      // modal showing the question number (i) that has invalid points given
      submit.disabled = false;
      document.getElementById('invalid-points-modal-question-number').innerText = i;
      new mdb.Modal(document.getElementById('invalid-points-modal')).show();
      document.getElementById('invalid-points-modal').addEventListener('hidden.mdb.modal', () => {
        document.querySelectorAll('modal-backdrop').forEach((ele) => ele.remove());
        new mdb.Tab(document.getElementById(`list-q${i}-list`)).show();
      });
      return;
    }

    const options = [
      form.querySelector('.answer-option-a').value,
      form.querySelector('.answer-option-b').value,
      form.querySelector('.answer-option-c').value,
      form.querySelector('.answer-option-d').value
    ];

    if (options[0].length === 0 && options[1].length === 0 && options[2].length === 0 && options[3].length === 0) {
      // modal showing the question number (i) that has no options given
      submit.disabled = false;
      document.getElementById('no-options-given-modal-question-number').innerText = i;
      new mdb.Modal(document.getElementById('no-options-given-modal')).show();
      document.getElementById('no-options-given-modal').addEventListener('hidden.mdb.modal', () => {
        document.querySelectorAll('modal-backdrop').forEach((ele) => ele.remove());
        new mdb.Tab(document.getElementById(`list-q${i}-list`)).show();
      });
      return;
    }

    let correct = Array.from(form.querySelectorAll('.radio-btn > input')).filter((ele) => ele.checked);
    
    if (correct.length === 0) {
      // modal showing the question number (i) that has no 'correct' answer checked
      submit.disabled = false;
      document.getElementById('no-answer-given-modal-question-number').innerText = i;
      new mdb.Modal(document.getElementById('no-answer-given-modal')).show();
      document.getElementById('no-answer-given-modal').addEventListener('hidden.mdb.modal', () => {
        document.querySelectorAll('modal-backdrop').forEach((ele) => ele.remove());
        new mdb.Tab(document.getElementById(`list-q${i}-list`)).show();
      });
      return;
    }

    correct = correct[0].getAttribute('data-option');

    // check to see if the correct answer is an empty option
    if (options[correct.charCodeAt(0) - 97].length === 0) {
      // modal showing the question number (i) that has an empty option as the correct answer
      submit.disabled = false;
      document.getElementById('empty-answer-given-modal-question-number').innerText = i;
      new mdb.Modal(document.getElementById('empty-answer-given-modal')).show();
      document.getElementById('empty-answer-given-modal').addEventListener('hidden.mdb.modal', () => {
        document.querySelectorAll('modal-backdrop').forEach((ele) => ele.remove());
        new mdb.Tab(document.getElementById(`list-q${i}-list`)).show();
      });
      return;
    }

    // all values are valid, add to questions array
    questions.push(new Question(question, points, options, correct));
  };

  // get the total amount of points the quiz is worth
  const totalPoints = questions.reduce((acc, cur) => acc + parseInt(cur.points), 0);

  API.createQuiz({
    name: nameBox.value,
    points: totalPoints,
    module: moduleBox.value,
    description: descriptionBox.value,
    submissionType: submissionTypeBox.value,
    due: dateBox.value,
    allowComments: allowCommentsBox.checked,
    questions
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

const stepper = new mdb.Stepper(document.querySelector('.stepper'));
document.getElementById('step-1').addEventListener('click', () => {
  stepper.changeStep(0);
});

nameBox.focus();

descriptionBox.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    stepper.nextStep();
    new Promise(() => {
      setTimeout(() => {
        moduleBox.focus();
      }, 1000);
    })
  }
});

allowCommentsBox.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    stepper.nextStep();
    new Promise(() => {
      setTimeout(() => {
        dateBox.focus();
      }, 1000);
    })
  }
});

function focusNextElement () {
  // add all elements we want to include in our selection
  var focussableElements = 'input:not([disabled])';
  if (document.activeElement && document.activeElement.form) {
      var focussable = Array.prototype.filter.call(document.activeElement.form.querySelectorAll(focussableElements),
      function (element) {
          //check for visibility while always include the current activeElement 
          return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
      });
      var index = focussable.indexOf(document.activeElement);
      if(index > -1) {
         var nextElement = focussable[index + 1] || focussable[0];
         nextElement.focus();
      }                    
  }
}

function radioButtonHandler(radio, radios) {
  radios.forEach((r) => {
    r.parentElement.classList.remove('active');
    r.checked = false;
  });

  radio.parentElement.classList.add('active');
  radio.checked = true;
}

addQuestion.addEventListener('click', (e) => {
  e.preventDefault();

  // check if the current question is question #3. this must be done because of a weird bug
  const currentlyActive = document.querySelector('.list-group-item.active');
  const currentlyActiveNumber = currentlyActive.id.split('-')[1].substring(1);
  
  if (currentlyActiveNumber === '3') {
    // make #1 active instead
    new mdb.Tab(document.getElementById(`list-q1-list`)).show();
  }

  // highest question number
  // no need to subtract one because of the 'extra' list-group-item made just for the two buttons
  const questionNumber = document.querySelectorAll('.list-group-item').length;
  
  const questionsContainer = document.getElementById('questions');
  const questionsContentContainer = document.getElementById('questions-content-container');
  
  // unfocus the current list-group-item so that the new one can be focused
  document.querySelector('.list-group-item.active').classList.remove('active');

  // unfocus the content of the current question so that the new one can be focused
  document.querySelector('#questions-content-container > div.tab-pane.fade.active').classList.remove('active', 'show');

  const question = document.createElement('a');
  question.classList.add('list-group-item', 'list-group-item-action', 'px-3', 'border-0', 'active');
  question.setAttribute('id', `list-q${questionNumber}-list`);
  question.setAttribute('data-mdb-toggle', 'list');
  question.setAttribute('href', `#list-q${questionNumber}`);
  question.setAttribute('role', 'tab');
  question.setAttribute('aria-controls', `list-q${questionNumber}`);
  question.innerText = `Question #${questionNumber}`;
  questionsContainer.insertBefore(question, document.getElementById('list-buttons-list'));

  const questionContent = document.createElement('div');
  questionContent.classList.add('tab-pane', 'fade', 'show', 'active');
  questionContent.setAttribute('id', `list-q${questionNumber}`);
  questionContent.setAttribute('role', 'tabpanel');
  questionContent.setAttribute('aria-labelledby', `list-q${questionNumber}-list`);
  questionContent.innerHTML = `
    <h1><center>Question #${questionNumber}</center></h1>
    <br>
    <div class="d-flex align-items-start bg-light mb-3" style="height: 100%; background-color: #F8DBC2!important;">
      <div class="col-md-1 radio-btn-group radio-btn-group-manual">
        <div class="form-check">
          <input class="form-check-input question-checkmark question-checkmark-manual" type="checkbox" value="" id="question-${questionNumber}-checkmark" onclick="return false" tabindex="-1"/>
          <label class="form-check-label" for="question-${questionNumber}-checkmark"></label>
        </div>
        <hr id="uneven-hr">
        <br>
        <div class="radio-btn radio-btn-manual first-radio-btn">
          <input class="form-check-input" type="radio" id="question-${questionNumber}-a-iscorrect" data-option="a" tabindex="2" />
        </div>
        <br>
        <div class="radio-btn radio-btn-manual">
          <input class="form-check-input" type="radio" id="question-${questionNumber}-b-iscorrect" data-option="b" tabindex="4" />
        </div>
        <br>
        <div class="radio-btn radio-btn-manual">
          <input class="form-check-input" type="radio" id="question-${questionNumber}-c-iscorrect" data-option="c" tabindex="6" />
        </div>
        <br>
        <div class="radio-btn radio-btn-manual">
          <input class="form-check-input" type="radio" id="question-${questionNumber}-d-iscorrect" data-option="d" tabindex="8" />
        </div>
        <br>
        <hr style="margin-top: .5rem;">
      </div>
      <div class="col-sm-11">
        <div class="form-outline form-outline-manual">
          <input type="text" id="question-${questionNumber}" class="form-control input-manual question question-manual" required autocomplete="off" tabindex="1" />
          <label class="form-label" for="question-${questionNumber}">Question</label>
        </div>
        <hr>
        <br>
        <div class="form-outline form-outline-manual">
          <input type="text" id="question-${questionNumber}-a" class="form-control input-manual answer-option-a" required autocomplete="off" tabindex="3" />
          <label class="form-label" for="question-${questionNumber}-a">Answer Option A</label>
        </div>
        <br>
        <div class="form-outline form-outline-manual">
          <input type="text" id="question-${questionNumber}-b" class="form-control input-manual answer-option-b" required autocomplete="off" tabindex="5" />
          <label class="form-label" for="question-${questionNumber}-b">Answer Option B</label>
        </div>
        <br>
        <div class="form-outline form-outline-manual">
          <input type="text" id="question-${questionNumber}-c" class="form-control input-manual answer-option-c" required autocomplete="off" tabindex="7" />
          <label class="form-label" for="question-${questionNumber}-c">Answer Option C</label>
        </div>
        <br>
        <div class="form-outline form-outline-manual">
          <input type="text" id="question-${questionNumber}-d" class="form-control input-manual answer-option-d" required autocomplete="off" tabindex="9" />
          <label class="form-label" for="question-${questionNumber}-d">Answer Option D</label>
        </div>
        <br>
        <hr>
        <div class="question-point-value-container d-flex align-items-start mb-2">
          <div class="col">
            <div class="form-outline form-outline-manual question-point-value">
              <input type="text" class="form-control" id="question-${questionNumber}-point-value" placeholder="0" required autocomplete="off">
              <label for="question-${questionNumber}-point-value" class="form-label">Point Value</label>
              <div class="valid-feedback">
                Looks good!
              </div>
              <div class="invalid-feedback">
                Must be a positive number.
              </div>
            </div>
          </div>
          <div class="delete-question-btn col">
            <button class="btn btn-danger" type="button" id="question-${questionNumber}-delete" onclick="deleteQuestion(this)">Delete Question</button>
          </div>
        </div>
      </div>
      </div>
    </div>`;
    
    questionsContentContainer.appendChild(questionContent);
    document.querySelectorAll('.form-outline-manual').forEach((formOutline) => {
      new mdb.Input(formOutline).init();
    });

    // validation for the point-value box
    document.getElementById(`question-${questionNumber}-point-value`).addEventListener('input', (e) => {
      const v = e.target.value;

      if (/[^\d\.]/.test(v) || (v.match(/\./g) || []).length > 1 || v.startsWith('.') || v.endsWith('.') || !v) {
        setInvalid(e);
      } else {
        setValid(e);
      }
    });

    // pressing enter on a radio button clicks it and prevents submitting the form
    Array.from(document.querySelectorAll('.radio-btn-manual > input')).forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.click();
        }
      });
    });

    // allow enter to tab to next element
    Array.from(document.querySelectorAll('input.input-manual:not([type="radio"])')).forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          focusNextElement();
        }
      });
    });

    // make sure only one radio button is checked at a time
    Array.from(document.querySelectorAll('.radio-btn-group-manual')).forEach((el) => {
      const radios = Array.from(el.querySelectorAll('input[type="radio"]'));
      radios.forEach((radio) => {
        radio.addEventListener('click', (e) => { radioButtonHandler(radio, radios) });
      });
    });

    // handle the checkmark validation
    Array.from(document.querySelectorAll('.question-manual')).forEach((el) => {
      el.addEventListener('input', (e) => {
        const questionNumber = el.id.substring(9);
        
        if (e.target.value) {
            document.getElementById(`question-${questionNumber}-checkmark`).checked = true;
            // write the question prompt to the sidebar
            document.getElementById(`list-q${questionNumber}-list`).innerText = `Question #${questionNumber} - ${e.target.value}`;
          } else {
            document.getElementById(`question-${questionNumber}-checkmark`).checked = false;
            // remove question prompt from the sidebar
            document.getElementById(`list-q${questionNumber}-list`).innerText = `Question #${questionNumber}`;
          }
        });
    });

    // prevent bug where pressing enter on the checkbox will submit the form
    Array.from(document.querySelectorAll('.question-checkmark-manual')).forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // focus the 'question-#-a-iscorrect' element
          el.parentElement.parentElement.querySelector('.first-radio-btn > input').focus();
        }
      });
    });
});

// pressing enter on a radio button clicks it and prevents submitting the form
Array.from(document.querySelectorAll('.radio-btn > input')).forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      el.click();
    }
  });
});

// allow enter to tab to next element
Array.from(document.querySelectorAll('input:not([type="radio"])')).forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextElement();
    }
  });
});

// make sure only one radio button is checked at a time
Array.from(document.querySelectorAll('.radio-btn-group')).forEach((el) => {
  const radios = Array.from(el.querySelectorAll('input[type="radio"]'));
  radios.forEach((radio) => {
    radio.addEventListener('click', (e) => { radioButtonHandler(radio, radios) });
  });
});

// handle the checkmark validation
Array.from(document.querySelectorAll('.question')).forEach((el) => {
  el.addEventListener('input', (e) => {
    const questionNumber = el.id.substring(9);
    
    if (e.target.value) {
        document.getElementById(`question-${questionNumber}-checkmark`).checked = true;
        // write the question prompt to the sidebar
        document.getElementById(`list-q${questionNumber}-list`).innerText = `Question #${questionNumber} - ${e.target.value}`;
      } else {
        document.getElementById(`question-${questionNumber}-checkmark`).checked = false;
        // remove question prompt from the sidebar
        document.getElementById(`list-q${questionNumber}-list`).innerText = `Question #${questionNumber}`;
      }
    });
});

// prevent bug where pressing enter on the checkbox will submit the form
Array.from(document.querySelectorAll('.question-checkmark')).forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // focus the 'question-#-a-iscorrect' element
      el.parentElement.parentElement.querySelector('.first-radio-btn > input').focus();
    }
  });
});

const ofsh = document.getElementById('questions-content-container').offsetHeight;
document.getElementById('questions').style.maxHeight = `${ofsh}px`;