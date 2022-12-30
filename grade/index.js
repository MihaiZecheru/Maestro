import API from "../api.mjs";

const module_id = new URLSearchParams(window.location.search).get("module");

const sidenav = document.getElementById('sidenav');
const sidenavContainer = document.getElementById('nav-body');
const gradingArea = document.getElementById("grading-area");
const moduleInput = document.getElementById("module-input");
const quizArea = document.getElementById("assignment-area");
const scoringArea = document.getElementById("scoring-area");
const showAllBtn = document.getElementById("show-all");

const submissionTypes = {
  "txt": "Text",
  "lnk": "Link",
  "f": "File",
  "txt&lnk": "Text & Link",
  "txt&f": "Text & File",
  "lnk&f": "Link & File",
  "txt&lnk&f": "Text & Link & File"
};

function download(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

let posts = {};

function load(all = false) {
  if (all) {
    sidenavContainer.innerHTML = '';
    API.get(`/assignments/`).then((modules) => {
      const modulesNamesAndPosts = Object.entries(modules);

      modulesNamesAndPosts.forEach(([module_id, assignments]) => {

        const assignmentsHTML = Object.values(assignments).sort((a, b) => new Date(a.posted) - new Date(b.posted)).reduce((acc, assignment) => {
          posts[assignment.id] = {
            type: 'assignment',
            ...assignment
          };

          /*
            <li class="sidenav-item">
              <a class="sidenav-link">Link 1</a>
            </li> 
          */

          const sidenavAssignment = document.createElement('li');
          sidenavAssignment.classList.add('sidenav-item');
          sidenavAssignment.innerHTML = `
            <a class="sidenav-link" href="#${assignment.id}">
              <i class="far fa-file-alt fa-fw fa-lg me-3"></i>
              <span class="text-truncate">${assignment.name}</span>
            </a>`;

          return acc + sidenavAssignment.outerHTML;
        }, '');

        API.get(`/quizzes/${module_id}/`).then((quizzes) => {
          let quizzesHTML = '';
          
          if (!quizzes)
            quizzesHTML = '';
          else {
            quizzesHTML = Object.values(quizzes).sort((a, b) => new Date(a.posted) - new Date(b.posted)).reduce((acc, quiz) => {
              posts[quiz.id] = {
                type: 'quiz',
                ...quiz
              };

              /*
                <li class="sidenav-item">
                  <a class="sidenav-link">Link 1</a>
                </li>
              */

              const sidenavQuiz = document.createElement('li');
              sidenavQuiz.classList.add('sidenav-item');
              sidenavQuiz.innerHTML = `
                <a class="sidenav-link" href="#${quiz.id}">
                  <i class="fas fa-bong fa-fw fa-lg me-3"></i>
                  <span class="text-truncate">${quiz.name}</span>
                </a>`;

              return acc + sidenavQuiz.outerHTML;
            }, '');
          }

          const sidenavModule = document.createElement('li');
          sidenavModule.classList.add('sidenav-item');
          sidenavModule.innerHTML = `
            <a class="sidenav-link">
              <i class="fas fa-folder fa-fw fa-lg me-3"></i><span>${module_id}</span>
            </a>
            <ul class="sidenav-collapse scroll-section">
              ${assignmentsHTML}
              ${quizzesHTML}
            </ul>`;
          sidenavContainer.appendChild(sidenavModule);
        });

        new Promise((_r) => {
          setTimeout(() => {
            new mdb.Sidenav(sidenav);
            _r();
          }, 1750);
        });
      });
    });
  } else {
    API.get(`/assignments/${module_id}/`).then((assignments) => {
      assignments = Object.values(assignments).sort((a, b) => new Date(a.posted) - new Date(b.posted));
      
      const assignmentsHTML = assignments.reduce((acc, assignment, index) => {
        posts[assignment.id] = {
          type: 'assignment',
          ...assignment
        };

        /*
          <li class="sidenav-item">
            <a class="sidenav-link">Link 1</a>
          </li> 
        */

        const sidenavAssignment = document.createElement('li');
        sidenavAssignment.classList.add('sidenav-item');
        sidenavAssignment.innerHTML = `
          <a class="sidenav-link" href="#${assignment.id}">
            <i class="far fa-file-alt fa-fw fa-lg me-3"></i>
            <span class="text-truncate">${assignment.name}</span>
          </a>`;

        return acc + sidenavAssignment.outerHTML;
      }, '');

      API.get(`/quizzes/${module_id}/`).then((quizzes) => {
        let quizzesHTML = '';
        
        if (!quizzes)
          quizzesHTML = '';
        else {
          quizzesHTML = Object.values(quizzes).sort((a, b) => new Date(a.posted) - new Date(b.posted)).reduce((acc, quiz, index) => {
            posts[quiz.id] = {
              type: 'quiz',
              ...quiz
            };

            /*
              <li class="sidenav-item">
                <a class="sidenav-link">Link 1</a>
              </li>
            */

            const sidenavQuiz = document.createElement('li');
            sidenavQuiz.classList.add('sidenav-item');
            sidenavQuiz.innerHTML = `
              <a class="sidenav-link" href="#${quiz.id}">
                <i class="fas fa-bong fa-fw fa-lg me-3"></i>
                <span class="text-truncate">${quiz.name}</span>
              </a>`;

            return acc + sidenavQuiz.outerHTML;
          }, '');
        }

        const sidenavModule = document.createElement('li');
        sidenavModule.classList.add('sidenav-item');
        sidenavModule.innerHTML = `
          <a class="sidenav-link">
            <i class="fas fa-folder fa-fw fa-lg me-3"></i><span>${module_id}</span>
          </a>
          <ul class="sidenav-collapse scroll-section">
            ${assignmentsHTML}
            ${quizzesHTML}
          </ul>`;
        sidenavContainer.appendChild(sidenavModule);
        new mdb.Sidenav(sidenav);
      });
    });
  }
}

if (module_id) {
  load();

  sidenav.classList.remove("visually-hidden");

  showAllBtn.addEventListener('click', () => {
    load(true);
  });
} else {
  API.get('/modules/').then((modules) => {
    Object.keys(modules).forEach((name) => {
      moduleInput.innerHTML = `<option value="${name}">${name}</option>`;
    });
    
    moduleInput.parentElement.classList.remove("visually-hidden");
    new mdb.Select(moduleInput);

    moduleInput.parentElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      window.location.href = `/grade/?module=${moduleInput.value}`;
    });
  });
}

