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
  const { data: { session } } = await supabase.auth.getSession();
  authState.session = session;
  authState.user = session?.user || null;
  notify();

  supabase.auth.onAuthStateChange((_event, session) => {
    (async () => {
      authState.session = session;
      authState.user = session?.user || null;
      notify();
    })();
  });
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
