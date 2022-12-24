import { getCookie } from '/cookies.mjs';
import API from '/api.mjs';

// <i class="fas fa-paperclip fa-lg me-2 opacity-70"></i>
// <i class="far fa-file-alt fa-lg me-2 opacity-70"></i>
// <i class="fas fa-bong fa-lg me-2 opacity-70"></i>

let moduleChildren = {};

function populateAccordion(assignmentsQuizzesAndResources) {
  // join all of these together, add the type it is (assignment | quiz | resource), then sort by date
  assignmentsQuizzesAndResources = [
    ...assignmentsQuizzesAndResources.assignments.map((a => ({...a, type: 'assignment'}))),
    ...assignmentsQuizzesAndResources.quizzes.map((q) => ({...q, type: 'quiz'})),
    ...assignmentsQuizzesAndResources.resources.map((r) => ({...r, type: 'resource'}))
  ].sort((a, b) => new Date(a.posted) - new Date(b.posted));

  /*
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingOne">
        <button class="accordion-button" type="button" data-mdb-toggle="collapse"
          data-mdb-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
          <i class="fas fa-question-circle fa-sm me-2 opacity-70"></i>Accordion Item #1
        </button>
      </h2>
      <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne"
        data-mdb-parent="#accordion">
        <div class="accordion-body">
          <strong>This is the first item's accordion body.</strong> It is hidden by
          default, until the collapse plugin adds the appropriate classes that we use to
          style each element. These classes control the overall appearance, as well as
          the showing and hiding via CSS transitions. You can modify any of this with
          custom CSS or overriding our default variables. It's also worth noting that
          just about any HTML can go within the <code>.accordion-body</code>, though the
          transition does limit overflow.
        </div>
      </div>
    </div>
  */

  const accordion = document.getElementById('accordion');
  assignmentsQuizzesAndResources.reduce(async (acc, post) => {
    console.log(post);

    if (post.type === 'assignment') {
      // check if submitted
      const submitted_info = await API.get(`/submitted/assignments/${post.id}/${getCookie('token')}`) || { is_submitted: false };
      
      // check if late
      // const dueDate = new Date(new Date(post.due).setHours(23, 59, 59, 999));
      const dueDate = new Date(post.due).setHours(23, 59, 59, 999);
      const now = Date.now();
      
      let is_late;
      if (submitted_info.is_submitted) {
        // check if it was submitted late
        const submittedDate = new Date(submitted_info.submitted_at);
        is_late = submittedDate > dueDate;
      } else {
        // check if it is late
        is_late = now > dueDate;
      }

      // get comments
      const comments = Object.values(await API.get(`/comments/${post.id}/`) || []);

      return (await acc) + `
        <div class="accordion-item" data-uuid="${post.id}">
          <h2 class="accordion-header" id="heading${post.id}">
            <button class="accordion-button collapsed" type="button" data-mdb-toggle="collapse"
              data-mdb-target="#collapse${post.id}" aria-expanded="true" aria-controls="collapse${post.id}">
              <i class="far fa-file-alt fa-lg me-2 opacity-70"></i>
              <div class="child-information">
                <span class="child-name text-truncate">${post.name}</span>
                <div class="child-right-icons">
                  <div> <!-- three badges max -->
                    ${
                      (submitted_info.is_submitted)
                      ? '<span class="child-submitted badge rounded-pill badge-success">submitted</span>'
                      : '<span class="child-late badge rounded-pill badge-secondary">not submitted</span>'
                    }
                    <span class="child-due-date badge rounded-pill badge-${is_late ? 'warning' : 'primary'}">Due: ${post.due.substring(0, post.due.length - 5)}</span>
                    ${
                      (is_late)
                      ? '<span class="child-late badge rounded-pill badge-danger">Late</span>'
                      : ''
                    }
                  </div>
                </div>
              </div>
            </button>
          </h2>
          <div id="collapse${post.id}" class="accordion-collapse collapse" aria-labelledby="heading${post.id}"
            data-mdb-parent="#accordion">
            <div class="accordion-body row">
              <div class="col-4 post-description">
                ${post.description}
              </div>
              <div class="col-6">
                <div class="row"> <!-- row for the button and comment section -->
                    ${
                      (submitted_info.is_submitted)
                      ? `<div class="col-8">
                          <button class="btn btn-primary is-submitted-btn" type="button">
                            <i class="fas fa-eye fa-lg me-2"></i>
                            View Submission
                          </button>
                        </div>`
                      : `<div class="col-8">
                          <button class="btn btn-primary is-submitted-btn" type="button">
                            <i class="fas fa-upload fa-lg me-2"></i>
                            Submit Assignment
                          </button>
                        </div>`
                      }
                </div>
                <div> <!-- row for the comment section -->
                  <div class="row">
                    <div class="col-6">
                    <textarea class="form-control" id="comment-box-${post.id}" placeholder="Add a comment" autocomplete="off"></textarea>
                    <label for="comment-box" class="form-label">Shift + Enter to submit</label>
                    </div>
                  </div>
                </div>
                <div class="row"> <!-- row for the comments -->
                  <div class="col-6">
                    <div class="comments" id="comments-${post.id}">
                      ${
                        comments.map((comment) => {
                          return `
                            <div class="comment shadow-4">
                              <div class="comment-header">
                                <div>
                                  <img src="${comment.pfp}" class="rounded-circle" alt="pfp" />
                                  <span class="comment-author">${comment.author}</span>
                                </div>
                                <span class="comment-date badge rounded-pill badge-secondary">${comment.posted}</span>
                              </div>
                              <div class="comment-body">
                                ${comment.body}
                              </div>
                            </div>`
                        }).join('')
                      }
                      <div style="width: 100%; position: sticky; bottom: 0; display: flex; justify-content: center;">
                        <i class="fas fa-arrow-down fa-2x"></i>
                      </div>
                  </div>
                </div>
              </div>
              <!-- area to submit assignment or view assignment -->
              <div class="col-6">

              </div>
            </div>
          </div>
        </div>`;
    } else if (post.type === 'quiz') {
      return (await acc);
    } else if (post.type === 'resource') {
      return (await acc);
    }
  }, '').then((HTML) => {
    // populate accordion
    accordion.innerHTML = HTML;
    assignmentsQuizzesAndResources.forEach((post) => {
      try {
        document.getElementById(`comment-box-${post.id}`).addEventListener('keydown', (e) => {
          const commentBox = document.getElementById(`comment-box-${post.id}`);

          if (commentBox.value.trim() && e.shiftKey && e.key === 'Enter') {
            e.preventDefault();

            // post to database
            API.submitComment(getCookie('cc-username'), post.id, commentBox.value.trim()).then((comment) => {
              commentBox.value = '';

              // update comments
              document.getElementById(`comments-${post.id}`).innerHTML += `
                <div class="comment shadow-4">
                  <div class="comment-header">
                    <div>
                      <img src="${comment.pfp}" class="rounded-circle" alt="pfp" />
                      <span class="comment-author">${comment.author}</span>
                    </div>
                    <span class="comment-date badge rounded-pill badge-secondary">${comment.posted}</span>
                  </div>
                <div class="comment-body">
                  ${comment.body}
                </div>
              </div>`;
            });
          }
        });
      } catch (e) {};
    });
  });
}

