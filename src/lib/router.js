import { isAuthenticated } from './auth.js';

const routes = new Map();
const listeners = new Set();

export function register(path, component, requiresAuth = false) {
  routes.set(path, { component, requiresAuth });
}

const basePath = import.meta.env.BASE_URL || '/';

export function navigate(path) {
  const fullPath = basePath === '/' ? path : basePath.slice(0, -1) + path;
  window.history.pushState({}, '', fullPath);
  route();
}

export function route() {
  let path = window.location.pathname;
  if (basePath !== '/' && path.startsWith(basePath.slice(0, -1))) {
    path = path.slice(basePath.length - 1);
  }
  const routeConfig = routes.get(path) || routes.get('/404') || { component: () => '<h1>404 - Not Found</h1>', requiresAuth: false };

  if (routeConfig.requiresAuth && !isAuthenticated()) {
    const loginPath = basePath === '/' ? '/login' : basePath.slice(0, -1) + '/login';
    window.history.replaceState({}, '', loginPath);
    const loginRoute = routes.get('/login');
    if (loginRoute) {
      listeners.forEach(listener => listener(loginRoute.component));
    }
    return;
  }

  listeners.forEach(listener => listener(routeConfig.component));
}

export function onRoute(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

window.addEventListener('popstate', route);
window.addEventListener('load', route);
