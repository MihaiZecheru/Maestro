function uuid4() {
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
    await this.put('/total/assignments', (await this.get('/total/assignments')) + 1);
    await this.put('/total/points', (await this.get('/total/points')) + assignment.points);
    await this.put(`/modules/${assignment.module}/assignmentCount`, (await this.get(`/modules/${assignment.module}/assignmentCount`)) + 1);
    await this.put(`/modules/${assignment.module}/pointsInModule`, (await this.get(`/modules/${assignment.module}/pointsInModule`)) + assignment.points);
    return await this.put(`/assignments/${assignment.module}/${uuid}`, assignment, false);
  }

  static async createModule(module) {
    await this.put('/total/modules', (await this.get('/total/modules')) + 1);
    return await this.put(`/modules/${module.name}`, module, false);
  }
}