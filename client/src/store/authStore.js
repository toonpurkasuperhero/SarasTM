// client/src/store/authStore.js
import { create } from 'zustand';

// Mock Artisan (Priya Devi, Mithila, BR) and Mock Buyer definitions
const MOCK_ARTISAN = {
  id: '34a1841b-9fd6-4409-96e3-fb61c5915071',
  email: 'priyadevi@sarastm.in',
  name: 'Priya Devi',
  role: 'artisan',
  region: 'Bihar',
  phone: '9876543210',
  bank_details_mock: {
    account_number: '123456789012',
    ifsc_code: 'PYTM0123456',
    profile_photo_url: 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/artisans/34a1841b-9fd6-4409-96e3-fb61c5915071/profile.png'
  }
};

const MOCK_BUYER = {
  id: 'buyer-mock-id-456',
  email: 'buyer@sarastm.in',
  name: 'Global Collector',
  role: 'buyer'
};

const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  loading: true,

  initialize: async () => {
    // Restore session from localStorage for testing/mock flows
    const savedUser = localStorage.getItem('sarastm_user');
    const token = localStorage.getItem('sarastm_token');
    
    if (savedUser && token) {
      const userObj = JSON.parse(savedUser);
      set({ user: userObj, role: userObj.role, loading: false });
    } else {
      set({ user: null, role: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    // Mock Buyer sign-in
    const mockUser = { ...MOCK_BUYER, email: email || MOCK_BUYER.email };
    localStorage.setItem('sarastm_user', JSON.stringify(mockUser));
    localStorage.setItem('sarastm_token', 'mock-buyer-token');
    set({ user: mockUser, role: 'buyer' });
    return { user: mockUser };
  },

  signInArtisan: async (phone) => {
    // Mock Artisan sign-in
    const mockUser = { ...MOCK_ARTISAN, phone: phone || MOCK_ARTISAN.phone };
    localStorage.setItem('sarastm_user', JSON.stringify(mockUser));
    localStorage.setItem('sarastm_token', 'mock-artisan-token');
    set({ user: mockUser, role: 'artisan' });
    return { user: mockUser };
  },

  signUp: async (email, password, name) => {
    // Mock Signup (Registers as buyer)
    const mockUser = {
      id: `buyer-mock-${Date.now()}`,
      email,
      name: name || 'Vetted Collector',
      role: 'buyer'
    };
    localStorage.setItem('sarastm_user', JSON.stringify(mockUser));
    localStorage.setItem('sarastm_token', 'mock-buyer-token');
    set({ user: mockUser, role: 'buyer' });
    return { user: mockUser };
  },

  signOut: async () => {
    localStorage.removeItem('sarastm_user');
    localStorage.removeItem('sarastm_token');
    set({ user: null, role: null });
  },

  setRole: (role) => set({ role }),

  updateArtisanProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser || currentUser.role !== 'artisan') return;
    const updatedUser = {
      ...currentUser,
      name: updates.name || currentUser.name,
      phone: updates.phone || currentUser.phone,
      region: updates.region || currentUser.region,
      bank_details_mock: {
        ...currentUser.bank_details_mock,
        account_number: updates.accountNumber || currentUser.bank_details_mock.account_number,
        ifsc_code: updates.ifscCode || currentUser.bank_details_mock.ifsc_code,
        profile_photo_url: updates.profilePhotoUrl || currentUser.bank_details_mock.profile_photo_url,
      }
    };
    localStorage.setItem('sarastm_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  }
}));

export default useAuthStore;
