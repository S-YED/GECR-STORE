import { navigate } from '../lib/router.js';
import { signIn, signUp } from '../lib/auth.js';
import { showToast } from '../utils/helpers.js';

export function LoginPage() {
  const page = document.createElement('div');
  page.className = 'auth-page';

  page.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>GECR Store</h1>
          <p>Inventory Management System</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Login</button>
          <button class="auth-tab" data-tab="signup">Sign Up</button>
        </div>

        <div class="auth-content">
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" required placeholder="Enter your password">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </form>

          <form class="auth-form hidden" id="signup-form">
            <div class="form-group">
              <label for="signup-username">Username</label>
              <input type="text" id="signup-username" required placeholder="Choose a username">
            </div>
            <div class="form-group">
              <label for="signup-email">Email</label>
              <input type="email" id="signup-email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="signup-password">Password</label>
              <input type="password" id="signup-password" required placeholder="Choose a password" minlength="6">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const tabs = page.querySelectorAll('.auth-tab');
  const loginForm = page.querySelector('#login-form');
  const signupForm = page.querySelector('#signup-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.getAttribute('data-tab');
      if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
      }
    });
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = page.querySelector('#login-email').value;
    const password = page.querySelector('#login-password').value;

    try {
      await signIn(email, password);
      showToast('Login successful', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = page.querySelector('#signup-username').value;
    const email = page.querySelector('#signup-email').value;
    const password = page.querySelector('#signup-password').value;

    try {
      await signUp(email, password, username);
      showToast('Account created successfully! Please login.', 'success');
      tabs[0].click();
      signupForm.reset();
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });

  return page;
}
