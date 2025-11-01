import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const PlaybackContext = createContext(null);

export function PlaybackProvider({ children }) {
  const [track, setTrack] = useState(null);
  const [audioNode, setAudioNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyricsOffsetMs, setLyricsOffsetMs] = useState(0);
  const [telemetryEvents, setTelemetryEvents] = useState([]);
  const manualSeekRef = useRef(false);

  const audioRef = useCallback((node) => {
    setAudioNode(node ?? null);
  }, []);

  const recordEvent = useCallback((type, details = {}) => {
    setTelemetryEvents((prev) => [
      ...prev,
      {
        type,
        timestamp: Date.now(),
        ...details,
      },
    ]);
  }, []);

  const clampTime = useCallback(
    (value) => {
      if (!Number.isFinite(value) || value < 0) {
        return 0;
      }

      if (Number.isFinite(duration) && duration > 0) {
        return Math.min(value, duration);
      }

      return value;
    },
    [duration],
  );

  const play = useCallback(() => {
    if (!audioNode || !track?.src) {
      return Promise.resolve();
    }

    try {
      const result = audioNode.play();
      return result ?? Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  }, [audioNode, track]);

  const pause = useCallback(() => {
    if (!audioNode) {
      return;
    }

    audioNode.pause();
  }, [audioNode]);

  const seek = useCallback(
    (value) => {
      if (!audioNode) {
        return;
      }

      const nextTime = clampTime(value);
      manualSeekRef.current = true;
      audioNode.currentTime = nextTime;

      if (audioNode.paused) {
        setCurrentTime(nextTime);
      }
    },
    [audioNode, clampTime],
  );

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  useEffect(() => {
    if (!audioNode) {
      return undefined;
    }

    const handlePlay = () => {
      setIsPlaying(true);
      recordEvent('play', { position: audioNode.currentTime });
    };

    const handlePause = () => {
      setIsPlaying(false);
      recordEvent('pause', { position: audioNode.currentTime });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioNode.currentTime);
    };

    const handleLoadedMetadata = () => {
      const mediaDuration = Number.isFinite(audioNode.duration) ? audioNode.duration : 0;
      setDuration(mediaDuration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      recordEvent('end', { position: audioNode.duration || audioNode.currentTime });
    };

    const handleSeeked = () => {
      setCurrentTime(audioNode.currentTime);

      if (manualSeekRef.current) {
        recordEvent('seek', { position: audioNode.currentTime });
      }

      manualSeekRef.current = false;
    };

    audioNode.addEventListener('play', handlePlay);
    audioNode.addEventListener('pause', handlePause);
    audioNode.addEventListener('timeupdate', handleTimeUpdate);
    audioNode.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioNode.addEventListener('ended', handleEnded);
    audioNode.addEventListener('seeked', handleSeeked);

    if (Number.isFinite(audioNode.duration)) {
      setDuration(audioNode.duration);
    }

    return () => {
      audioNode.removeEventListener('play', handlePlay);
      audioNode.removeEventListener('pause', handlePause);
      audioNode.removeEventListener('timeupdate', handleTimeUpdate);
      audioNode.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioNode.removeEventListener('ended', handleEnded);
      audioNode.removeEventListener('seeked', handleSeeked);
    };
  }, [audioNode, recordEvent]);

  useEffect(() => {
    if (!audioNode) {
      return;
    }

    setTelemetryEvents([]);
    setCurrentTime(audioNode.currentTime || 0);
    setIsPlaying(!audioNode.paused);
    manualSeekRef.current = false;
  }, [audioNode, track?.src]);

  const progress = useMemo(() => {
    if (!Number.isFinite(duration) || duration === 0) {
      return 0;
    }

    return Math.min(1, Math.max(0, currentTime / duration));
  }, [currentTime, duration]);

  const value = useMemo(
    () => ({
      audioRef,
      currentTime,
      duration,
      isPlaying,
      lyricsOffsetMs,
      pause,
      play,
      progress,
      recordEvent,
      seek,
      setLyricsOffsetMs,
      setTrack,
      telemetryEvents,
      togglePlayback,
      track,
    }),
    [
      audioRef,
      currentTime,
      duration,
      isPlaying,
      lyricsOffsetMs,
      pause,
      play,
      progress,
      recordEvent,
      seek,
      setLyricsOffsetMs,
      setTrack,
      telemetryEvents,
      togglePlayback,
      track,
    ],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  const context = useContext(PlaybackContext);

  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }

  return context;
}
