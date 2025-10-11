import { isAuthenticated } from './auth.js';

const routes = new Map();
const listeners = new Set();

export function register(path, component, requiresAuth = false) {
  routes.set(path, { component, requiresAuth });
}

export function navigate(path) {
  window.history.pushState({}, '', path);
  route();
}

export function route() {
  const path = window.location.pathname;
  const routeConfig = routes.get(path) || routes.get('/404') || { component: () => '<h1>404 - Not Found</h1>', requiresAuth: false };

  if (routeConfig.requiresAuth && !isAuthenticated()) {
    window.history.replaceState({}, '', '/login');
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
