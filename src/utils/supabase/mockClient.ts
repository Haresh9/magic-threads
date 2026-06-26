import { Product, products as initialProducts } from '../../data/products';

// Helper to get items from localStorage
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
};

// Helper to set items in localStorage
const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export interface UserSession {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export const mockSupabase = {
  auth: {
    // Register user
    signUp: async ({ email, password }: { email: string; password?: string }) => {
      const users = getLocalStorage<UserSession[]>('mock_db_users', []);
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { data: { user: null }, error: { message: 'User already exists' } };
      }

      // Default role is 'user', but auto-promote admin@navrang.com for easy testing
      const newUser: UserSession = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: email,
        role: email.toLowerCase() === 'admin@navrang.com' ? 'admin' : 'user'
      };

      const updatedUsers = [...users, newUser];
      setLocalStorage('mock_db_users', updatedUsers);
      
      // Auto sign-in
      setLocalStorage('mock_db_session', newUser);

      return { data: { user: newUser }, error: null };
    },

    // Sign in
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      const users = getLocalStorage<UserSession[]>('mock_db_users', []);
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        return { data: { user: null }, error: { message: 'Invalid credentials or user does not exist' } };
      }

      setLocalStorage('mock_db_session', matchedUser);
      return { data: { user: matchedUser }, error: null };
    },

    // Sign out
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_db_session');
      }
      return { error: null };
    },

    // Get current logged-in user
    getUser: async () => {
      const session = getLocalStorage<UserSession | null>('mock_db_session', null);
      if (!session) return { data: { user: null }, error: null };
      
      // Verify user still exists
      const users = getLocalStorage<UserSession[]>('mock_db_users', []);
      const matched = users.find(u => u.id === session.id);
      
      if (!matched) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock_db_session');
        }
        return { data: { user: null }, error: null };
      }
      
      return { data: { user: matched }, error: null };
    }
  },

  // Database Query Simulator
  from: (table: string) => {
    const activeSession = getLocalStorage<UserSession | null>('mock_db_session', null);

    return {
      select: (fields: string = '*') => {
        const queryBuilder: any = {
          _sortField: null,
          _sortAscending: true,

          single: async () => {
            if (table === 'profiles') {
              if (!activeSession) return { data: null, error: { message: 'No active session' } };
              return { data: activeSession, error: null };
            }
            return { data: null, error: { message: 'Not found' } };
          },
          
          eq: (field: string, value: any) => {
            return {
              single: async () => {
                if (table === 'profiles') {
                  const users = getLocalStorage<UserSession[]>('mock_db_users', []);
                  const matched = users.find(u => u[field as keyof UserSession] === value);
                  if (!matched) return { data: null, error: { message: 'User profile not found' } };
                  return { data: matched, error: null };
                }
                return { data: null, error: { message: 'Not found' } };
              },
              
              // Multi-row matches (like inquiry bags)
              async: async () => {
                if (table === 'inquiry_bag') {
                  const bags = getLocalStorage<any[]>('mock_db_inquiry_bags', []);
                  const filtered = bags.filter(item => item[field] === value);
                  
                  // Map to complete product details
                  const dbProducts = getLocalStorage<Product[]>('mock_db_products', initialProducts);
                  const matchedProducts = filtered.map(item => 
                    dbProducts.find(p => p.id === item.product_id)
                  ).filter(Boolean) as Product[];

                  // Apply Sorting
                  if (queryBuilder._sortField === 'created_at' && table === 'products') {
                    matchedProducts.sort((a, b) => {
                      const timeA = new Date(a.created_at || 0).getTime();
                      const timeB = new Date(b.created_at || 0).getTime();
                      return queryBuilder._sortAscending ? timeA - timeB : timeB - timeA;
                    });
                  }

                  return { data: matchedProducts, error: null };
                }
                return { data: [], error: null };
              }
            };
          },

          order: (field: string, options?: { ascending?: boolean }) => {
            queryBuilder._sortField = field;
            queryBuilder._sortAscending = options?.ascending !== false;
            return queryBuilder;
          },

          async: async () => {
            if (table === 'products') {
              const dbProducts = getLocalStorage<Product[]>('mock_db_products', initialProducts);
              // Ensure any new products in initialProducts are seeded/merged into localStorage
              let changed = false;
              const mergedProducts = [...dbProducts];
              initialProducts.forEach(initP => {
                if (!mergedProducts.some(p => p.id === initP.id)) {
                  mergedProducts.push(initP);
                  changed = true;
                }
              });

              let targetProducts = changed ? mergedProducts : dbProducts;

              // Apply Sorting
              if (queryBuilder._sortField === 'created_at') {
                targetProducts = [...targetProducts].sort((a, b) => {
                  const timeA = new Date(a.created_at || 0).getTime();
                  const timeB = new Date(b.created_at || 0).getTime();
                  return queryBuilder._sortAscending ? timeA - timeB : timeB - timeA;
                });
              }

              if (changed) {
                setLocalStorage('mock_db_products', targetProducts);
              }
              return { data: targetProducts, error: null };
            }
            if (table === 'profiles') {
              const users = getLocalStorage<UserSession[]>('mock_db_users', []);
              return { data: users, error: null };
            }
            return { data: [], error: null };
          }
        };
        return queryBuilder;
      },

      // Insert Row Simulator
      insert: (rows: any[]) => {
        return {
          async: async () => {
            if (table === 'products') {
              const dbProducts = getLocalStorage<Product[]>('mock_db_products', initialProducts);
              const newProducts = [...dbProducts];
              
              rows.forEach(row => {
                if (!newProducts.some(p => p.id === row.id)) {
                  newProducts.push(row);
                }
              });

              setLocalStorage('mock_db_products', newProducts);
              return { data: rows, error: null };
            }

            if (table === 'inquiry_bag') {
              if (!activeSession) return { data: null, error: { message: 'Must be logged in to sync bag' } };
              const bags = getLocalStorage<any[]>('mock_db_inquiry_bags', []);
              const newBags = [...bags];
              
              rows.forEach(row => {
                // Ensure unique items per user
                if (!newBags.some(b => b.user_id === row.user_id && b.product_id === row.product_id)) {
                  newBags.push(row);
                }
              });
              
              setLocalStorage('mock_db_inquiry_bags', newBags);
              return { data: rows, error: null };
            }

            return { data: null, error: { message: 'Invalid operation' } };
          }
        };
      },

      // Delete Row Simulator
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            return {
              eq: (field2: string, value2: any) => {
                return {
                  async: async () => {
                    if (table === 'inquiry_bag') {
                      const bags = getLocalStorage<any[]>('mock_db_inquiry_bags', []);
                      // delete where field == value AND field2 == value2
                      const filtered = bags.filter(b => !(b[field] === value && b[field2] === value2));
                      setLocalStorage('mock_db_inquiry_bags', filtered);
                      return { error: null };
                    }
                    return { error: { message: 'Invalid operation' } };
                  }
                };
              },

              async: async () => {
                if (table === 'inquiry_bag') {
                  const bags = getLocalStorage<any[]>('mock_db_inquiry_bags', []);
                  const filtered = bags.filter(b => b[field] !== value);
                  setLocalStorage('mock_db_inquiry_bags', filtered);
                  return { error: null };
                }
                if (table === 'products') {
                  const dbProducts = getLocalStorage<Product[]>('mock_db_products', initialProducts);
                  const filtered = dbProducts.filter(p => p[field as keyof Product] !== value);
                  setLocalStorage('mock_db_products', filtered);
                  return { error: null };
                }
                return { error: { message: 'Invalid operation' } };
              }
            };
          }
        };
      },

      // Update Row Simulator
      update: (fieldsToUpdate: any) => {
        return {
          eq: (field: string, value: any) => {
            return {
              async: async () => {
                if (table === 'profiles') {
                  const users = getLocalStorage<UserSession[]>('mock_db_users', []);
                  const updated = users.map(u => {
                    if (u[field as keyof UserSession] === value) {
                      return { ...u, ...fieldsToUpdate };
                    }
                    return u;
                  });
                  setLocalStorage('mock_db_users', updated);
                  
                  // Update current session if applicable
                  if (activeSession && activeSession[field as keyof UserSession] === value) {
                    setLocalStorage('mock_db_session', { ...activeSession, ...fieldsToUpdate });
                  }

                  return { error: null };
                }
                return { error: { message: 'Invalid operation' } };
              }
            };
          }
        };
      }
    };
  }
};
