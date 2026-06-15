import { useAppLoads, useAppSettings } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { DashboardPage } from './DashboardPage';
import { generateId } from '../lib/calc';
import type { Load } from '../types';

export function DashboardRoute() {
  const { loads, addLoad, removeLoad, clearLoads } = useAppLoads();
  const { company, carrier } = useAppSettings();
  const { profile, canUpload, refreshProfile } = useAuth();

  const handleLoadExtracted = async (load: Load) => {
    await addLoad(load, 'extract');
    await refreshProfile();
  };

  const handleManualLoad = async (data: Omit<Load, 'id'>) => {
    await addLoad({ ...data, id: generateId() }, 'manual');
  };

  return (
    <DashboardPage
      loads={loads}
      company={company}
      carrier={carrier}
      profile={profile}
      canUpload={canUpload}
      onLoadExtracted={handleLoadExtracted}
      onManualLoad={handleManualLoad}
      onRemoveLoad={id => removeLoad(id).catch(console.error)}
      onClearLoads={() => clearLoads().catch(console.error)}
    />
  );
}
