import API from "../api.mjs";

const assignment_number = new URLSearchParams(window.location.search).get("assignment");
const module_id = new URLSearchParams(window.location.search).get("module");

const sidenav = document.getElementById('sidenav');
const sidenavContainer = document.getElementById('nav-body');
const gradingArea = document.getElementById("grading-area");
const moduleInput = document.getElementById("module-input");
const assignmentArea = document.getElementById("assignment-area");
const scoringArea = document.getElementById("scoring-area");
const showAllBtn = document.getElementById("show-all");

let assignment_id;
let posts = {};

function load(all = false) {
  if (all) {
    sidenavContainer.innerHTML = '';
    API.get(`/assignments/`).then((modules) => {
      const modulesNamesAndPosts = Object.entries(modules);
      
      modulesNamesAndPosts.forEach(([module_id, assignments]) => {
        if (assignment_number) {
          assignment_id = assignments[assignment_number].id;
        }

        const assignmentsHTML = Object.values(assignments).reduce((acc, assignment, index) => {
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
            quizzesHTML = Object.values(quizzes).reduce((acc, quiz, index) => {
              posts[quiz.id] = {
                type: 'assignment',
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
          }, 1000);
        });
      });
    });
  } else {
    API.get(`/assignments/${module_id}/`).then((assignments) => {
      if (assignment_number) {
        assignment_id = assignments[assignment_number].id;
      }

      const assignmentsHTML = Object.values(assignments).reduce((acc, assignment, index) => {
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
          quizzesHTML = Object.values(quizzes).reduce((acc, quiz, index) => {
            posts[quiz.id] = {
              type: 'assignment',
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
  gradingArea.classList.remove("visually-hidden");

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
