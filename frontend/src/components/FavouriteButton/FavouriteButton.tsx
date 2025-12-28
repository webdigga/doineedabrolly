import { useFavourites, type FavouriteLocation } from '../../hooks/useFavourites';
import styles from './FavouriteButton.module.css';

interface FavouriteButtonProps {
  location: FavouriteLocation;
}

export function FavouriteButton({ location }: FavouriteButtonProps) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const isCurrentlyFavourite = isFavourite(location.slug, location.countySlug);

  const handleClick = () => {
    toggleFavourite(location);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.button} ${isCurrentlyFavourite ? styles.active : ''}`}
      aria-label={isCurrentlyFavourite ? `Remove ${location.name} from favourites` : `Add ${location.name} to favourites`}
      aria-pressed={isCurrentlyFavourite}
      title={isCurrentlyFavourite ? 'Remove from favourites' : 'Add to favourites'}
    >
      <span className={styles.star} aria-hidden="true">
        {isCurrentlyFavourite ? '\u2605' : '\u2606'}
      </span>
    </button>
  );
}
