import { useCallback, useEffect, useMemo, useState } from 'react';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeTracks = (tracksLike) => {
  if (!Array.isArray(tracksLike)) {
    return [];
  }

  return tracksLike
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const fallbackId = `track-${index + 1}`;
      const id = isNonEmptyString(item.id) ? String(item.id) : fallbackId;
      const title = isNonEmptyString(item.title) ? item.title.trim() : `Трек ${index + 1}`;
      const artist = isNonEmptyString(item.artist) ? item.artist.trim() : '';
      const src = isNonEmptyString(item.src) ? item.src.trim() : '';
      const captions = isNonEmptyString(item.captions) ? item.captions.trim() : '';

      return { id, title, artist, src, captions };
    })
    .filter((track) => isNonEmptyString(track.src));
};

export const useKaraokeTracks = ({ source } = {}) => {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectTrack = useCallback(
    (trackId) => {
      if (!isNonEmptyString(trackId)) {
        return;
      }

      setSelectedTrackId((currentId) => {
        if (currentId === trackId) {
          return currentId;
        }

        return (tracks ?? []).some((track) => track.id === trackId) ? trackId : currentId;
      });
    },
    [tracks],
  );

  const loadTracks = useCallback(
    async (signal) => {
      if (!isNonEmptyString(source)) {
        setTracks([]);
        setSelectedTrackId('');
        setError('Источник треков не задан');
        setIsLoading(false);
        return;
      }

      if (!signal?.aborted) {
        setIsLoading(true);
        setError('');
      }

      try {
        const response = await fetch(source, { signal });

        if (!response.ok) {
          throw new Error(`Не удалось загрузить треки (код ${response.status})`);
        }

        const payload = await response.json();
        const normalizedTracks = normalizeTracks(payload);

        if (signal?.aborted) {
          return;
        }

        setTracks(normalizedTracks);
        setSelectedTrackId((currentId) => {
          if (currentId && normalizedTracks.some((track) => track.id === currentId)) {
            return currentId;
          }

          return normalizedTracks.length > 0 ? normalizedTracks[0].id : '';
        });
      } catch (fetchError) {
        if (fetchError?.name === 'AbortError' || signal?.aborted) {
          return;
        }

        setTracks([]);
        setSelectedTrackId('');
        setError(fetchError?.message || 'Не удалось загрузить треки');
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [source],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadTracks(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadTracks]);

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === selectedTrackId) ?? null;
  }, [tracks, selectedTrackId]);

  const reload = useCallback(() => {
    const controller = new AbortController();
    loadTracks(controller.signal);
    return () => controller.abort();
  }, [loadTracks]);

  return {
    tracks,
    isLoading,
    error,
    selectedTrack,
    selectedTrackId,
    selectTrack,
    reload,
  };
};

export default useKaraokeTracks;
