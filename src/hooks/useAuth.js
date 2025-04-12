import {useContext} from 'react';
import {useAuth as useAuthContext} from '../context/AuthContext';

/**
 * Custom Hook to quickly get `user`, `loading`, and `logout` from AuthContext
 */
export const useAuth = () => {
    const { user, loading, logout } = useAuthContext();
    return { user, loading, logout };
};
  