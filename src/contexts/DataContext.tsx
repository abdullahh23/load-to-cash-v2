import { createContext, useContext, type ReactNode } from 'react';
import { useLoads } from '../hooks/useLoads';
import { useSettings } from '../hooks/useSettings';

type LoadsData = ReturnType<typeof useLoads>;
type SettingsData = ReturnType<typeof useSettings>;

const LoadsContext = createContext<LoadsData | null>(null);
const SettingsContext = createContext<SettingsData | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const loadsData = useLoads();
  const settingsData = useSettings();
  return (
    <LoadsContext.Provider value={loadsData}>
      <SettingsContext.Provider value={settingsData}>{children}</SettingsContext.Provider>
    </LoadsContext.Provider>
  );
}

export function useAppLoads() {
  const ctx = useContext(LoadsContext);
  if (!ctx) throw new Error('useAppLoads must be used within DataProvider');
  return ctx;
}

export function useAppSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within DataProvider');
  return ctx;
}
