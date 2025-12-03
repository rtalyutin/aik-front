import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTrackSourceType } from './getTrackSourceType.js';

const ALLOWED_SOURCE_TYPES = ['media', 'youtube', 'vk', 'unknown'];

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
      const embedUrl = isNonEmptyString(item.embedUrl)
        ? item.embedUrl.trim()
        : isNonEmptyString(item.embed)
          ? item.embed.trim()
          : '';
      const preferredType = isNonEmptyString(item.type) ? item.type.trim().toLowerCase() : '';
      const sourceType = ALLOWED_SOURCE_TYPES.includes(preferredType)
        ? preferredType
        : getTrackSourceType(embedUrl || src);

      return { id, title, artist, src, captions, embedUrl, sourceType };
    })
    .filter((track) => isNonEmptyString(track.src) || isNonEmptyString(track.embedUrl));
};

const getPreferredTrackId = (currentId, nextTracks) => {
  if (currentId && (nextTracks ?? []).some((track) => track.id === currentId)) {
    return currentId;
  }

  return nextTracks.length > 0 ? nextTracks[0].id : '';
};

export const useKaraokeTracks = ({ source, staticTracks } = {}) => {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedStaticTracks = useMemo(() => normalizeTracks(staticTracks), [staticTracks]);
  const hasStaticTracks = normalizedStaticTracks.length > 0;

  const applyTracksState = useCallback((nextTracks) => {
    setTracks(nextTracks);
    setSelectedTrackId((currentId) => getPreferredTrackId(currentId, nextTracks));
  }, []);

  const selectTrack = useCallback(
    (trackId) => {
      const normalizedId = isNonEmptyString(trackId) ? String(trackId) : '';

      setSelectedTrackId((currentId) => {
        if (normalizedId === '') {
          return '';
        }

        if (currentId === normalizedId) {
          return currentId;
        }

        return (tracks ?? []).some((track) => track.id === normalizedId)
          ? normalizedId
          : currentId;
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

        applyTracksState(normalizedTracks);
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
    [source, applyTracksState],
  );

  useEffect(() => {
    if (hasStaticTracks) {
      setError('');
      setIsLoading(false);
      applyTracksState(normalizedStaticTracks);
      return undefined;
    }

    const controller = new AbortController();

    loadTracks(controller.signal);

    return () => {
      controller.abort();
    };
  }, [applyTracksState, hasStaticTracks, loadTracks, normalizedStaticTracks]);

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === selectedTrackId) ?? null;
  }, [tracks, selectedTrackId]);

  const reload = useCallback(() => {
    if (hasStaticTracks) {
      applyTracksState(normalizedStaticTracks);
      setError('');
      setIsLoading(false);
      return () => {};
    }

    const controller = new AbortController();
    loadTracks(controller.signal);
    return () => controller.abort();
  }, [applyTracksState, hasStaticTracks, loadTracks, normalizedStaticTracks]);

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
