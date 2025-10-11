import { supabase } from '../lib/supabase.js';
import { showToast } from '../utils/helpers.js';
import { Navbar } from '../components/Navbar.js';

export function DepartmentsPage() {
  const page = document.createElement('div');
  page.className = 'page';

  let departments = [];

  page.innerHTML = `
    <div class="departments-container">
      <div class="dashboard-header">
        <h2>Departments Management</h2>
        <button class="btn btn-primary" id="add-department-btn">
          <span class="icon">+</span> Add Department
        </button>
      </div>

      <div class="departments-grid" id="departments-grid">
        <div class="loading-card">Loading departments...</div>
      </div>
    </div>

    <div id="department-modal" class="modal hidden">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h3 id="modal-title">Add Department</h3>
          <button class="modal-close">&times;</button>
        </div>
        <form id="department-form">
          <input type="hidden" id="department-id">
          <div class="form-group">
            <label for="department-name">Department Name *</label>
            <input type="text" id="department-name" required placeholder="e.g., Computer Science">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Department</button>
          </div>
        </form>
      </div>
    </div>
  `;

  page.prepend(Navbar());

  async function loadDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        equipments(count)
      `)
      .order('name');

    if (error) {
      showToast('Error loading departments: ' + error.message, 'danger');
      return;
    }

    departments = data || [];
    renderDepartments();
  }

  function renderDepartments() {
    const grid = page.querySelector('#departments-grid');

    if (departments.length === 0) {
      grid.innerHTML = '<div class="empty-state">No departments found. Add your first department!</div>';
      return;
    }

    grid.innerHTML = departments.map(dept => {
      const equipmentCount = dept.equipments?.[0]?.count || 0;
      return `
        <div class="department-card" data-id="${dept.id}">
          <div class="department-card-header">
            <h3>${dept.name}</h3>
            <div class="department-actions">
              <button class="btn-icon btn-edit" data-id="${dept.id}" title="Edit">✏️</button>
              <button class="btn-icon btn-delete" data-id="${dept.id}" title="Delete">🗑️</button>
            </div>
          </div>
          <div class="department-card-body">
            <div class="department-stat">
              <span class="stat-value">${equipmentCount}</span>
              <span class="stat-label">Equipment Items</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    grid.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteDepartment(btn.getAttribute('data-id')));
    });
  }

  const modal = page.querySelector('#department-modal');
  const form = page.querySelector('#department-form');

  page.querySelector('#add-department-btn').addEventListener('click', () => {
    form.reset();
    page.querySelector('#department-id').value = '';
    page.querySelector('#modal-title').textContent = 'Add Department';
    modal.classList.remove('hidden');
  });

  function openEditModal(id) {
    const department = departments.find(dept => dept.id === id);
    if (!department) return;

    page.querySelector('#department-id').value = department.id;
    page.querySelector('#department-name').value = department.name;
    page.querySelector('#modal-title').textContent = 'Edit Department';
    modal.classList.remove('hidden');
  }

  page.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const departmentData = {
      name: page.querySelector('#department-name').value
    };

    const departmentId = page.querySelector('#department-id').value;

    let result;
    if (departmentId) {
      result = await supabase
        .from('departments')
        .update(departmentData)
        .eq('id', departmentId);
    } else {
      result = await supabase
        .from('departments')
        .insert([departmentData]);
    }

    if (result.error) {
      if (result.error.code === '23505') {
        showToast('Department already exists', 'warning');
      } else {
        showToast('Error saving department: ' + result.error.message, 'danger');
      }
      return;
    }

    showToast(`Department ${departmentId ? 'updated' : 'added'} successfully`, 'success');
    modal.classList.add('hidden');
    await loadDepartments();
  });

  async function deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department? Equipment associated with this department will not be deleted.')) return;

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Error deleting department: ' + error.message, 'danger');
      return;
    }

    showToast('Department deleted successfully', 'success');
    await loadDepartments();
  }

  loadDepartments();

  return page;
}
