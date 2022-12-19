export default class API {
  static baseURL = 'https://codeclass-51eae-default-rtdb.firebaseio.com/';

  static async get(path) {
    const response = await fetch(this.baseURL + path + '.json');
    return await response.json();
  }

  static async post(path, data) {
    const response = await fetch(this.baseURL + path + '.json', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  static async patch(path, data) {
    const response = await fetch(this.baseURL + path + '.json', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  static async delete(path) {
    const response = await fetch(this.baseURL + path + '.json', {
      method: 'DELETE',
    });
    return await response.json();
  }
}