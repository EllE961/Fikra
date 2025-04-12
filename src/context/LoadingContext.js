// src/context/LoadingContext.js
import React, { createContext, useState, useContext } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';

// Create a context for loading state
const LoadingContext = createContext({
  isLoading: false,
  message: '',
  startLoading: () => {},
  stopLoading: () => {},
});

/**
 * Provider component for the loading state
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const startLoading = (loadingMessage = 'Loading...') => {
    setMessage(loadingMessage);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        message,
        startLoading,
        stopLoading,
      }}
    >
      {children}
      <LoadingOverlay visible={isLoading} message={message} />
    </LoadingContext.Provider>
  );
};

/**
 * Hook to use the loading context
 * @returns {Object} Loading context methods and state
 */
export const useLoading = () => useContext(LoadingContext); 