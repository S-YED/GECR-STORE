import { navigate } from '../lib/router.js';
import { signOut, getUser, subscribe } from '../lib/auth.js';
import { showToast } from '../utils/helpers.js';

export function Navbar() {
  const user = getUser();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  const component = document.createElement('nav');
  component.className = 'navbar';
  component.innerHTML = `
    <div class="navbar-container">
      <div class="navbar-brand">
        <h1>GECR Store</h1>
      </div>
      ${user ? `
        <div class="navbar-menu">
          <a href="/" class="nav-link" data-link="/">Dashboard</a>
          <a href="/departments" class="nav-link" data-link="/departments">Departments</a>
          <a href="/audit" class="nav-link" data-link="/audit">Audit Logs</a>
          <div class="navbar-user">
            <span class="user-name">${username}</span>
            <button class="btn btn-secondary btn-logout">Logout</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  component.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(e.target.getAttribute('data-link'));
    });
  });

  const logoutBtn = component.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut();
        showToast('Logged out successfully', 'success');
        navigate('/login');
      } catch (error) {
        showToast(error.message, 'danger');
      }
    });
  }

  return component;
}
