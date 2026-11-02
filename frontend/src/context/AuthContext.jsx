import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiCall } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already logged in
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await apiCall('/api/auth/user/', 'GET');
                setUser(response);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, expected_role = '') => {
        try {
            setError(null);
            const response = await apiCall('/api/auth/login/', 'POST', {
                email,
                password,
                expected_role,
            });

            localStorage.setItem('token', response.token);
            setUser(response.user);
            return { success: true };
        } catch (err) {
            setError(err.message || 'Login failed');
            return { success: false, error: err.message };
        }
    };

    const signup = async (first_name, last_name, email, password) => {
        try {
            setError(null);
            const response = await apiCall('/api/auth/signup/', 'POST', {
                first_name,
                last_name,
                email,
                password
            });

            localStorage.setItem('token', response.token);
            setUser(response.user);
            return { success: true };
        } catch (err) {
            setError(err.message || 'Signup failed');
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        try {
            await apiCall('/api/auth/logout/', 'POST');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