window.onhashchange = async () => {
  // open the assignment or quiz on the right 
  const id = window.location.hash.substring(1);
  const post = posts[id];

  if (!post) return;

  const studentnames = (await API.get(`/studentnames/`)).split(',');
  if (post.type === 'assignment') {
    const submitted = await API.get(`/submitted/assignments/${id}/`);
    const submissions = await API.get(`/submissions/assignments/${id}/`);

    gradingArea.classList?.remove('visually-hidden');
    quizArea.innerHTML = `
      <div class="name-and-desc">
        <h2>${post.name} | Assignment</h2>
        <p>${post.description}</p>
      </div>
      <hr class="darker-hr">
      <div>
        <h3 id="student-name">Submission </h3> <!-- will be changed to include student's name -->
        <div id="submission">

        </div>
      </div>
      <div class="extra-info">
        <hr class="darker-hr">
        <div>
          <p>Posted: ${post.posted.replace(",", " at")}</p>
          <p>Due: ${post.due}</p>
          <p>Submission Types: ${submissionTypes[post.submissionType]}</p>
        </div>
      </div>`;

    const buttons = studentnames.reduce((acc, student) => {
      const submission = submissions[student];
      const is_submitted = submitted[student]?.is_submitted;
      const pointsChars = post.points.toString().length;
      
      if (!is_submitted) {
        return acc + `<div class="student-grade-container disable-highlighting">
                        <button class="btn btn-secondary grade-btn" data-status="incomplete" id="grade-${student}-btn" title="Not Submitted">${student}</button>
                        <div>
                          <input type="text" class="grade-input" id="grade-${student}-input" data-max-chars="${pointsChars}" placeholder="0" class="form-control" style="${(pointsChars === 1) ? 'width: 1.2rem;' : (pointsChars === 2) ? 'width: 1.7rem;' : 'width: 2.25rem;'}" />
                          <span class="max-points-display" data-student="${student}">/${post.points}</span>
                        </div>
                      </div>`;
      }

      const submitted_at = new Date(submitted[student].submitted_at).toLocaleDateString();
      const graded = submitted[student]?.graded || false;

      if (graded) {
        const grade = submission?.grade || 0;
        return acc + `<div class="student-grade-container disable-highlighting">
                        <button class="btn btn-success grade-btn" id="grade-${student}-btn" data-status="graded" title="Submitted: ${submitted_at}">${student}</button>
                        <div>
                          <input type="text" class="grade-input" id="grade-${student}-input" data-max-chars="${pointsChars}" placeholder="${grade}" class="form-control" value="${grade}" style="${(pointsChars === 1) ? 'width: 1.2rem;' : (pointsChars === 2) ? 'width: 1.7rem;' : 'width: 2.25rem;'}" />
                          <span class="max-points-display" data-student="${student}">/${post.points}</span>
                        </div>
                      </div>`;
      }

      // submitted but not graded
      return acc + `<div class="student-grade-container disable-highlighting">
                      <button class="btn btn-danger grade-btn" id="grade-${student}-btn" data-status="complete" title="Submitted: ${submitted_at}">${student}</button>
                      <div>
                        <input type="text" class="grade-input" id="grade-${student}-input" data-max-chars="${pointsChars}" placeholder="0" class="form-control" style="${(pointsChars === 1) ? 'width: 1.2rem;' : (pointsChars === 2) ? 'width: 1.7rem;' : 'width: 2.25rem;'}" />
                        <span class="max-points-display" data-student="${student}">/${post.points}</span>
                      </div>
                    </div>`;
    }, '');

    scoringArea.innerHTML = `
      <div class="student-submission-statuses disable-highlighting">
        <h2 id="student-submissions">Student Submissions</h2>
        <div>
          <button class="btn btn-primary" id="submit-grades-btn">Submit Grades</button>
          <hr>
          ${buttons}
        </div>
        <div class="form-check extra-credit-checkbox-parent">
          <input class="form-check-input" type="checkbox" value="" id="extra-credit-checkbox" />
          <label class="form-check-label" for="extra-credit-checkbox">Allow Extra Credit</label>
        </div>
      </div>  
    `;

    // when max-points-display is clicked the input will focus (qol)
    document.querySelectorAll('.max-points-display').forEach((el) => {
      el.addEventListener('click', () => {
        const student = el.getAttribute('data-student');
        const input = document.getElementById(`grade-${student}-input`);
        input.focus();
      });
    });

    // submit grades
    const gradeBtn = document.getElementById('submit-grades-btn');
    gradeBtn.addEventListener('click', async () => {
      const extraCreditEnabled = document.getElementById('extra-credit-checkbox').checked;
      const inputs = document.querySelectorAll(`.grade-input`);
      const grades = Array.from(inputs).reverse().reduce((acc, input) => {
        const student = input.id.split('-')[1];
        let grade = input.value;

        if (!grade.length) {
          return acc;
        }

        if (isNaN(grade)) {
          input.value = '';
          input.focus();
          return acc;
        } else {
          grade = parseInt(grade);
          if (!extraCreditEnabled & grade > post.points) {
            input.value = post.points;
            grade = post.points;
          }
        }

        acc[student] = grade;
        return acc;
      }, {});

      for (let [student, grade] of Object.entries(grades)) {
        API.put(`/submissions/assignments/${post.id}/${student}/grade`, grade);
        API.put(`/submitted/assignments/${post.id}/${student}/graded`, true);
      }
    });

    // individual grade submissions
    document.querySelectorAll(`.grade-input`).forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const student = input.id.split('-')[1];
          let grade = input.value;

          if (isNaN(grade)) return;
          else grade = parseInt(grade);

          API.put(`/submissions/assignments/${post.id}/${student}/grade`, grade);
          API.put(`/submitted/assignments/${post.id}/${student}/graded`, true);
          input.blur();
        }
      });

      input.addEventListener('click', () => {
        input.select();
      });
    });

    // show submission
    const submissionBtns = document.querySelectorAll('.grade-btn');
    submissionBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const student = btn.id.split('-')[1];
        const submission = submissions[student] || {};

        if (submission.submission_type === 'files') {
          var urls = submission.submission.split('<;$;>');
          var filenames = submission.filenames.split('<;$;>');
        }

        if (btn.getAttribute('data-status') === 'incomplete') {
          document.getElementById('student-name').innerText = `Submission - ${student}`;
          document.getElementById('submission').innerHTML = `No Submission Yet`;
          return;
        }

        const link_to_submission = `https://codeclass-51eae-default-rtdb.firebaseio.com/submissions/assignments/${post.id}/${student}/submission.json`;
        document.getElementById('student-name').innerText = `Submission - ${student} - ${new Date(submitted[student].submitted_at).toLocaleDateString()}`;
        document.getElementById('submission').innerHTML = `
          <div class="submission-body">
            ${
              (submission.submission_type === 'text')
              ? `<div>
                    <div class="file-btns-container">
                      <button class="btn btn-primary download-file" href="${link_to_submission}" data-type="text" data-student="${student}" title="Left click for .txt, right click for .html">Download Text</button>
                      <a class="btn btn-primary view-file" href="${link_to_submission}" target="_blank" rel="noopener noreferrer" title="View in new tab">View</a>
                    </div>
                    <div>
                      ${submission.submission}
                    </div>
                 </div>`
              : (submission.submission_type === 'url')
              ? `<a href="${submission.submission}" target="_blank" rel="noopener noreferrer">View</a>
                 <iframe src="${submission.submission}" class="submission-iframe"></iframe>`
              // for 'files' type
              : urls.reduce((acc, url, i) => {
                  const filename = filenames[i];
                  return acc + `<div class="file-container">
                                  <div class="file-btns-container">
                                    <a class="btn btn-primary view-file" href="${url}" target="_blank" rel="noopener noreferrer" title="View in new tab">${filename}</a>
                                    <button class="btn btn-primary download-file" data-type="file" href="${url}" data-student="${student}">Download File</button>
                                  </div>
                                  <iframe src="${submission.submission}" class="file-iframe"></iframe>
                                </div>`;
                }, '')
              }
          </div>`;

        document.querySelector('.download-file').addEventListener('contextmenu', async (e) => {
          e.preventDefault();
          const btn = document.querySelector('.download-file');
          const student = btn.getAttribute('data-student');
          const type = btn.getAttribute('data-type');
          const href = btn.getAttribute('href');

          if (type === 'text') {
            const filename = student + '.html';
            const response = await fetch(href);
            const text = await response.text();
            const blob = new Blob([text.substring(1, text.length - 1)], {type: 'text/html'});
            const url = window.URL.createObjectURL(blob);
            download(url, filename);
          }
        });

        document.querySelectorAll('.download-file').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const student = btn.getAttribute('data-student');
            const type = btn.getAttribute('data-type');
            const href = btn.getAttribute('href');
            
            if (type === 'file') {
              const filename = student + '-' + btn.previousElementSibling.innerText;
              download(href, filename);
            } else if (type === 'text') {
              const filename = student + '.txt';
              const response = await fetch(href);
              const text = await response.text();
              const blob = new Blob([text.substring(1, text.length - 1)], {type: 'application/json'});
              const url = window.URL.createObjectURL(blob);
              download(url, filename);
            }
          });
        });
      });
    });
  } else {
    const submitted = await API.get(`/submitted/quizzes/${id}/`) || {};
    const submissions = await API.get(`/submissions/quizzes/${id}/`) || {};

    gradingArea.classList?.remove('visually-hidden');
    quizArea.innerHTML = `
      <div class="name-and-desc">
        <h2>${post.name} | Quiz</h2>
        <p>${post.description}</p>
      </div>
      <hr class="darker-hr">
      <div>
        <h3>Quiz Answers <span id="submission"></span></h3>
      </div>
      <div class="extra-info">
        <hr class="darker-hr">
        <div>
          <p>Posted: ${post.posted.replace(",", " at")}</p>
          <p>Due: ${post.due}</p>
        </div>
      </div>`;

    const buttons = studentnames.reduce((acc, student) => {
      const submission = submissions[student];
      const is_submitted = submitted[student]?.is_submitted;

      if (!is_submitted) {
        return acc + `<div class="student-grade-container disable-highlighting">
                        <button class="btn btn-secondary grade-btn" data-status="incomplete" id="grade-${student}-btn" title="Not Submitted">${student}</button>
                        <div>
                          <span class="grade" style="color: #9ca3af">0</span>
                          <span class="max-points-display" data-student="${student}">/${post.points}</span>
                        </div>
                      </div>`;
      }

      const submitted_at = new Date(submitted[student].submitted_at).toLocaleDateString();

      // graded
      const grade = submission?.grade || 0;
      return acc + `<div class="student-grade-container disable-highlighting">
                      <button class="btn btn-success grade-btn" id="grade-${student}-btn" data-status="graded" title="Submitted: ${submitted_at}">${student}</button>
                      <div>
                      <span class="grade">${grade}</span>
                        <span class="max-points-display" data-student="${student}">/${post.points}</span>
                      </div>
                    </div>`;
    }, '');

    scoringArea.innerHTML = `
      <div class="student-submission-statuses disable-highlighting">
        <h2 id="student-submissions">Student Submissions</h2>
        <div>
          <hr>
          ${buttons}
        </div>
      </div>  
    `;
  }
}

function removeHash () { 
  history.pushState("", document.title, window.location.pathname + window.location.search);
}

window.onload = removeHash;