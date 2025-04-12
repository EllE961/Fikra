// Example using fetch or axios
export const apiClient = async (endpoint, {method = 'GET', body, token} = {}) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const config = {
      method,
      headers,
    };
  
    if (body) {
      config.body = JSON.stringify(body);
    }
  
    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }
      return data;
    } catch (err) {
      console.error('apiClient error:', err);
      throw err;
    }
  };
  