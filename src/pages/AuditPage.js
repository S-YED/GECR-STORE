import { supabase } from '../lib/supabase.js';
import { formatDate, showToast, exportToCSV } from '../utils/helpers.js';
import { Navbar } from '../components/Navbar.js';

export function AuditPage() {
  const page = document.createElement('div');
  page.className = 'page';

  let auditLogs = [];

  page.innerHTML = `
    <div class="audit-container">
      <div class="dashboard-header">
        <h2>Audit Logs</h2>
        <button class="btn btn-secondary" id="export-audit-btn">
          <span class="icon">📊</span> Export Audit Logs
        </button>
      </div>

      <div class="filter-section">
        <select id="action-filter" class="filter-select">
          <option value="">All Actions</option>
          <option value="INSERT">Insert</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Order No</th>
              <th>Action</th>
              <th>Details</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody id="audit-tbody">
            <tr>
              <td colspan="5" class="loading-cell">Loading audit logs...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="audit-detail-modal" class="modal hidden">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Audit Log Details</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div id="audit-detail-content"></div>
        </div>
      </div>
    </div>
  `;

  page.prepend(Navbar());

  async function loadAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('performed_at', { ascending: false });

    if (error) {
      showToast('Error loading audit logs: ' + error.message, 'danger');
      return;
    }

    auditLogs = data || [];
    renderAuditLogs(auditLogs);
  }

  function renderAuditLogs(logs) {
    const tbody = page.querySelector('#audit-tbody');

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No audit logs found</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(log => {
      const actionClass = log.action === 'INSERT' ? 'success' : log.action === 'UPDATE' ? 'warning' : 'danger';
      const performedAt = new Date(log.performed_at);
      const formattedDate = performedAt.toLocaleDateString('en-GB');
      const formattedTime = performedAt.toLocaleTimeString('en-GB');

      return `
        <tr data-id="${log.id}">
          <td>${formattedDate} ${formattedTime}</td>
          <td>${log.order_no || 'N/A'}</td>
          <td><span class="badge badge-${actionClass}">${log.action}</span></td>
          <td><button class="btn-link" data-log-id="${log.id}">View Details</button></td>
          <td>${log.performed_by ? 'User' : 'System'}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-log-id');
        showAuditDetails(logId);
      });
    });
  }

  function showAuditDetails(logId) {
    const log = auditLogs.find(l => l.id === logId);
    if (!log) return;

    const modal = page.querySelector('#audit-detail-modal');
    const content = page.querySelector('#audit-detail-content');

    let detailHTML = `
      <div class="audit-detail">
        <div class="detail-section">
          <h4>Basic Information</h4>
          <p><strong>Action:</strong> ${log.action}</p>
          <p><strong>Order Number:</strong> ${log.order_no || 'N/A'}</p>
          <p><strong>Performed At:</strong> ${new Date(log.performed_at).toLocaleString()}</p>
        </div>
    `;

    if (log.action === 'UPDATE' && log.old_data && log.new_data) {
      detailHTML += `
        <div class="detail-section">
          <h4>Changes Made</h4>
          <div class="changes-grid">
            ${generateChangeComparison(log.old_data, log.new_data)}
          </div>
        </div>
      `;
    } else if (log.action === 'INSERT' && log.new_data) {
      detailHTML += `
        <div class="detail-section">
          <h4>New Record Data</h4>
          <pre>${JSON.stringify(log.new_data, null, 2)}</pre>
        </div>
      `;
    } else if (log.action === 'DELETE' && log.old_data) {
      detailHTML += `
        <div class="detail-section">
          <h4>Deleted Record Data</h4>
          <pre>${JSON.stringify(log.old_data, null, 2)}</pre>
        </div>
      `;
    }

    detailHTML += '</div>';
    content.innerHTML = detailHTML;
    modal.classList.remove('hidden');
  }

  function generateChangeComparison(oldData, newData) {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (key === 'id' || key === 'created_at' || key === 'created_by') continue;

      const oldValue = oldData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push(`
          <div class="change-item">
            <strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong>
            <div class="change-values">
              <span class="old-value">${oldValue || 'N/A'}</span>
              <span class="arrow">→</span>
              <span class="new-value">${newValue || 'N/A'}</span>
            </div>
          </div>
        `);
      }
    }

    return changes.length > 0 ? changes.join('') : '<p>No changes detected</p>';
  }

  page.querySelector('.modal-close').addEventListener('click', () => {
    page.querySelector('#audit-detail-modal').classList.add('hidden');
  });

  page.querySelector('#action-filter').addEventListener('change', (e) => {
    const filterValue = e.target.value;
    const filtered = filterValue
      ? auditLogs.filter(log => log.action === filterValue)
      : auditLogs;
    renderAuditLogs(filtered);
  });

  page.querySelector('#export-audit-btn').addEventListener('click', () => {
    const exportData = auditLogs.map(log => ({
      'Date': formatDate(log.performed_at),
      'Time': new Date(log.performed_at).toLocaleTimeString('en-GB'),
      'Order No': log.order_no || 'N/A',
      'Action': log.action,
      'Performed By': log.performed_by || 'System'
    }));
    exportToCSV(exportData, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
  });

  loadAuditLogs();

  return page;
}
