import { initAuth, subscribe, isAuthenticated } from './lib/auth.js';
import { register, route, onRoute, navigate } from './lib/router.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { DepartmentsPage } from './pages/DepartmentsPage.js';
import { AuditPage } from './pages/AuditPage.js';

register('/', DashboardPage, true);
register('/login', LoginPage, false);
register('/departments', DepartmentsPage, true);
register('/audit', AuditPage, true);

const app = document.getElementById('app');

onRoute((component) => {
  app.innerHTML = '';
  app.appendChild(component());
});

subscribe((state) => {
  if (!state.user && window.location.pathname !== '/login') {
    navigate('/login');
  } else if (state.user && window.location.pathname === '/login') {
    navigate('/');
  }
});

(async () => {
  try {
    console.log('Initializing GECR STORE...');
    await initAuth();
    console.log('Auth initialized, user:', isAuthenticated());

    if (!isAuthenticated() && window.location.pathname !== '/login') {
      console.log('Redirecting to login');
      navigate('/login');
    } else if (isAuthenticated() && window.location.pathname === '/login') {
      console.log('Redirecting to dashboard');
      navigate('/');
    } else {
      console.log('Routing to current path');
      route();
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    // Fallback to login page
    navigate('/login');
  }
})();
