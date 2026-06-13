import { useAppSettings } from '../contexts/DataContext';
import { SettingsPage } from './SettingsPage';

export function SettingsRoute() {
  const { company, carrier, saveAll } = useAppSettings();

  return (
    <SettingsPage
      company={company}
      carrier={carrier}
      onSave={saveAll}
    />
  );
}
