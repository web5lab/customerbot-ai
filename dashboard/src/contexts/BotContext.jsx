import { createContext, useContext, useState, ReactNode } from 'react';

const BotContext = createContext(undefined);

export function BotProvider({ children }) {
  const [selectedBot, setSelectedBot] = useState(null);

  return (
    <BotContext.Provider value={{ selectedBot, setSelectedBot }}>
      {children}
    </BotContext.Provider>
  );
}

export function useBot() {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
}