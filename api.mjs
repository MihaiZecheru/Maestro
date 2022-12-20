export default class API {
  static baseURL = 'https://codeclass-51eae-default-rtdb.firebaseio.com/';

  static URL(path = '') {
    return (this.baseURL + path + '.json').replace('//', '/');
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

  static async patch(path, data) {
    const response = await fetch(this.URL(path), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  static async delete(path) {
    const response = await fetch(this.URL(path), {
      method: 'DELETE',
    });
    return await response.json();
  }
}