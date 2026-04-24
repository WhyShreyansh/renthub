let currentPage = 1;
let currentFilters = { type: '', category: '', search: '', sort: '', location: '' };

// Type buttons
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilters.type = this.dataset.type;
  });
});

async function loadItems(page = 1) {
  currentPage = page;
  const grid = document.getElementById('items-grid');
  const sortVal = document.getElementById('sort-select')?.value || '';
  const titleEl = document.getElementById('items-title');

  if (!grid) return;
  grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading items...</p></div>';

  const params = new URLSearchParams({
    page,
    limit: 12,
    ...(currentFilters.type && { type: currentFilters.type }),
    ...(currentFilters.category && { category: currentFilters.category }),
    ...(currentFilters.search && { search: currentFilters.search }),
    ...(sortVal && { sort: sortVal }),
    ...(currentFilters.location && { location: currentFilters.location }),
  });

  try {
    const data = await api.get(`/items?${params}`);
    if (titleEl) {
      if (currentFilters.category) titleEl.innerHTML = `${currentFilters.category} <span>Items</span>`;
      else if (currentFilters.search) titleEl.innerHTML = `Results for "<span>${currentFilters.search}</span>"`;
      else titleEl.innerHTML = 'Featured <span>Items</span>';
    }
    renderItems(data.items);
    renderPagination(data.currentPage, data.pages);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load items</h3><p>${err.message}</p></div>`;
  }
}

function renderItems(items) {
  const grid = document.getElementById('items-grid');
  if (!items.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No items found</h3><p>Try adjusting your search or filters</p></div>';
    return;
  }
  grid.innerHTML = items.map(item => {
    const imgUrl = getImageUrl(item);
    const ownerInitial = item.owner?.name?.charAt(0).toUpperCase() || '?';
    return `
    <div class="item-card fade-in" onclick="openItemModal('${item._id}')">
      <div class="item-img-wrap">
        ${imgUrl ? `<img src="${imgUrl}" alt="${item.title}" loading="lazy">` : `<div class="item-img-placeholder">${getCategoryIcon(item.category)}</div>`}
        <div class="item-badges">
          ${item.availableForRent ? '<span class="badge badge-rent">Rent</span>' : ''}
          ${item.availableForSale ? '<span class="badge badge-buy">Buy</span>' : ''}
          ${item.isSold ? '<span class="badge badge-sold">Sold</span>' : ''}
        </div>
      </div>
      <div class="item-body">
        <div class="item-category">${item.category}</div>
        <div class="item-title">${item.title}</div>
        <div class="item-location">📍 ${item.location}</div>
        <div class="item-pricing">
          <div>
            <div class="item-price-main">₹${Number(item.pricePerDay).toLocaleString()}<span class="item-price-unit">/day</span></div>
            ${item.availableForSale && item.salePrice ? `<div style="font-size:12px;color:var(--primary);margin-top:2px">Buy: ₹${Number(item.salePrice).toLocaleString()}</div>` : ''}
          </div>
          <div class="item-rating">
            <span class="star">★</span>${item.rating ? item.rating.toFixed(1) : 'New'}
          </div>
        </div>
      </div>
      <div class="item-owner">
        <div class="owner-avatar">${ownerInitial}</div>
        <span class="owner-name">${item.owner?.name || 'Unknown'}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--text-2)">${item.condition}</span>
      </div>
    </div>`;
  }).join('');
}

function renderPagination(current, total) {
  const el = document.getElementById('pagination');
  if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }
  let html = '';
  if (current > 1) html += `<button class="page-btn" onclick="loadItems(${current-1})">‹</button>`;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 2)
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="loadItems(${i})">${i}</button>`;
    else if (Math.abs(i - current) === 3) html += `<span style="padding:8px">…</span>`;
  }
  if (current < total) html += `<button class="page-btn" onclick="loadItems(${current+1})">›</button>`;
  el.innerHTML = html;
}

function searchItems() {
  currentFilters.search = document.getElementById('search-input')?.value || '';
  currentFilters.category = document.getElementById('search-category')?.value || '';
  document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' });
  loadItems(1);
}

function filterByCategory(cat) {
  currentFilters.category = cat;
  currentFilters.search = '';
  document.getElementById('search-category').value = cat;
  document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' });
  loadItems(1);
}

// Enter key search
document.getElementById('search-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchItems();
});

// ============================
// ITEM DETAIL MODAL
// ============================
let currentItemData = null;

async function openItemModal(id) {
  const overlay = document.getElementById('item-modal-overlay');
  const content = document.getElementById('item-modal-content');
  overlay.classList.add('open');
  content.innerHTML = '<div style="padding:60px;text-align:center"><div class="spinner"></div></div>';

  try {
    const item = await api.get(`/items/${id}`);
    currentItemData = item;
    renderItemModal(item);
  } catch (err) {
    content.innerHTML = `<div style="padding:40px;text-align:center"><p>Failed to load item</p></div>`;
  }
}

