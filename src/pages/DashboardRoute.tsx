import { useAppLoads, useAppSettings } from '../contexts/DataContext';
import { DashboardPage } from './DashboardPage';
import { generateId } from '../lib/calc';
import type { Load } from '../types';

export function DashboardRoute() {
  const { loads, addLoad, removeLoad, clearLoads } = useAppLoads();
  const { company, carrier } = useAppSettings();

  const handleLoadExtracted = async (load: Load) => {
    await addLoad(load, 'extract');
  };

  const handleManualLoad = async (data: Omit<Load, 'id'>) => {
    await addLoad({ ...data, id: generateId() }, 'manual');
  };

  return (
    <DashboardPage
      loads={loads}
      company={company}
      carrier={carrier}
      onLoadExtracted={handleLoadExtracted}
      onManualLoad={handleManualLoad}
      onRemoveLoad={id => removeLoad(id).catch(console.error)}
      onClearLoads={() => clearLoads().catch(console.error)}
    />
  );
}