new Promise((_res) => {
  // get all modules
  API.get('/modules/').then((_modules) => {
    _modules = _modules || {};
    const modulesCount = Object.keys(_modules).length - 1; // -1 because the forEach iter starts at 0
    const sidenavContainer = document.getElementById('nav-body');
    let modules = [];

    for (let [i, value] of Object.values(_modules).entries()) {
      modules[i] = value;
    }

    modules.forEach((module, i) => {
      /* define promises */
      const assignmentsPromise = new Promise((res) => {
        if (module.assignmentCount === 0) {
          res([]); return;
        }

        API.get(`/assignmentNames/${module.name}`).then((assignments) => {
          res(Object.values(assignments));
        });
      });

      const quizzesPromise = new Promise((res) => {
        if (module.quizCount === 0) {
          res([]); return;
        }

        API.get(`/quizNames/${module.name}`).then((quizzes) => {
          res(Object.values(quizzes));
        });
      });

      const resourcesPromise = new Promise((res) => {
        if (module.resourceCount === 0) {
          res([]); return;
        }

        API.get(`/resourceNames/${module.name}`).then((resources) => {
          res(Object.values(resources));
        });
      });

      // get module children
      Promise.all([ assignmentsPromise, quizzesPromise, resourcesPromise ]).then((values) => {
        const assignmentNames = values[0];
        const quizNames = values[1];
        const resourceNames = values[2];

        /*
          <li class="sidenav-item">
            <a class="sidenav-link">
              <i class="fas fa-folder fa-fw fa-lg me-3"></i><span>Scrolling Category 1</span>
            </a>
            <ul class="sidenav-collapse scroll-section">
              <li class="sidenav-item">
                <a class="sidenav-link">Link 1</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 2</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 3</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 4</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 5</a>
              </li>
              <li class="sidenav-item">
                <a class="sidenav-link">Link 6</a>
              </li>
            </ul>
          </li>
        */

        const assignmentHTML = assignmentNames.reduce((acc, assignment) => {
          /*
            <li class="sidenav-item">
              <a class="sidenav-link">Link 1</a>
            </li> 
          */

          const sidenavAssignment = document.createElement('li');
          sidenavAssignment.classList.add('sidenav-item');
          sidenavAssignment.innerHTML = `
            <a class="sidenav-link" href="TODO">
              <i class="far fa-file-alt fa-fw fa-lg me-3"></i>
              <span class="text-truncate">${assignment}</span>
            </a>`;

          return acc + sidenavAssignment.outerHTML;
        }, '');

        const quizHTML = quizNames.reduce((acc, quiz, i) => {
          /*
            <li class="sidenav-item">
              <a class="sidenav-link">Link 1</a>
            </li>
          */

          const sidenavQuiz = document.createElement('li');
          sidenavQuiz.classList.add('sidenav-item');
          sidenavQuiz.innerHTML = `
            <a class="sidenav-link">
              <i class="fas fa-bong fa-fw fa-lg me-3"></i>
              <span class="text-truncate">${quiz}</span>
            </a>`;

          return acc + sidenavQuiz.outerHTML;
        }, '');

        const resourceHTML = resourceNames.reduce((acc, resource) => {
          /*
            <li class="sidenav-item">
              <a class="sidenav-link">Resource Name</a>
            </li>
          */

          const sidenavResource = document.createElement('li');
          sidenavResource.classList.add('sidenav-item');
          sidenavResource.innerHTML = `
            <a class="sidenav-link">
              <i class="fas fa-paperclip fa-fw fa-lg me-3"></i>
              <span class="text-truncate">${resource}</span>
            </a>`;

          return acc + sidenavResource.outerHTML;
        }, '');

        const sidenavModule = document.createElement('li');
        sidenavModule.classList.add('sidenav-item');
        sidenavModule.innerHTML = `
          <a class="sidenav-link">
            <i class="fas fa-folder fa-fw fa-lg me-3"></i><span>${module.name}</span>
          </a>
          <ul class="sidenav-collapse scroll-section">
            ${assignmentHTML}
            ${quizHTML}
            ${resourceHTML}
          </ul>`;

        sidenavContainer.appendChild(sidenavModule);

        // add the event listener to the sidenav-item
        sidenavModule.addEventListener('click', (e) => {
          const i = sidenavModule.querySelector('i');

          // check if the module children already exist
          if (!moduleChildren[module.name]) {
            // get the assignmentes, quizzes, and resources
            // then save them to moduleChildren
            const assignmentsFull_Promise = new Promise((__res) => {
              if (module.assignmentCount === 0) {
                __res([]); return;
              }

              API.get(`/assignments/${module.name}`).then((assignments) => __res(Object.values(assignments)));
            });

            const quizzesFull_Promise = new Promise((__res) => {
              if (module.quizCount === 0) {
                __res([]); return;
              }

              API.get(`/quizzes/${module.name}`).then((quizzes) => __res(Object.values(quizzes)));
            });

            const resourcesFull_Promise = new Promise((__res) => {
              if (module.resourceCount === 0) {
                __res([]); return;
              }

              API.get(`/resources/${module.name}`).then((resources) => __res(Object.values(resources)));
            });
            
            Promise.all([ assignmentsFull_Promise, quizzesFull_Promise, resourcesFull_Promise  ]).then((values) => {
              moduleChildren[module.name] = {
                assignments: values[0],
                quizzes: values[1],
                resources: values[2]
              };

              // populate the accordion
              populateAccordion(moduleChildren[module.name]);
            });
          } else {
            populateAccordion(moduleChildren[module.name]);
          }

          // this function will active if one of the children is clicked
          // not the proper behaviour; below checks to see if parent was clicked
          if (e.target.tagName === 'A' && e.target.role !== 'button') return;

          // check for the closed folder
          if (i.classList.value.includes('fa-folder-open')) {
            i.classList.remove('fa-folder-open');
            i.classList.add('fa-folder');
          } // closed folder
          else
          {
            i.classList.remove('fa-folder');
            i.classList.add('fa-folder-open');
          }
        });

        if (i === modulesCount) _res();
      });
    });
  });
}).then(() => {
  const sidenav = new mdb.Sidenav(document.getElementById('sidenav'))
  sidenav.show();
});
