export function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default class API {
  static baseURL = 'https://codeclass-51eae-default-rtdb.firebaseio.com/';

  static URL(path = '') {
    return (this.baseURL + path + '.json').replaceAll('//', '/').replace('/.json', '.json');
  }

  static async get(path) {
    const response = await fetch(this.URL(path));
    return await response.json();
  }

  static async post(path, data) {
    const response = await fetch(this.URL(path), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  static async put(path, data, returnJSON = true) {
    const response = await fetch(this.URL(path), {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (returnJSON) {
      return await response.json();
    } else {
      return response;
    }
  }

  static async delete(path) {
    const response = await fetch(this.URL(path), {
      method: 'DELETE',
    });
    return await response.json();
  }

  static async getModules() {
    return Object.keys((await this.get('/modules/')) || []);
  }

  static async createAssignment(assignment) {
    const uuid = uuid4();
    assignment['id'] = uuid;

    // increment the total number of assignments
    await this.put('/total/assignments', (await this.get('/total/assignments')) + 1);

    // update the total number of points
    await this.put('/total/points', (await this.get('/total/points')) + assignment.points);

    // update the number of assignments in the module
    await this.put(`/modules/${assignment.module}/assignmentCount`, (await this.get(`/modules/${assignment.module}/assignmentCount`)) + 1);

    // update the number of points in the module
    await this.put(`/modules/${assignment.module}/pointsInModule`, (await this.get(`/modules/${assignment.module}/pointsInModule`)) + assignment.points);

    // create the assignment
    return await this.put(`/assignments/${assignment.module}/${uuid}`, assignment, false);
  }

  static async createModule(module) {
    // increment the total number of modules
    await this.put('/total/modules', (await this.get('/total/modules')) + 1);

    // create the module
    return await this.put(`/modules/${module.name}`, module, false);
  }

  static async createResource(resource) {
    const uuid = uuid4();
    resource['id'] = uuid;

    // increment the total number of resources
    await this.put('/total/resources', (await this.get('/total/resources')) + 1);

    // update the number of resources in the module
    await this.put(`/modules/${resource.module}/resourceCount`, (await this.get(`/modules/${resource.module}/resourceCount`)) + 1);

    // create the resource
    return await this.put(`/resources/${resource.module}/${uuid}`, resource, false);
  }

  static async createQuiz(quiz) {
    const uuid = uuid4();
    quiz['id'] = uuid;

    // increment the total number of quizzes
    await this.put('/total/quizzes', (await this.get('/total/quizzes')) + 1);

    // update the total number of points
    await this.put('/total/points', (await this.get('/total/points')) + quiz.points);

    // update the number of quizzes in the module
    await this.put(`/modules/${quiz.module}/quizCount`, (await this.get(`/modules/${quiz.module}/quizCount`)) + 1);

    // update the number of points in the module
    await this.put(`/modules/${quiz.module}/pointsInModule`, (await this.get(`/modules/${quiz.module}/pointsInModule`)) + quiz.points);

    // create the quiz
    return await this.put(`/quizzes/${quiz.module}/${uuid}`, quiz, false);
  }
}