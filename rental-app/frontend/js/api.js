const API_BASE = 'http://localhost:5000/api';

const api = {
  async request(method, endpoint, data = null, isFormData = false) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const config = {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Something went wrong');
    return json;
  },

  get: (endpoint) => api.request('GET', endpoint),
  post: (endpoint, data, isFormData) => api.request('POST', endpoint, data, isFormData),
  put: (endpoint, data, isFormData) => api.request('PUT', endpoint, data, isFormData),
  delete: (endpoint) => api.request('DELETE', endpoint),
};

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

function getCategoryIcon(cat) {
  const icons = { Electronics: '📱', Vehicles: '🚗', Tools: '🔧', Furniture: '🛋️', Sports: '⚽', Clothing: '👕', Books: '📚', Cameras: '📷', Music: '🎸', Other: '📦' };
  return icons[cat] || '📦';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) stars += '<span class="star">★</span>';
    else if (i === full && half) stars += '<span class="star" style="opacity:0.5">★</span>';
    else stars += '<span style="color:var(--gray-2)">★</span>';
  }
  return stars;
}

function getImageUrl(item) {
  if (item.images && item.images.length > 0) return `http://localhost:5000${item.images[0]}`;
  return null;
}
