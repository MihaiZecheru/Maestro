import API from "../api.mjs";

const assignment_number = new URLSearchParams(window.location.search).get("assignment");
const module_id = new URLSearchParams(window.location.search).get("module");

// const assignment_id // user dict here

API.get(`/assignments/${module_id}/${assignment_id}/`).then((assignment) => {
  API.get(`/submissions/assignments/${assignment_id}/`).then((submissions) => {
    console.log(submissions);
  });
});
