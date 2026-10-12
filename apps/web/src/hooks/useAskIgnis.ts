import { useContext, useEffect } from 'react';
import { AskContext } from '../context/AskContextDefinition';
import type { AskPageContext, AskContextValue } from '../context/AskContextDefinition';

/**
 * Access the AskContext state and actions.
 */
export const useAskContext = (): AskContextValue => {
  const ctx = useContext(AskContext);
  if (!ctx) {
    throw new Error('useAskContext must be used within an AskProvider');
  }
  return ctx;
};

/**
 * Primary hook to interact with Ask IGNIS chat state and drawer controls.
 */
export const useAskIgnis = (): AskContextValue => {
  return useAskContext();
};

/**
 * Helper hook for pages to declare their active combustion context (e.g. /simulator, /experiments, stories).
 * Automatically updates AskContext and cleans up when the page unmounts or context changes.
 */
export const useSetAskContext = (context: AskPageContext | null) => {
  const { setPageContext } = useAskContext();

  useEffect(() => {
    setPageContext(context);
    return () => {
      setPageContext(null);
    };
  }, [context, setPageContext]);
};

export default useAskIgnis;
