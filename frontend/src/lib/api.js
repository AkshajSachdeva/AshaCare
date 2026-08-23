const BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export async function api(path, { method = 'GET', body, form = false } = {}) {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization:`Bearer ${token}` } : {}),
      ...(!form && body ? { 'Content-Type':'application/json' } : {})
    },
    body:body ? (form ? body : JSON.stringify(body)) : undefined
  });

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error('Server returned an unreadable response');
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    throw new Error(json.message || 'Request failed');
  }
  return json.data;
}

export { BASE };
