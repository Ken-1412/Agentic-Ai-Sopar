import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = 'http://localhost:3001/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            // Sign up
            signup: async (email, password, name) => {
                set({ loading: true, error: null });
                try {
                    const res = await fetch(`${API_BASE}/auth/signup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, name })
                    });

                    const data = await res.json();

                    if (!data.success) {
                        throw new Error(data.error || 'Signup failed');
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                        error: null
                    });

                    return data;
                } catch (error) {
                    set({ loading: false, error: error.message });
                    throw error;
                }
            },

            // Sign in
            signin: async (email, password) => {
                set({ loading: false, error: null });
                try {
                    const res = await fetch(`${API_BASE}/auth/signin`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await res.json();

                    if (!data.success) {
                        throw new Error(data.error || 'Sign in failed');
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                        error: null
                    });

                    return data;
                } catch (error) {
                    set({ loading: false, error: error.message });
                    throw error;
                }
            },

            // Logout
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            // Fetch current user
            fetchUser: async () => {
                const token = get().token;
                if (!token) return;

                try {
                    const res = await fetch(`${API_BASE}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await res.json();

                    if (data.success) {
                        set({ user: data.user, isAuthenticated: true });
                    } else {
                        get().logout();
                    }
                } catch (error) {
                    console.error('Fetch user error:', error);
                    get().logout();
                }
            },

            // Update user preferences
            updatePreferences: async (preferences) => {
                const token = get().token;
                if (!token) throw new Error('Not authenticated');

                try {
                    const res = await fetch(`${API_BASE}/users/preferences`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(preferences)
                    });

                    const data = await res.json();

                    if (data.success) {
                        set({ user: data.user });
                        return data;
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    throw error;
                }
            },

            // Train model
            trainModel: async () => {
                const token = get().token;
                if (!token) throw new Error('Not authenticated');

                try {
                    const res = await fetch(`${API_BASE}/training/train`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await res.json();

                    if (data.success) {
                        // Refresh user to get updated modelTrained status
                        await get().fetchUser();
                        return data;
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    throw error;
                }
            },

            // Get recommendations
            getRecommendations: async () => {
                const token = get().token;
                if (!token) throw new Error('Not authenticated');

                try {
                    const res = await fetch(`${API_BASE}/users/recommendations`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await res.json();

                    if (data.success) {
                        return data.meals;
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    throw error;
                }
            }
        }),
        {
            name: 'sapor-auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;
