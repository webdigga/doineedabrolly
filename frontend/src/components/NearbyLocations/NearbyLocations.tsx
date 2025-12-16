import { useNearbyLocations } from '../../hooks/useNearbyLocations';
import { LocationLinks } from '../LocationLinks/LocationLinks';
import styles from './NearbyLocations.module.css';

interface NearbyLocationsProps {
  slug: string;
}

export function NearbyLocations({ slug }: NearbyLocationsProps) {
  const { locations, isLoading } = useNearbyLocations(slug);

  if (isLoading || locations.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <LocationLinks title="Nearby locations" locations={locations} showCounty />
    </div>
  );
}
