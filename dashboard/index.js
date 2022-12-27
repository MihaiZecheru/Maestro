import { ref, getStorage, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import API, { uuid4 } from '/api.mjs';
import { isteacher, getUsername } from '/auth.mjs';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBquTMWfq17R6dQNI0ptFIMXWGUIpUNnCs",
  authDomain: "codeclass-51eae.firebaseapp.com",
  databaseURL: "https://codeclass-51eae-default-rtdb.firebaseio.com",
  projectId: "codeclass-51eae",
  storageBucket: "codeclass-51eae.appspot.com",
  messagingSenderId: "520242527362",
  appId: "1:520242527362:web:fbbd5cc38409159218c89b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// <i class="fas fa-paperclip fa-lg me-2 opacity-70"></i>
// <i class="far fa-file-alt fa-lg me-2 opacity-70"></i>
// <i class="fas fa-bong fa-lg me-2 opacity-70"></i>

let moduleChildren = {};
let popovers = [];
let submission_info = {};
let current_submission_type = {};
let submissions = {};

function parseMentions(text) {
  text = (text + ' ').replaceAll(/\s@Chrissy\s/g, ' <span class="mention">@Chrissy</span> ')
    .replaceAll(/\s@Wyatt Gaston\s/g, ' <span class="mention">@Wyatt Gaston</span> ')
    .replaceAll(/\s@RahukE\s/g, ' <span class="mention">@RahukE</span> ')
    .replaceAll(/\s@Theodore Junior\s/g,  '<span class="mention">@Theodore Junior</span> ')
    .replaceAll(/\s@Maruabb\s/g, ' <span class="mention">@Maruabb</span> ')
    .replaceAll(/\s@Jainaldo\s/g, ' <span class="mention">@Jainaldo</span> ');

  return text.substring(0, text.length - 1);
}

function getMentions(text) {
  return parseMentions(text).match(/<span class="mention">@(.*?)<\/span>/g).map((mention) => mention.replace(/<span class="mention">@(.*?)<\/span>/g, '@$1'));
}

class comment_cooldown {
  static cooldown_time = 1000 * 90; // 1 minute 30 seconds
  static cooldown_over_at = {};

  static addPost(post_id) {
    this.cooldown_over_at[post_id] = new Date();
  }

  static start(post_id) {
    this.cooldown_over_at[post_id] = new Date(Date.now() + this.cooldown_time);
  }

  static enabled(post_id) {
    return this.getRemainingSeconds(post_id) <= 0;
  }

  static getRemainingSeconds(post_id) {
    return ((this.cooldown_over_at[post_id] - new Date()) / 1000).toFixed(0);
  }
}

function checkForFinish(totalModules, _res) {
  new Promise((__res__) => {
    setInterval(() => {
      if (document.getElementById('nav-body').children.length === totalModules) {
        _res();
        __res__();
      }
    }, 1);
  });
}

async function updateComments(post_id) {
  window.last_comment_update = Date.now();
  const comments = Object.values(await API.get(`/comments/${post_id}/`) || []);
  const uuid = uuid4();

  document.getElementById(`comments-${post_id}`).innerHTML = `
    ${
      comments.map((comment, i) => {
        return `
          <div class="comment shadow-4" ${(i === comments.length - 1) ? `id="comment-${uuid}"` : ""}>
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
    <!-- down arrow icon -->
    <div id="scrollToView-${post_id}" style="width: 100%; position: sticky; bottom: 0; display: flex; justify-content: center;"><i class="fas fa-arrow-down fa-2x" id="comment-arrow-${post_id}"></i></div>
  `;

  document.getElementById(`scrollToView-${post_id}`).scrollIntoView();
  const comment_ele = document.getElementById(`comment-${uuid}`);
  comment_ele.scrollIntoView();
  comment_ele.classList.add('popout');

  document.getElementById(`comment-arrow-${post_id}`).addEventListener('click', () => {
    comment_ele.scrollIntoView({ behavior: 'smooth' });
  });

  setTimeout(() => {
    comment_ele.classList.remove('popout');
  }, 1500);
}

async function checkForNewComments(post_id) {
  setInterval(() => {
    API.get(`/recent_comment/${post_id}/`).then((posted_on) => {

      if (posted_on) {
        if (new Date(posted_on) > window.last_comment_update) {
          // new comment
          updateComments(post_id);

          API.get(`/recent_comment_info/${post_id}/`).then(({ author, post_title, mentions, module }) => {
            // show snackbar saying there is a new comment
            document.getElementById('new-comment-toast-time').innerText = ((new Date() - posted_on) / 1000).toFixed(2) + ' seconds ago';
            document.getElementById('new-comment-toast-author-name').innerText = '@' + author;
            document.getElementById('new-comment-toast-post-title').innerText = post_title;
            document.getElementById('new-comment-toast-module-name').innerText = module;

            if (mentions) {
              document.getElementById('new-comment-toast-mentions').innerHTML = mentions.reduce((acc, mention) => { return acc + `<span class="tag">${mention}</span>, ` }, '').slice(0, -2);
              document.getElementById('mentioned-people').classList.remove("visually-hidden");
            } else {
              document.getElementById('new-comment-toast-mentions').innerHTML = '';
              document.getElementById('mentioned-people').classList.add("visually-hidden");
            }

            new mdb.Toast(document.getElementById('new-comment-toast')).show();
          });
        }
      }
    });
  }, 7500);
}

function populateAccordion(assignmentsQuizzesAndResources, _res) {
    try {
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
          const submitted_info = await API.get(`/submitted/assignments/${post.id}/${getUsername()}`) || { is_submitted: false };
          submission_info[post.id] = submitted_info;
          
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

          // get the average rating for the post
          const avg_rating = await API.get(`/ratings/${post.id}`).then((response) => {
            const get_average = arr => (arr.reduce((a, b) => a + b) / arr.length).toFixed(1);

            if (!response) {
              return 0;
            }

            return get_average(Object.values(response));
          });

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
                  <div class="col-4 post-desc-and-rating">
                    <div class="post-description">
                      <p>${post.description}</p>
                    </div>
                    <div class="star-ratings">
                      <div>
                        ${
                          isteacher()
                          ? `<span class="disable-highlighting badge badge-${(avg_rating >= 4.5) ? 'success' : (avg_rating >= 3.0) ? 'primary' : 'danger'}">${avg_rating}</span>`
                          : `<i class="far fa-question-circle" id="popover-${post.id}" data-mdb-toggle="popover" title="Ratings" data-mdb-content="Give this post a rating. Would you want to see a post like this again?"></i>`
                        }
                        <ul class="rating" data-mdb-toggle="rating" ${isteacher() ? `data-mdb-value="${avg_rating}" style="cursor: default!important;"` : ''} id="rating-${post.id}">
                          <li ${isteacher() ? `style="cursor: default!important;"` : ''}>
                            <i class="far fa-star fa-sm text-primary" title="Bad"></i>
                          </li>
                          <li ${isteacher() ? `style="cursor: default!important;"` : ''}>
                            <i class="far fa-star fa-sm text-primary" title="Poor"></i>
                          </li>
                          <li ${isteacher() ? `style="cursor: default!important;"` : ''}>
                            <i class="far fa-star fa-sm text-primary" title="OK"></i>
                          </li>
                          <li ${isteacher() ? `style="cursor: default!important;"` : ''}>
                            <i class="far fa-star fa-sm text-primary" title="Good"></i>
                          </li>
                          <li ${isteacher() ? `style="cursor: default!important;"` : ''}>
                            <i class="far fa-star fa-sm text-primary" title="Excellent"></i>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="col-2 r-btn-cmnt">
                    <div class="row"> <!-- row for the button and comment section -->
                      <div class="col-8">
                        
                          ${
                            (submitted_info.is_submitted || isteacher())
                            ? `<button class="btn btn-primary is-submitted-btn" type="button" id="is-submitted-btn-${post.id}">
                                <i class="fas fa-${(isteacher()) ? 'book' : 'eye'} fa-lg me-2"></i>${(isteacher()) ? 'Grade' : 'View'} Submission` + ((isteacher()) ? 's' : '') +
                              '</button>'
                            : `<div class="btn-group">
                                <button type="button" class="btn btn-primary" id="is-submitted-btn-${post.id}">
                                  <i class="fas fa-upload fa-lg me-2"></i>Submit Assignment
                                </button>
                                <button
                                  class="btn btn-primary dropdown-toggle dropdown-toggle-split"
                                  type="button"
                                  data-mdb-toggle="dropdown"
                                  aria-expanded="false"
                                ></button>
                                <ul class="dropdown-menu" id="dropdown-menu-${post.id}">
                                  <li><a class="dropdown-item" href="#1">Text Submission</a></li>
                                  <li><a class="dropdown-item" href="#2">File Upload</a></li>
                                  <li><a class="dropdown-item" href="#3">Link Submission</a></li>
                                </ul>
                              </div>`
                          }
                      </div>
                    </div>
                    <div> <!-- row for the comment section -->
                      <div class="row">
                        <div class="col-6">
                          <textarea class="form-control mention" id="comment-box-${post.id}" placeholder="Add a comment" autocomplete="off"></textarea>
                          <label for="comment-box" class="form-label">Shift + Enter to submit <span class="badge rounded-pill badge-primary ms-2" id="comments-count-${post.id}">${comments.length}</span></label>
                        </div>
                      </div>
                    </div>
                    <div class="row"> <!-- row for the comments -->
                      <div class="col-6 comments-parent">
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
                          <!-- down arrow icon -->
                          <div style="width: 100%; position: sticky; bottom: 0; display: flex; justify-content: center;"><i class="fas fa-arrow-down fa-2x" id="comment-arrow-${post.id}"></i></div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- area to submit assignment or view assignment -->
                <div class="col-5 submission-area" id="submission-area-${post.id}">
                  <div class="wysiwyg visually-hidden" data-mdb-wysiwyg="wysiwyg" id="wysiwyg-${post.id}"></div>
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

      window.last_comment_update = Date.now();
      assignmentsQuizzesAndResources.forEach((post) => {
        try {
          new Mention(document.getElementById(`comment-box-${post.id}`), {
            showImg: true,
            items: [
              { name: 'Chrissy', username: 'Chrissy', image: '/static/chris.png' },
              { name: 'Wyatt Gaston', username: 'Wyatt Gaston', image: '/static/wyatt.png' },
              { name: 'RahukE', username: 'RahukE', image: '/static/rahul.png' },
              { name: 'Theodore Junior', username: 'Theodore Junior', image: '/static/tj.png' },
              { name: 'Jainaldo', username: 'Jainaldo', image: '/static/jainaldo.png' },
              { name: 'Maruabb', username: 'Maruabb', image: '/static/maruabb.png' },
            ],
          });
        } catch (e) {};
        
        try {
          const btn = document.getElementById(`is-submitted-btn-${post.id}`);
          new mdb.Dropdown(btn);
        
          document.querySelectorAll(`#dropdown-menu-${post.id} > li > a.dropdown-item`).forEach((e) => {
            e.addEventListener('click', () => {
              const href = e.href.substring(e.href.length - 1);
              current_submission_type[post.id] = href;
              if (href == 1) {
                // text submission
                document.getElementById(`submission-area-${post.id}`).innerHTML = `<div class="wysiwyg" data-mdb-wysiwyg="wysiwyg" id="wysiwyg-${post.id}"></div>`;
                new WYSIWYG(document.getElementById(`wysiwyg-${post.id}`));
                
                document.getElementById(`wysiwyg-${post.id}`).addEventListener('click', () => {
                  try {
                    hljs.highlightElement(document.querySelector(`#wysiwyg-${post.id} pre code`));
                  } catch (e) {};
                });

                btn.addEventListener('click', () => {
                  const text = document.querySelector(`#submission-area-${post.id} > textarea`).value;
                  
                  if (text.length === 0 || text > 5242880) {
                    alert('ERROR: Submission cannot be empty');
                    return;
                  }

                  if (current_submission_type[post.id] == 1) {
                    API.put(`/submissions/assignments/${post.id}/${getUsername()}`, {
                      submission: text,
                      submission_type: 'text'
                    }, false).then((res) => {
                      if (res.status === 200) {
                        // success
                        API.put(`/submitted/assignments/${post.id}/${getUsername()}`, {
                          is_submitted: true,
                          submitted_at: Date.now(),
                        }, false).then((res) => {
                          if (res.status === 200) {
                            // success
                            alert("Successfully submitted your assignment!");
                            window.location.reload();
                          } else {
                            // error
                            new mdb.Modal(document.getElementById("submission-error-modal")).show();
                          }
                        });
                      } else {
                        // error
                        new mdb.Modal(document.getElementById("submission-error-modal")).show();
                      }
                    });
                  }
                });
              } else if (href == 2) {
                document.getElementById(`submission-area-${post.id}`).innerHTML = `
                  <div class="file-upload row">
                  <div class="progress">
                    <div class="progress-bar" id="progress-bar-${post.id}" role="progressbar" style="width: 0%;" aria-valuenow="-" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                    <div class="file-upload-wrapper col-12">
                      <input
                        id="file-upload-${post.id}"
                        type="file"
                        class="file-upload-input"
                        data-mdb-multiple="true"
                        data-mdb-max-file-size="5M"
                        data-mdb-accepted-extensions=".webm, .pdf, .py, .txt, .html, .css, .js, .jpg, .jpeg, .json, .csv, .pickle, .pkl, .sql"
                        data-mdb-max-file-quantity="5"
                        data-mdb-file-upload="file-upload"
                      />
                    </div>
                  </div>`;

                const fileUploadElement = document.getElementById(`file-upload-${post.id}`);
                new FileUpload(fileUploadElement);

                btn.addEventListener('click', async () => {
                  const files = fileUploadElement.files;
                  console.log(files);
                  if (files.length === 0) {
                    alert('ERROR: No files selected');
                    return;
                  }
                  
                  const progressBar = document.getElementById(`progress-bar-${post.id}`);
                  const storage = getStorage();
                  let urls = '';

                  function upload(filename, file, filecount, filenum) {
                    return new Promise((_done) => {
                      const portionOfProgressBar = 100 / filecount;
                      const fileRef = ref(storage, `assignment-submissions/${post.id}/${getUsername()}/${filename}`);
                      const uploadTask = uploadBytesResumable(fileRef, file);
                      uploadTask.on("state_changed", (snapshot) => {
                        const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * (portionOfProgressBar * filenum)).toFixed(2);
                        progressBar.setAttribute('aria-valuenow', `${progress}`);
                        progressBar.style.width = `${progress}%`;
                      }, (err) => {
                        // error
                        new mdb.Modal(document.getElementById("submission-error-modal")).show();
                      }, () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                          urls += url + '<;$;>';
                          _done();
                        });
                      });
                    });
                  }

                  for (let i = 0; i < files.length; i++) {
                    await upload(files[i].name, files[i], files.length, i +1);
                  }

                  API.put(`/submissions/assignments/${post.id}/${getUsername()}`, {
                    submission: urls.substring(0, urls.length - 5), // remove trailing sep
                    submission_type: 'files',
                    filenames: Array.from(files).map((file) => file.name).join('<;$;>')
                  }, false).then((res) => {
                    if (res.status === 200) {
                      // success
                      API.put(`/submitted/assignments/${post.id}/${getUsername()}`, {
                        is_submitted: true,
                        submitted_at: Date.now(),
                      }, false).then((res) => {
                        if (res.status === 200) {
                          // success
                          alert("Successfully submitted your assignment!");
                          window.location.reload();
                        } else {
                          // error
                          new mdb.Modal(document.getElementById("submission-error-modal")).show();
                        }
                      });
                    } else {
                      // error
                      new mdb.Modal(document.getElementById("submission-error-modal")).show();
                    }
                  });
                });
              } else if (href == 3) {
                document.getElementById(`submission-area-${post.id}`).innerHTML = `
                  <div class="url-submission-container">
                    <div class="form-outline">
                      <input type="text" id="url-submission-${post.id}" class="form-control" />
                      <label class="form-label" for="url-submission-${post.id}">URL Submission</label>
                    </div>
                </div>`;

                const urlSubmission = document.getElementById(`url-submission-${post.id}`);
                new mdb.Input(urlSubmission.parentElement);

                function submitUrl(e, nocheck = false) {
                  if (current_submission_type[post.id] == 3 && (e?.key === 'Enter' || nocheck)) {
                    //
                    // submit url
                    //
                    const url = urlSubmission.value;
                    API.put(`/submissions/assignments/${post.id}/${getUsername()}`, {
                      submission: url,
                      submission_type: 'url'
                    }, false).then((res) => {
                      if (res.status === 200) {
                        // success
                        API.put(`/submitted/assignments/${post.id}/${getUsername()}`, {
                          is_submitted: true,
                          submitted_at: Date.now(),
                        }, false).then((res) => {
                          if (res.status === 200) {
                            // success
                            alert("Successfully submitted your assignment!");
                            window.location.reload();
                          } else {
                            // error
                            new mdb.Modal(document.getElementById("submission-error-modal")).show();
                          }
                        });
                      } else {
                        // error
                        new mdb.Modal(document.getElementById("submission-error-modal")).show();
                      }
                    });
                  }
                }

                urlSubmission.addEventListener('keydown', (e) => { submitUrl(e) });
                btn.addEventListener('click', () => { submitUrl(e, true) });
              }
            });
          });

          const is_submitted = btn.innerText.includes('View');
          if (isteacher()) {
            btn.addEventListener('click', () => {
              // go to grading tab
              window.location.href = `/grade/?assignment=${post.id}`;
            });
          } else if (is_submitted) {
            function showSubmission(submission) {
              const submissionArea = document.getElementById(`submission-area-${post.id}`);
              
              if (submission.submission_type === 'text') {
                submissionArea.innerHTML = `
                  <div class="text-submission-container">
                    <div class="form-outline">
                      <label class="form-label" for="text-submission-${post.id}">Text Submission</label>
                      <textarea class="form-control" id="text-submission-${post.id}" rows="4" readonly>${submission.submission}</textarea>
                    </div>
                  </div>`;
              } else if (submission.submission_type === 'files') {
                const urls = submission.submission.split('<;$;>');
                const filenames = submission.filenames.split('<;$;>');

                submissionArea.innerHTML = `
                  <div class="files-submission-container">
                    <!-- display each file in the area, taking up the entire width of the column. the files are stacked vertically and can be scrolled -->
                    <div class="files-submission">
                      ${urls.map((url, i) => {
                        const uuid = uuid4();
                        return `
                          <div class="file-submission">
                            <a class="btn btn-primary" id="${uuid}" href="${url}" target="_blank">View</a>
                            <label for="uuid">${filenames[i]}</label>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>`;
              } else if (submission.submission_type === 'url') {
                submissionArea.innerHTML = `
                  <div class="url-submission-viewing-container">
                    <div class="form-outline">
                      <label class="form-label" for="url-submission-${post.id}">URL Submission</label>
                      <input type="text" id="url-submission-${post.id}" class="form-control" value="${submission.submission}" readonly />
                    </div>
                    <iframe src="${submission.submission}" class="url-submission-iframe"></iframe>
                  </div>`;
              }
            }
            
            btn.addEventListener('click', () => {
              // check if submission exists first
              if (submissions[post.id]) {
                // show submission
                const submission = submissions[post.id];
                showSubmission(submission);
              } else {
                // get submission
                API.get(`/submissions/assignments/${post.id}/${getUsername()}`).then((submission) => {
                  // show submission
                  submissions[post.id] = submission;
                  showSubmission(submission);
                });
              }
            });
          } else {
            // show submission area editor
            const editor = document.getElementById(`wysiwyg-${post.id}`);
            editor.classList.remove('visually-hidden');
            new WYSIWYG(editor);

            document.getElementById(`wysiwyg-${post.id}`).addEventListener('click', () => {
              try {
                hljs.highlightElement(document.querySelector(`#wysiwyg-${post.id} pre code`));
              } catch (e) {};
            });

            current_submission_type[post.id] = 1;
            btn.addEventListener('click', () => {
              if (current_submission_type[post.id] == 1) {
                const text = document.querySelector(`#submission-area-${post.id} > textarea`).value;

                if (text.length === 0 || text > 5242880) {
                  alert('ERROR: Submission cannot be empty');
                  return;
                }

                API.put(`/submissions/assignments/${post.id}/${getUsername()}`, {
                  submission: text,
                  submission_type: 'text'
                }, false).then((res) => {
                  if (res.status === 200) {
                    // success
                    API.put(`/submitted/assignments/${post.id}/${getUsername()}`, {
                      is_submitted: true,
                      submitted_at: Date.now(),
                    }, false).then((res) => {
                      if (res.status === 200) {
                        // success
                        alert("Successfully submitted your assignment!");
                        window.location.reload();
                      } else {
                        // error
                        new mdb.Modal(document.getElementById("submission-error-modal")).show();
                      }
                    });
                  } else {
                    // error
                    new mdb.Modal(document.getElementById("submission-error-modal")).show();
                  }
                });
              }
            });
          }
        } catch (e) {

        }

        try {
          if (isteacher()) {
            new mdb.Rating(document.getElementById(`rating-${post.id}`), { readonly: true });
          } else {
            // rating
            API.get(`/ratings/${post.id}/${getUsername()}`).then((rating) => {
              try {
                new mdb.Rating(document.getElementById(`rating-${post.id}`), { readonly: false, value: rating || 0 });
                document.getElementById(`rating-${post.id}`).addEventListener('click', () => {
                  // get rating
                  const stars = mdb.Rating.getInstance(document.getElementById(`rating-${post.id}`))._index + 1;
                  
                  // update rating
                  API.put(`/ratings/${post.id}/${getUsername()}`, stars);
                });
              } catch (e) {};
            });

            // popover
            document.getElementById(`popover-${post.id}`).addEventListener('click', () => {
              if (!popovers[post.id]) {
                new mdb.Popover(document.getElementById(`popover-${post.id}`), { placement: 'top' }).show();
                popovers[post.id] = true;
              } else {
                mdb.Popover.getInstance(document.getElementById(`popover-${post.id}`)).dispose();
                popovers[post.id] = false;
              }
            });
          }
        } catch (e) {};

        try {
          // listen for new comments
          checkForNewComments(post.id);
        } catch (e) {};

        try {
          document.getElementById(`comment-arrow-${post.id}`).addEventListener('click', () => {
            document.querySelector(`#comments-${post.id} > div:nth-last-child(2)`).scrollIntoView({ behavior: 'smooth' });
          });
        } catch (e) {};

        try {
          document.getElementById(`comment-box-${post.id}`).addEventListener('keydown', (e) => {
            const commentBox = document.getElementById(`comment-box-${post.id}`);
            
            if (e.key === "Tab") {
              e.preventDefault();
              const start = commentBox.selectionStart;
              const end = commentBox.selectionEnd;
              commentBox.value = commentBox.value.substring(0, start) + "\t" + commentBox.value.substring(end);
              commentBox.selectionStart = commentBox.selectionEnd = start + 1;
              return;
            }

            if (commentBox.value.trim() && e.shiftKey && e.key === 'Enter') {
              e.preventDefault();

              // check if the cooldown is still activated
              if (!comment_cooldown.enabled(post.id)) {
                document.getElementById('cooldown-time').innerText = comment_cooldown.getRemainingSeconds(post.id);
                new mdb.Toast(document.getElementById('cooldown-warning'), {
                  position: 'top-right',
                  autohide: true,
                  animation: true,
                  delay: 1500,
                  stacking: false
                }).show();
                return;
              }

              comment_cooldown.start(post.id);

              // post to database
              API.submitComment(getUsername(), post.id, parseMentions(commentBox.value.trim().replaceAll(/\n/g, "<br>").replaceAll(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"))).then((comment) => {
                const ele = document.getElementById(`comments-${post.id}`);
                const uuid = uuid4();
                commentBox.value = '';

                // update comments                                            this is the down arrow icon
                ele.innerHTML = ele.innerHTML.substring(0, ele.innerHTML.indexOf(`<div style="width: 100%; position: sticky; bottom: 0; display: flex; justify-content: center;"><i class="fas fa-arrow-down fa-2x" id="comment-arrow-${post.id}"></i></div>`)) + `
                  <div class="comment shadow-4" id="${`comment-${uuid}`}">
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
                </div>
                <!-- down arrow icon -->
                <div id="scrollToView-${post.id}" style="width: 100%; position: sticky; bottom: 0; display: flex; justify-content: center;"><i class="fas fa-arrow-down fa-2x" id="comment-arrow-${post.id}"></i></div>`;
              
              // update comments count
              document.getElementById(`comments-count-${post.id}`).innerText = parseInt(document.getElementById(`comments-count-${post.id}`).innerText) + 1;

              // notify all clients of new comment
              API.put(`/recent_comment/${post.id}/`, Date.now()).then(() => {
                // prevent update from being detected as new comment
                window.last_comment_update = Date.now();
                API.put(`/recent_comment_info/${post.id}/`, { author: getUsername(), post_title: post.name, mentions: getMentions(comment.body), module: post.module });
              });

              document.getElementById(`scrollToView-${post.id}`).scrollIntoView();
              const comment_ele = document.getElementById(`comment-${uuid}`);
              comment_ele.scrollIntoView();
              comment_ele.classList.add('popout');

              document.getElementById(`comment-arrow-${post.id}`).addEventListener('click', () => {
                comment_ele.scrollIntoView({ behavior: 'smooth' });
              });

              setTimeout(() => {
                comment_ele.classList.remove('popout');
              }, 1500);
              });
            }
          });

          comment_cooldown.addPost(post.id);
        } catch (e) {};
      });
    });
  // prevent error if there are no posts to a module
  } catch (err) {};
}

