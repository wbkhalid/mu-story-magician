import { createContext, useState } from 'react';

export const BookContext = createContext(null);

export const BookContextProvider = ({ children }) => {
  const [showCard, setShowCard] = useState(false);
  const [processingErrorModal, setProcessingErrorModal] = useState(false);
  const [storyCreatingErrorMessage, setStoryCreatingErrorMessage] = useState('');
  const showCardHandler = (data) => {
    sessionStorage.setItem('loadingCard', data);
  };
  const handleProcessingError = (message) => {
    setProcessingErrorModal(true);
    setStoryCreatingErrorMessage(message || 'Error processing your request. Please try again');
  };
  const contextValue = {
    setShowCard,
    showCardHandler,
    processingErrorModal,
    setProcessingErrorModal,
    storyCreatingErrorMessage,
    setStoryCreatingErrorMessage,
    handleProcessingError,
  };

  return <BookContext.Provider value={contextValue}>{children}</BookContext.Provider>;
};

export default BookContextProvider;
