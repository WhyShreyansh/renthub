const API_BASE = 'https://renthub-3-wc7z.onrender.com/api';

const api = {
  async request(method, endpoint, data = null, isFormData = false) {
    try {
      const headers = {};
      const token = localStorage.getItem('token');

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const config = {
        method,
        headers,
        body: data
          ? (isFormData ? data : JSON.stringify(data))
          : undefined
      };

      const res = await fetch(`${API_BASE}${endpoint}`, config);

      // Handle non-JSON responses safely
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error("Server error (invalid response)");
      }

      if (!res.ok) {
        throw new Error(json.message || "Something went wrong");
      }

      return json;

    } catch (err) {
      console.error("API Error:", err.message);
      showToast(err.message, "error");
      throw err;
    }
  },

  get: (endpoint) => api.request('GET', endpoint),
  post: (endpoint, data, isFormData) => api.request('POST', endpoint, data, isFormData),
  put: (endpoint, data, isFormData) => api.request('PUT', endpoint, data, isFormData),
  delete: (endpoint) => api.request('DELETE', endpoint),
};


// 🔔 Toast notification
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}


// 🎯 Category icons
function getCategoryIcon(cat) {
  const icons = {
    Electronics: '📱',
    Vehicles: '🚗',
    Tools: '🔧',
    Furniture: '🛋️',
    Sports: '⚽',
    Clothing: '👕',
    Books: '📚',
    Cameras: '📷',
    Music: '🎸',
    Other: '📦'
  };

  return icons[cat] || '📦';
}


// 📅 Format date
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}


// ⭐ Rating stars
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  let stars = '';

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars += '<span class="star">★</span>';
    } else if (i === full && half) {
      stars += '<span class="star" style="opacity:0.5">★</span>';
    } else {
      stars += '<span style="color:var(--gray-2)">★</span>';
    }
  }

  return stars;
}


// 🖼️ Image URL handler
function getImageUrl(item) {
  if (item.images && item.images.length > 0) {
    return `https://renthub-3-wc7z.onrender.com${item.images[0]}`;
  }
  return null;
}