new Promise((_res) => {
  // get all modules
  API.get('/modules/').then((_modules) => {
    _modules = _modules || {};
    const sidenavContainer = document.getElementById('nav-body');

    // sort by date posted
    let modules = Array.from(Object.values(_modules)).sort((a, b) => new Date(a.posted) - new Date(b.posted))//TODO:.reverse(); make sure to add the .reverse back because the modules should be in order of most receltly posted
    checkForFinish(modules.length, _res);

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

        if (sidenavContainer.children.length === 0) {
          // for the first module
          sidenavContainer.appendChild(sidenavModule);
        } else {
          // for the rest of the modules
          sidenavContainer.insertBefore(sidenavModule, sidenavContainer.children[i]);
        }

        // add the event listener to the sidenav-item
        sidenavModule.addEventListener('click', (e) => {
          if (window.activeModule === module.name) return;
          else window.activeModule = module.name;
          
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
              populateAccordion(moduleChildren[module.name], _res);
            });
          } else {
            populateAccordion(moduleChildren[module.name], _res);
          }

          // this function will active if one of the children is clicked
          // not the proper behaviour; below checks to see if parent was clicked
          if (e.target.tagName === 'A' && e.target.role !== 'button') return;

          // don't change the folder_state if the click was caused by the website automatically opening the first module
          if (window.first_time_open) {
            window.first_time_open = false;
            return;
          }
          
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
      });
    });
  });
}).then(async() => {
  // wait for the sidenav to be created
  const sidenav = new mdb.Sidenav(document.getElementById('sidenav'))
  sidenav.show();

  window.first_time_open = true;
  document.querySelector('.sidenav-item').click();
});
