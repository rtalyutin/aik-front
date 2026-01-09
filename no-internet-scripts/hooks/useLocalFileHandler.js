import { useCallback, useEffect, useMemo, useState } from 'react';
import { checkLocalFile } from '../utils/localFileUtils.js';
import { isLocalFeaturesEnabled } from '../utils/isLocalFeaturesEnabled.js';

/**
 * Хук для обработки локальных файлов (только когда включены локальные фичи)
 * @param {Object} selectedTrack - выбранный трек
 * @param {Object} videoRef - ref на video элемент
 * @param {Function} setIsVideoReady - функция для установки готовности видео
 * @returns {Object} - объект с selectedTrackWithLocalSrc и handleVideoError
 */
export function useLocalFileHandler(selectedTrack, videoRef, setIsVideoReady) {
  const [localFileMap, setLocalFileMap] = useState(new Map()); // URL -> локальный путь
  const [failedUrls, setFailedUrls] = useState(new Set()); // URL, которые не удалось загрузить

  const isLocalEnv = isLocalFeaturesEnabled();

  // Проверяем наличие локального файла для выбранного трека
  const selectedTrackWithLocalSrc = useMemo(() => {
    if (!selectedTrack) {
      return null;
    }

    if (!isLocalEnv || selectedTrack.sourceType !== 'media') {
      return selectedTrack;
    }

    const url = selectedTrack.src || selectedTrack.embedUrl || '';
    const localUrl = localFileMap.get(url);
    
    // Если нашли локальный файл, используем его
    if (localUrl) {
      return {
        ...selectedTrack,
        src: localUrl,
      };
    }

    return selectedTrack;
  }, [selectedTrack, localFileMap, isLocalEnv]);

  // Обработчик ошибок загрузки видео
  const handleVideoError = useCallback(async () => {
    if (!isLocalEnv || !selectedTrack || selectedTrack.sourceType !== 'media') {
      return;
    }

    const url = selectedTrack.src || selectedTrack.embedUrl || '';
    if (!url) {
      return;
    }

    // Если уже проверяли этот URL после ошибки, не повторяем
    if (failedUrls.has(url) || localFileMap.has(url)) {
      return;
    }

    // Помечаем URL как неудачный
    setFailedUrls((prev) => new Set(prev).add(url));

    // Пробуем найти локальный файл
    const localUrl = await checkLocalFile(selectedTrack, localFileMap, setLocalFileMap);
    
    if (localUrl) {
      // Если нашли локальный файл, обновляем src видео
      const element = videoRef.current;
      if (element) {
        setLocalFileMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(url, localUrl);
          return newMap;
        });
        element.src = localUrl;
        element.load(); // Перезагружаем видео с новым src
        setIsVideoReady(false); // Сбрасываем готовность, чтобы видео перезагрузилось
      }
    }
  }, [selectedTrack, localFileMap, failedUrls, videoRef, setIsVideoReady, isLocalEnv]);

  // Сбрасываем состояние ошибок при смене трека
  useEffect(() => {
    setFailedUrls(new Set());
  }, [selectedTrack?.id]);

  return {
    selectedTrackWithLocalSrc,
    handleVideoError,
  };
}
