/*
 * Gig Driver Optimization Tool
 *
 * This script powers the interactive features of the Gig Driver web application.
 * It manages orders, expenses, shifts, settings and route optimization.
 * Data is stored in the browser's localStorage so that it persists across page reloads.
 *
 * To enable route optimization, obtain a Mapbox access token and enter it in the Settings section.
 */

// Helper functions for localStorage
function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Load settings (map token and alert threshold)
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  if (settings.mapToken) {
    document.getElementById('mapToken').value = settings.mapToken;
  }
  if (settings.alertThreshold) {
    document.getElementById('alertThreshold').value = settings.alertThreshold;
  }
}

function saveSettings() {
  const mapToken = document.getElementById('mapToken').value.trim();
  const alertThreshold = parseFloat(document.getElementById('alertThreshold').value);
  const settings = { mapToken, alertThreshold };
  localStorage.setItem('settings', JSON.stringify(settings));
  // Reload map if token provided
  if (mapToken) {
    initializeMap(mapToken);
  }
  // Update order highlighting
  refreshOrdersTable();
  alert('Settings saved');
}

// Initialize Mapbox map
let map;
function initializeMap(token) {
  mapboxgl.accessToken = token;
  if (!map) {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9
    });
  }
}

// Orders
let orders = loadData('orders');

function addOrder(event) {
  event.preventDefault();
  const platform = document.getElementById('platform').value;
  const pickup = document.getElementById('pickup').value.trim();
  const dropoff = document.getElementById('dropoff').value.trim();
  const pay = parseFloat(document.getElementById('pay').value);
  const miles = parseFloat(document.getElementById('miles').value);
  const minutes = parseFloat(document.getElementById('minutes').value);
  const notes = document.getElementById('notes').value.trim();
  const order = {
    id: Date.now(),
    platform,
    pickup,
    dropoff,
    pay,
    miles,
    minutes,
    notes,
    accepted: false
  };
  orders.push(order);
  saveData('orders', orders);
  document.getElementById('orderForm').reset();
  refreshOrdersTable();
  updateCharts();
}

function toggleAccepted(orderId) {
  orders = orders.map(order => {
    if (order.id === orderId) {
      order.accepted = !order.accepted;
    }
    return order;
  });
  saveData('orders', orders);
  refreshOrdersTable();
  // Enable or disable route button
  document.getElementById('optimizeRoute').disabled = !orders.some(o => o.accepted);
}

function deleteOrder(orderId) {
  orders = orders.filter(order => order.id !== orderId);
  saveData('orders', orders);
  refreshOrdersTable();
  updateCharts();
  // Disable route button if no accepted orders remain
  document.getElementById('optimizeRoute').disabled = !orders.some(o => o.accepted);
}

