export interface User {
  id: number | string;
  username?: string;
  email?: string;
  phone?: string;
  role: string;
  role_id?:number;
  role_name?:string;
  role_permissions?: string[];
  node_path?: string;
  // Profile fields
  profile_pic?: string;
  full_name?: string;
  aadhaarNo?: string;
  dob?: string;
  gender?: string;
  panNo?: string;
  whatsappNo?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNo?: string;
  ifscCode?: string;
  branch?: string;
  referral_code?: string;
  referrer_id?: number;
  referrerName?: string;
  referrerContact?: string;
  nominee_name?: string;
  nominee_relationship?: string;
  nominee_age?: string;
  nominee_contact?: string;
  nominee_aadhaar?: string;
  businessLevel?: string;
  agreedToTerms?: boolean;
  kyc_status?: boolean;
  is_active?: boolean;
  is_kyc_completed?: boolean;
  transaction_pin_hash?: string;
  gstin?: string;
}

// export const fakeUsers: Record<string, User> = {
//   'admin@test.com': {
//     id: '1',
//     email: 'admin@test.com',
//     role: 'admin'
//   },
//   'super@test.com': {
//     id: '2',
//     email: 'super@test.com',
//     role: 'super admin'
//   },
//   'dist@test.com': {
//     id: '3',
//     email: 'dist@test.com',
//     role: 'DISTRIBUTOR'
//   },
//   'staff@test.com': {
//     id: '4',
//     email: 'staff@test.com',
//     role: 'staff'
//   }
// };

export const rolePermissions: Record<string, string[]> = {
  'super admin': [
    'dashboard',
    'policies',
    'policies:add',
    'policies:edit',
    'policies:delete',
    'policies:download',
    'my-profile',

    'analytics',
    'members',
    'e-users',
    'network-tree',
    'kyc-requests',
    'products',
    'products/add',
    'products/edit',
    'product-list',
    'add-product',
    'inventory',    
    'products/category',
    'pro-category',
    'attributes',
    'coupons',    
    'orders',
    'sample_request',
    'commissions',
    'commissions/add',
    // 'level-capping',
    // 'level-capping/add',
    // 'level-milestone',
    'rewards',
    'rewards/add',
    'p-transactions',
    'transactions',    
    'gst-tds',
    'reports',
    'settings',
    'mlm-plan',
    'tax-setting',
    'staff-header',
    'roles',
    'staff',
    'ranks',
    'notifications',
    'cms',
    
    'state-city',
    'team-member',
    
    'wallet',
    // 'withdrawals',
    'withdrawal-requests',
    'blogs',
    'blog',
    'blog-categories',
    'support',
    'support-tickets'
  ],
  'admin': [
    'dashboard', 
    'analytics', 
    'members', 
    'kyc-requests', 
    'products', 
    'orders', 
    'commissions', 
    'withdrawals', 
    'gst-tds', 
    'reports', 
    'plan-settings', 
    'ranks',
    'support-tickets'
  ],
  'distributor': [
    'dashboard',
    'policies',
    'policies:download',

    'referral',    
    'profile',
    'id-card',
    'welcome-letter',
    'wallet',
    'withdrawals',
    'network-tree',
    'members',
    'e-users',
    // 'products',
    // 'product-list',
    // 'inventory',
    'purchase',
    'shop',
    'shop/[slug]',
    'cart',
    'distributor-orders',
    
    'placed_order',
    'recieved_order',
    'commissions',    
    // 'level-milestone',
    'rewards',
    'simulator',
    'gst-tds',
    'ranks',
    'kyc',
    'reports',
    'checkout',
    'activation',
    'my-tickets',
    
  ]
};

export function hasPermission(userRole: string | null, permission: string): boolean {
  if (!userRole) return false;

  const roleKey = userRole.toLowerCase();
  const perms = rolePermissions[roleKey] || [];

  // console.log("DEBUG hasPermission - roleKey:", roleKey, "perms:", perms, "permission:", permission, "result:", perms.includes('*') || perms.includes(permission));

  return perms.includes('*') || perms.includes(permission);
}

