/**
 * Centralized API Client
 * Automatically attaches JWT authentication token and unifies response/error handling
 */

const API_BASE_URL = '/api';

class ApiClient {
  static getToken() {
    return localStorage.getItem('smart_ecom_token');
  }

  static async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Handle file downloads (Excel, CSV)
      const contentType = response.headers.get('content-type');
      if (contentType && (contentType.includes('spreadsheetml') || contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
        if (!response.ok) {
          throw new Error(`Export download failed with status ${response.status}`);
        }
        return response.blob();
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
      }

      return data;
    } catch (err) {
      console.error(`[API ERROR ${endpoint}]:`, err.message);
      throw err;
    }
  }

  // GET
  static get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`${endpoint}${queryString}`, { method: 'GET' });
  }

  // POST
  static post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  }

  // PUT
  static put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  // DELETE
  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default ApiClient;
