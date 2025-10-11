import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

let supabase;

// Check if we have valid Supabase credentials or if running in demo mode
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'demo_mode' || supabaseAnonKey === 'demo_mode') {
  console.log('Running in demo mode - using mock data');
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ 
        data: { 
          user: { id: 'demo', email: 'demo@gecr.com' },
          session: { user: { id: 'demo', email: 'demo@gecr.com' } }
        }, 
        error: null 
      }),
      signUp: () => Promise.resolve({ 
        data: { 
          user: { id: 'demo', email: 'demo@gecr.com' },
          session: { user: { id: 'demo', email: 'demo@gecr.com' } }
        }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        setTimeout(() => callback('SIGNED_OUT', null), 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table) => ({
      select: () => ({
        order: () => Promise.resolve({ data: getDemoData(table), error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

function getDemoData(table) {
  if (table === 'departments') {
    return [
      { id: '1', name: 'Electronic and Communication' },
      { id: '2', name: 'Civil' },
      { id: '3', name: 'Computer Science' },
      { id: '4', name: 'Mechanical' }
    ];
  }
  if (table === 'equipments') {
    return [
      {
        id: '1',
        order_no: '10',
        name: 'Signal Generator',
        purchase_date: '2016-12-03',
        supplier: 'UNION INSTRUMENTS, BANGALORE',
        amount: 87343,
        condition: 'Serviceable',
        department_id: '1',
        room_name: 'Microprocessor Lab',
        quantity: 7,
        departments: { name: 'Electronic and Communication' }
      },
      {
        id: '2',
        order_no: 'VT/121',
        name: 'EXIDE 100AH Battery (Tubular Type) 12V',
        purchase_date: '2018-03-17',
        supplier: 'Vasundhara Technologies, Bangalore',
        amount: 89920,
        condition: 'Serviceable',
        department_id: '1',
        room_name: 'Power Electronics Lab',
        quantity: 5,
        departments: { name: 'Electronic and Communication' }
      }
    ];
  }
  if (table === 'audit_logs') {
    return [
      {
        id: '1',
        order_no: '10',
        action: 'INSERT',
        performed_at: new Date().toISOString(),
        new_data: { name: 'Signal Generator' }
      }
    ];
  }
  return [];
}
