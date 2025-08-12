class HttpRequest {
  constructor() {
    this.baseUrl = "https://spotify.f8team.dev/api/";
  }

  async _send(path, method, data, option = {}) {
    try {
      const _option = {
        ...option,
        method,
        headers: {
          ...option.headers,
          "Content-Type": "application/json",
        },
      };
      if (data) {
        _option.body = JSON.stringify(data);
      }
      const res = await fetch(`${this.baseUrl}${path}`, _option);
      const response = await res.json();
      if (!res.ok) {
        const err = new Error(`HTTP error: ${res.status}`);
        err.response = response;
        throw err;
      }
      return response;
    } catch (error) {
      console.log(error, "err");
      throw error;
    }
  }
  async get(path, option) {
    return await this._send(path, "GET", null, option);
  }

  async post(path, data, option) {
    return await this._send(path, "POST", data, option);
  }
  async put(path, data, option) {
    return await this._send(path, "PUT", data, option);
  }
  async patch(path, data, option) {
    return await this._send(path, "PATCH", data, option);
  }
  async del(path, option) {
    return await this._send(path, "DELETE", null, option);
  }
}

const httpRequest = new HttpRequest();
export default httpRequest;
