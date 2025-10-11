import { supabase } from './supabase.js';

export const authState = {
  user: null,
  session: null,
  listeners: new Set()
};

export function subscribe(callback) {
  authState.listeners.add(callback);
  return () => authState.listeners.delete(callback);
}

function notify() {
  authState.listeners.forEach(callback => callback(authState));
}

export async function initAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    authState.session = session;
    authState.user = session?.user || null;
    notify();

    supabase.auth.onAuthStateChange((_event, session) => {
      authState.session = session;
      authState.user = session?.user || null;
      notify();
    });
  } catch (error) {
    console.log('Auth initialization failed, running in demo mode');
    authState.user = null;
    notify();
  }
}

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  
  // Update auth state immediately for demo mode
  authState.user = data.user;
  authState.session = data.session;
  notify();
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function isAuthenticated() {
  return !!authState.user;
}

export function getUser() {
  return authState.user;
}