function refreshOrdersTable() {
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const threshold = settings.alertThreshold || 0;
  // Compute metrics and sort by pay per hour descending
  const computed = orders.map(order => {
    const payPerMile = order.miles > 0 ? order.pay / order.miles : 0;
    const payPerHour = order.minutes > 0 ? (order.pay / (order.minutes / 60)) : 0;
    return { ...order, payPerMile, payPerHour };
  });
  computed.sort((a, b) => b.payPerHour - a.payPerHour);
  computed.forEach(order => {
    const tr = document.createElement('tr');
    if (threshold && order.payPerMile >= threshold) {
      tr.style.backgroundColor = '#e6ffe6';
    }
    tr.innerHTML = `
      <td>${order.platform}</td>
      <td>${order.pickup}</td>
      <td>${order.dropoff}</td>
      <td>${order.pay.toFixed(2)}</td>
      <td>${order.miles.toFixed(1)}</td>
      <td>${order.minutes.toFixed(0)}</td>
      <td>${order.payPerMile.toFixed(2)}</td>
      <td>${order.payPerHour.toFixed(2)}</td>
      <td>${order.accepted ? 'Accepted' : 'Pending'}</td>
      <td>
        <button class="secondary" onclick="toggleAccepted(${order.id})">${order.accepted ? 'Unaccept' : 'Accept'}</button>
        <button class="danger" onclick="deleteOrder(${order.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Charts
let earningsChart;
let platformChart;
function updateCharts() {
  // Prepare data by date and platform
  const earningsByDate = {};
  const earningsByPlatform = {};
  orders.forEach(order => {
    // Group by today for simplicity – real implementation could allow custom dates
    const date = new Date().toISOString().slice(0, 10);
    earningsByDate[date] = (earningsByDate[date] || 0) + order.pay;
    earningsByPlatform[order.platform] = (earningsByPlatform[order.platform] || 0) + order.pay;
  });
  // Earnings chart (date)
  const ctx1 = document.getElementById('earningsChart').getContext('2d');
  if (earningsChart) earningsChart.destroy();
  earningsChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(earningsByDate),
      datasets: [{
        label: 'Earnings ($)',
        data: Object.values(earningsByDate),
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
  // Platform chart (pie)
  const ctx2 = document.getElementById('platformChart').getContext('2d');
  if (platformChart) platformChart.destroy();
  platformChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(earningsByPlatform),
      datasets: [{
        data: Object.values(earningsByPlatform),
        backgroundColor: ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#20c997'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true
    }
  });
}

// Expenses
let expenses = loadData('expenses');

function addExpense(event) {
  event.preventDefault();
  const date = document.getElementById('expenseDate').value;
  const category = document.getElementById('category').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const expense = { id: Date.now(), date, category, amount };
  expenses.push(expense);
  saveData('expenses', expenses);
  document.getElementById('expenseForm').reset();
  refreshExpensesTable();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveData('expenses', expenses);
  refreshExpensesTable();
}

function refreshExpensesTable() {
  const tbody = document.getElementById('expensesBody');
  tbody.innerHTML = '';
  let total = 0;
  expenses.forEach(exp => {
    total += exp.amount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.category}</td>
      <td>${exp.amount.toFixed(2)}</td>
      <td><button class="danger" onclick="deleteExpense(${exp.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('expenseSummary').textContent = `Total expenses: $${total.toFixed(2)}`;
}

// Shifts
let shifts = loadData('shifts');

function addShift(event) {
  event.preventDefault();
  const date = document.getElementById('shiftDate').value;
  const start = document.getElementById('startTime').value;
  const end = document.getElementById('endTime').value;
  const shift = { id: Date.now(), date, start, end };
  shifts.push(shift);
  saveData('shifts', shifts);
  document.getElementById('shiftForm').reset();
  refreshShiftsTable();
}

function deleteShift(id) {
  shifts = shifts.filter(s => s.id !== id);
  saveData('shifts', shifts);
  refreshShiftsTable();
}

function refreshShiftsTable() {
  const tbody = document.getElementById('shiftsBody');
  tbody.innerHTML = '';
  shifts.forEach(shift => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${shift.date}</td>
      <td>${shift.start}</td>
      <td>${shift.end}</td>
      <td><button class="danger" onclick="deleteShift(${shift.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Route Optimization
async function optimizeRoute() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  if (!settings.mapToken) {
    alert('Please provide a Mapbox token in Settings');
    return;
  }
  // Filter accepted orders
  const acceptedOrders = orders.filter(o => o.accepted);
  if (acceptedOrders.length === 0) {
    alert('No accepted orders to optimize');
    return;
  }
  document.getElementById('routeInfo').textContent = 'Calculating route...';
  try {
    // Geocode each pickup and dropoff address to coordinates
    const coords = [];
    for (const order of acceptedOrders) {
      const pickupCoord = await geocodeAddress(order.pickup, settings.mapToken);
      const dropoffCoord = await geocodeAddress(order.dropoff, settings.mapToken);
      coords.push(pickupCoord, dropoffCoord);
    }
    // Build coordinates string for directions API (polyline)
    const coordStr = coords.map(c => `${c[0]},${c[1]}`).join(';');
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${settings.mapToken}`;
    const response = await fetch(directionsUrl);
    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    const route = data.routes[0];
    const distanceMiles = route.distance / 1609.34;
    const durationMinutes = route.duration / 60;
    // Display route on map
    if (map) {
      // Remove existing source/layer if any
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
      map.fitBounds([
        route.geometry.coordinates.reduce((min, coord) => [Math.min(min[0], coord[0]), Math.min(min[1], coord[1])], [Infinity, Infinity]),
        route.geometry.coordinates.reduce((max, coord) => [Math.max(max[0], coord[0]), Math.max(max[1], coord[1])], [-Infinity, -Infinity])
      ], { padding: 40 });
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: route.geometry
        }
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#3b9ddd',
          'line-width': 6
        }
      });
    }
    document.getElementById('routeInfo').innerHTML = `<strong>Route distance:</strong> ${distanceMiles.toFixed(2)} miles<br/><strong>Estimated time:</strong> ${durationMinutes.toFixed(1)} minutes`;
  } catch (err) {
    console.error(err);
    document.getElementById('routeInfo').textContent = 'Error optimizing route: ' + err.message;
  }
}

async function geocodeAddress(address, token) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?limit=1&access_token=${token}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].center; // [lng, lat]
  } else {
    throw new Error('Geocoding failed for ' + address);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize map if token saved
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  if (settings.mapToken) {
    initializeMap(settings.mapToken);
  }
  // Load existing data
  loadSettings();
  refreshOrdersTable();
  refreshExpensesTable();
  refreshShiftsTable();
  updateCharts();
  // Forms
  document.getElementById('orderForm').addEventListener('submit', addOrder);
  document.getElementById('expenseForm').addEventListener('submit', addExpense);
  document.getElementById('shiftForm').addEventListener('submit', addShift);
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
  });
  document.getElementById('optimizeRoute').addEventListener('click', optimizeRoute);
  // Enable route button if there are accepted orders
  document.getElementById('optimizeRoute').disabled = !orders.some(o => o.accepted);
});