function renderItemModal(item) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwner = user && item.owner && (item.owner._id === user.id);
  const imgUrl = getImageUrl(item);
  const ownerInitial = item.owner?.name?.charAt(0).toUpperCase() || '?';

  document.getElementById('item-modal-content').innerHTML = `
    <div class="item-detail">
      <div class="item-detail-images">
        ${imgUrl ? `<img src="${imgUrl}" alt="${item.title}">` : `<div class="item-img-placeholder">${getCategoryIcon(item.category)}</div>`}
        <div class="item-badges" style="position:absolute;top:16px;left:16px">
          ${item.availableForRent ? '<span class="badge badge-rent">For Rent</span>' : ''}
          ${item.availableForSale ? '<span class="badge badge-buy">For Sale</span>' : ''}
        </div>
      </div>
      <div class="item-detail-info">
        <div class="item-detail-category">${item.category} · ${item.condition}</div>
        <h2 class="item-detail-title">${item.title}</h2>
        <div class="item-detail-rating">
          ${renderStars(item.rating)} <span>${item.rating ? item.rating.toFixed(1) : 'No ratings'} (${item.totalRatings} reviews)</span>
        </div>
        <p class="item-detail-desc">${item.description}</p>

        <div class="price-section">
          ${item.availableForRent ? `
            <div class="price-row">
              <span class="price-label">Per Day</span>
              <span class="price-value">₹${Number(item.pricePerDay).toLocaleString()}</span>
            </div>
            ${item.pricePerWeek ? `<div class="price-row"><span class="price-label">Per Week</span><span class="price-value">₹${Number(item.pricePerWeek).toLocaleString()}</span></div>` : ''}
            ${item.pricePerMonth ? `<div class="price-row"><span class="price-label">Per Month</span><span class="price-value">₹${Number(item.pricePerMonth).toLocaleString()}</span></div>` : ''}
          ` : ''}
          ${item.availableForSale && item.salePrice ? `
            <div class="price-row">
              <span class="price-label">Sale Price</span>
              <span class="price-value sale">₹${Number(item.salePrice).toLocaleString()}</span>
            </div>
          ` : ''}
        </div>

        ${item.tags?.length ? `<div class="detail-tags">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}

        <div class="owner-section">
          <div style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-2);margin-bottom:8px">Listed by</div>
          <div class="owner-card">
            <div class="owner-card-avatar">${ownerInitial}</div>
            <div class="owner-card-info">
              <h4>${item.owner?.name}</h4>
              <p>📍 ${item.owner?.location || item.location} · ⭐ ${item.owner?.rating?.toFixed(1) || 'New'}</p>
            </div>
          </div>
        </div>

        ${!isOwner ? `
        <div class="request-form" id="req-form">
          <h4>Make a Request</h4>
          <div class="request-type-tabs">
            ${item.availableForRent ? `<button class="req-tab active" onclick="setReqType('rent', this)">🔑 Rent</button>` : ''}
            ${item.availableForSale && !item.isSold ? `<button class="req-tab ${!item.availableForRent ? 'active' : ''}" onclick="setReqType('buy', this)">🛒 Buy</button>` : ''}
          </div>
          <div id="rent-fields">
            <div class="form-row">
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" id="req-start" min="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" id="req-end">
              </div>
            </div>
            <div id="rental-calc" style="font-size:14px;color:var(--text-2);margin-bottom:12px"></div>
          </div>
          <div class="form-group">
            <label>Message to owner (optional)</label>
            <textarea id="req-message" rows="2" placeholder="Hi, I'd like to rent/buy your item..."></textarea>
          </div>
          <div id="req-error" class="form-error"></div>
          <button class="btn-primary full-width" onclick="submitRequest('${item._id}')">Send Request</button>
        </div>` : `
        <div style="background:var(--gray-1);padding:16px;border-radius:var(--radius);font-size:14px;color:var(--text-2);text-align:center">
          This is your listing. <a href="pages/dashboard.html" style="color:var(--primary);font-weight:600">Manage it →</a>
        </div>`}
      </div>
    </div>`;

  // Calculate cost
  ['req-start', 'req-end'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', calcRentalCost);
  });

  reqType = item.availableForRent ? 'rent' : 'buy';
  toggleRentFields();
}

let reqType = 'rent';
function setReqType(type, el) {
  reqType = type;
  document.querySelectorAll('.req-tab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  toggleRentFields();
}
function toggleRentFields() {
  const rf = document.getElementById('rent-fields');
  if (rf) rf.style.display = reqType === 'rent' ? 'block' : 'none';
}

function calcRentalCost() {
  const start = document.getElementById('req-start')?.value;
  const end = document.getElementById('req-end')?.value;
  const calcEl = document.getElementById('rental-calc');
  if (!calcEl || !currentItemData || !start || !end) return;
  const days = Math.ceil((new Date(end) - new Date(start)) / (1000*60*60*24));
  if (days < 1) { calcEl.textContent = 'End date must be after start date'; return; }
  let cost = days * currentItemData.pricePerDay;
  if (days >= 30 && currentItemData.pricePerMonth) cost = Math.ceil(days/30) * currentItemData.pricePerMonth;
  else if (days >= 7 && currentItemData.pricePerWeek) cost = Math.ceil(days/7) * currentItemData.pricePerWeek;
  calcEl.innerHTML = `<strong>${days} days</strong> → Total: <strong style="color:var(--primary)">₹${cost.toLocaleString()}</strong>`;
}

async function submitRequest(itemId) {
  if (!isLoggedIn()) { openModal('login'); return; }
  const errEl = document.getElementById('req-error');
  errEl.textContent = '';
  const data = { itemId, type: reqType, message: document.getElementById('req-message')?.value };
  if (reqType === 'rent') {
    data.startDate = document.getElementById('req-start')?.value;
    data.endDate = document.getElementById('req-end')?.value;
    if (!data.startDate || !data.endDate) { errEl.textContent = 'Please select rental dates'; return; }
  }
  try {
    await api.post('/rentals', data);
    showToast('Request sent successfully!', 'success');
    closeItemModal();
  } catch (err) {
    errEl.textContent = err.message;
  }
}

function closeItemModal() {
  document.getElementById('item-modal-overlay')?.classList.remove('open');
}

// Load items on init
loadItems(1);
