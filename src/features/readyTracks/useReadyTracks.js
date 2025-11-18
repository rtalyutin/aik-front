import { useCallback, useEffect, useState } from 'react';

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

const getReadyTracksEndpoint = () => {
  const endpointFromImportMeta = import.meta?.env?.VITE_READY_TRACKS_ENDPOINT;
  const endpointFromProcess =
    typeof process !== 'undefined' ? process.env?.VITE_READY_TRACKS_ENDPOINT : undefined;
  const endpoint = endpointFromImportMeta ?? endpointFromProcess ?? '';

  return isNonEmptyString(endpoint) ? endpoint.trim() : '';
};

export const useReadyTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTracks = useCallback(async (signal) => {
    const endpoint = getReadyTracksEndpoint();

    if (!isNonEmptyString(endpoint)) {
      setTracks([]);
      setError('Источник треков не задан');
      setIsLoading(false);
      return;
    }

    if (!signal?.aborted) {
      setIsLoading(true);
      setError('');
    }

    try {
      const response = await fetch(endpoint, { signal });

      if (!response.ok) {
        throw new Error(`Не удалось загрузить треки (код ${response.status})`);
      }

      const payload = await response.json();
      const normalizedTracks = normalizeTracks(payload);

      if (signal?.aborted) {
        return;
      }

      setTracks(normalizedTracks);
    } catch (fetchError) {
      if (fetchError?.name === 'AbortError' || signal?.aborted) {
        return;
      }

      setTracks([]);
      setError(fetchError?.message || 'Не удалось загрузить треки');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadTracks(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadTracks]);

  return {
    tracks,
    isLoading,
    error,
  };
};

export default useReadyTracks;
