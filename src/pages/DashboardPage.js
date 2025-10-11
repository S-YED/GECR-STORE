import { supabase } from '../lib/supabase.js';
import { navigate } from '../lib/router.js';
import { formatDate, formatCurrency, showToast, exportToCSV, debounce } from '../utils/helpers.js';
import { Navbar } from '../components/Navbar.js';

export function DashboardPage() {
  const page = document.createElement('div');
  page.className = 'page';

  let equipments = [];
  let departments = [];
  let filteredEquipments = [];

  page.innerHTML = `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Equipment Inventory</h2>
        <div class="dashboard-actions">
          <button class="btn btn-secondary" id="export-btn">
            <span class="icon">📊</span> Export CSV
          </button>
          <button class="btn btn-primary" id="add-equipment-btn">
            <span class="icon">+</span> Add Equipment
          </button>
        </div>
      </div>

      <div class="search-filter-section">
        <div class="search-box">
          <input type="text" id="search-input" placeholder="Search by order number, name, or supplier..." class="search-input">
        </div>
        <div class="filter-group">
          <select id="department-filter" class="filter-select">
            <option value="">All Departments</option>
          </select>
          <select id="condition-filter" class="filter-select">
            <option value="">All Conditions</option>
            <option value="Serviceable">Serviceable</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Equipment</div>
          <div class="stat-value" id="total-equipment">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Value</div>
          <div class="stat-value" id="total-value">₹0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Departments</div>
          <div class="stat-value" id="total-departments">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Quantity</div>
          <div class="stat-value" id="total-quantity">0</div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Equipment Name</th>
              <th>Purchase Date</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Condition</th>
              <th>Department</th>
              <th>Room</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="equipment-tbody">
            <tr>
              <td colspan="10" class="loading-cell">Loading equipment...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="equipment-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modal-title">Add Equipment</h3>
          <button class="modal-close">&times;</button>
        </div>
        <form id="equipment-form">
          <input type="hidden" id="equipment-id">
          <div class="form-row">
            <div class="form-group">
              <label for="order-no">Order Number *</label>
              <input type="text" id="order-no" required>
            </div>
            <div class="form-group">
              <label for="equipment-name">Equipment Name *</label>
              <input type="text" id="equipment-name" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="purchase-date">Purchase Date</label>
              <input type="date" id="purchase-date">
            </div>
            <div class="form-group">
              <label for="supplier">Supplier</label>
              <input type="text" id="supplier">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="amount">Amount</label>
              <input type="number" id="amount" min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="condition">Condition *</label>
              <select id="condition" required>
                <option value="Serviceable">Serviceable</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="department">Department</label>
              <select id="department">
                <option value="">Select Department</option>
              </select>
            </div>
            <div class="form-group">
              <label for="room-name">Room Name</label>
              <input type="text" id="room-name">
            </div>
          </div>
          <div class="form-group">
            <label for="quantity">Quantity *</label>
            <input type="number" id="quantity" min="1" value="1" required>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Equipment</button>
          </div>
        </form>
      </div>
    </div>
  `;

  page.prepend(Navbar());

  async function loadDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading departments:', error);
      return;
    }

    departments = data || [];

    const departmentFilter = page.querySelector('#department-filter');
    const departmentSelect = page.querySelector('#department');

    departments.forEach(dept => {
      const option1 = document.createElement('option');
      option1.value = dept.id;
      option1.textContent = dept.name;
      departmentFilter.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = dept.id;
      option2.textContent = dept.name;
      departmentSelect.appendChild(option2);
    });
  }

  async function loadEquipments() {
    const { data, error } = await supabase
      .from('equipments')
      .select(`
        *,
        departments(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Error loading equipment: ' + error.message, 'danger');
      return;
    }

    equipments = data || [];
    filteredEquipments = equipments;
    renderEquipments();
    updateStats();
  }

  function applyFilters() {
    const searchTerm = page.querySelector('#search-input').value.toLowerCase();
    const deptFilter = page.querySelector('#department-filter').value;
    const condFilter = page.querySelector('#condition-filter').value;

    filteredEquipments = equipments.filter(eq => {
      const matchesSearch = !searchTerm ||
        eq.order_no.toLowerCase().includes(searchTerm) ||
        eq.name.toLowerCase().includes(searchTerm) ||
        (eq.supplier && eq.supplier.toLowerCase().includes(searchTerm));

      const matchesDept = !deptFilter || eq.department_id === deptFilter;
      const matchesCond = !condFilter || eq.condition === condFilter;

      return matchesSearch && matchesDept && matchesCond;
    });

    renderEquipments();
    updateStats();
  }

  function renderEquipments() {
    const tbody = page.querySelector('#equipment-tbody');

    if (filteredEquipments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty-cell">No equipment found</td></tr>';
      return;
    }

    tbody.innerHTML = filteredEquipments.map(eq => `
      <tr data-id="${eq.id}">
        <td>${eq.order_no}</td>
        <td>${eq.name}</td>
        <td>${formatDate(eq.purchase_date)}</td>
        <td>${eq.supplier || '-'}</td>
        <td>${formatCurrency(eq.amount)}</td>
        <td><span class="badge badge-${eq.condition === 'Serviceable' ? 'success' : eq.condition === 'Under Repair' ? 'warning' : 'danger'}">${eq.condition}</span></td>
        <td>${eq.departments?.name || '-'}</td>
        <td>${eq.room_name || '-'}</td>
        <td>${eq.quantity}</td>
        <td class="action-cell">
          <button class="btn-icon btn-edit" data-id="${eq.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${eq.id}" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteEquipment(btn.getAttribute('data-id')));
    });
  }

  function updateStats() {
    page.querySelector('#total-equipment').textContent = filteredEquipments.length;
    page.querySelector('#total-departments').textContent = departments.length;

    const totalValue = filteredEquipments.reduce((sum, eq) => sum + (parseFloat(eq.amount) || 0), 0);
    page.querySelector('#total-value').textContent = formatCurrency(totalValue);

    const totalQty = filteredEquipments.reduce((sum, eq) => sum + (parseInt(eq.quantity) || 0), 0);
    page.querySelector('#total-quantity').textContent = totalQty;
  }

  const modal = page.querySelector('#equipment-modal');
  const form = page.querySelector('#equipment-form');

  page.querySelector('#add-equipment-btn').addEventListener('click', () => {
    form.reset();
    page.querySelector('#equipment-id').value = '';
    page.querySelector('#modal-title').textContent = 'Add Equipment';
    modal.classList.remove('hidden');
  });

  function openEditModal(id) {
    const equipment = equipments.find(eq => eq.id === id);
    if (!equipment) return;

    page.querySelector('#equipment-id').value = equipment.id;
    page.querySelector('#order-no').value = equipment.order_no;
    page.querySelector('#equipment-name').value = equipment.name;
    page.querySelector('#purchase-date').value = equipment.purchase_date || '';
    page.querySelector('#supplier').value = equipment.supplier || '';
    page.querySelector('#amount').value = equipment.amount || '';
    page.querySelector('#condition').value = equipment.condition;
    page.querySelector('#department').value = equipment.department_id || '';
    page.querySelector('#room-name').value = equipment.room_name || '';
    page.querySelector('#quantity').value = equipment.quantity;
    page.querySelector('#modal-title').textContent = 'Edit Equipment';
    modal.classList.remove('hidden');
  }

  page.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const equipmentData = {
      order_no: page.querySelector('#order-no').value,
      name: page.querySelector('#equipment-name').value,
      purchase_date: page.querySelector('#purchase-date').value || null,
      supplier: page.querySelector('#supplier').value || null,
      amount: parseFloat(page.querySelector('#amount').value) || 0,
      condition: page.querySelector('#condition').value,
      department_id: page.querySelector('#department').value || null,
      room_name: page.querySelector('#room-name').value || null,
      quantity: parseInt(page.querySelector('#quantity').value)
    };

    const equipmentId = page.querySelector('#equipment-id').value;

    let result;
    if (equipmentId) {
      result = await supabase
        .from('equipments')
        .update(equipmentData)
        .eq('id', equipmentId);
    } else {
      result = await supabase
        .from('equipments')
        .insert([equipmentData]);
    }

    if (result.error) {
      showToast('Error saving equipment: ' + result.error.message, 'danger');
      return;
    }

    showToast(`Equipment ${equipmentId ? 'updated' : 'added'} successfully`, 'success');
    modal.classList.add('hidden');
    await loadEquipments();
  });

  async function deleteEquipment(id) {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Error deleting equipment: ' + error.message, 'danger');
      return;
    }

    showToast('Equipment deleted successfully', 'success');
    await loadEquipments();
  }

  page.querySelector('#export-btn').addEventListener('click', () => {
    const exportData = filteredEquipments.map(eq => ({
      'Order No': eq.order_no,
      'Equipment Name': eq.name,
      'Purchase Date': formatDate(eq.purchase_date),
      'Supplier': eq.supplier || '',
      'Amount': eq.amount || 0,
      'Condition': eq.condition,
      'Department': eq.departments?.name || '',
      'Room': eq.room_name || '',
      'Quantity': eq.quantity
    }));
    exportToCSV(exportData, `equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`);
  });

  const debouncedFilter = debounce(applyFilters, 300);
  page.querySelector('#search-input').addEventListener('input', debouncedFilter);
  page.querySelector('#department-filter').addEventListener('change', applyFilters);
  page.querySelector('#condition-filter').addEventListener('change', applyFilters);

  (async () => {
    await loadDepartments();
    await loadEquipments();
  })();

  return page;
}
