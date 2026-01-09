/**
 * Утилиты для работы с локальными файлами в downloads
 */
import { isLocalFeaturesEnabled } from './isLocalFeaturesEnabled.js';

/**
 * Проверяет наличие локального файла для трека
 * @param {Object} track - объект трека с полями id, title, artist, src, embedUrl
 * @param {Map} localFileMap - маппинг URL -> локальный путь
 * @param {Function} setLocalFileMap - функция для обновления маппинга
 * @returns {Promise<string|null>} - локальный URL файла или null
 */
export async function checkLocalFile(track, localFileMap, setLocalFileMap) {
  // Если локальные фичи не включены, не проверяем локальные файлы
  if (!isLocalFeaturesEnabled()) {
    return null;
  }

  if (!track || track.sourceType !== 'media') {
    return null;
  }

  const url = track.src || track.embedUrl || '';
  if (!url) {
    return null;
  }

  // Если уже проверяли этот URL, возвращаем результат
  if (localFileMap.has(url)) {
    const cached = localFileMap.get(url);
    return cached || null;
  }

  try {
    // Извлекаем имя файла из URL
    let urlFilename = '';
    try {
      const urlObj = new URL(url);
      const urlPath = urlObj.pathname;
      urlFilename = urlPath.split('/').pop() || '';
      urlFilename = decodeURIComponent(urlFilename);
    } catch (urlError) {
      // Если не удалось распарсить URL, пробуем извлечь имя файла другим способом
      const match = url.match(/\/([^\/\?]+)(?:\?|$)/);
      if (match) {
        urlFilename = decodeURIComponent(match[1]);
      }
    }

    // Пробуем найти файл по имени из URL
    if (urlFilename) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const checkResponse = await fetch(`/download-api/check-file?filename=${encodeURIComponent(urlFilename)}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (checkResponse.ok) {
          const result = await checkResponse.json();
          if (result.exists && result.url) {
            const localUrl = result.url;
            setLocalFileMap((prev) => new Map(prev).set(url, localUrl));
            return localUrl;
          }
        }
      } catch (fetchError) {
        // Игнорируем ошибки сети
      }
    }

    // Если не нашли по имени из URL, пробуем найти по ID трека
    if (track.id) {
      try {
        const urlExtension = url.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || 'mp4';
        
        // Формируем имя файла на основе ID трека (точно так же, как при скачивании)
        const safeId = track.id
          .replace(/[^a-z0-9_-]/gi, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
          .substring(0, 100);
        const filenameById = `${safeId}.${urlExtension}`;
        
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 2000);
        
        const checkResponse2 = await fetch(`/download-api/check-file?filename=${encodeURIComponent(filenameById)}`, {
          signal: controller2.signal,
        });
        
        clearTimeout(timeoutId2);
        
        if (checkResponse2.ok) {
          const result2 = await checkResponse2.json();
          if (result2.exists && result2.url) {
            const localUrl = result2.url;
            setLocalFileMap((prev) => new Map(prev).set(url, localUrl));
            return localUrl;
          }
        }
      } catch (fetchError2) {
        // Игнорируем ошибки
      }
    }
    
    // Если не нашли по ID, пробуем поиск по части имени (fallback для старых файлов)
    if (track.title || track.artist) {
      const searchTerms = [];
      if (track.artist) {
        const artistClean = track.artist.replace(/[^a-z0-9]/gi, '');
        if (artistClean) {
          searchTerms.push(artistClean);
        }
      }
      if (track.title) {
        const titleClean = track.title.replace(/[^a-z0-9]/gi, '');
        if (titleClean) {
          searchTerms.push(titleClean);
        }
      }

      for (const searchTerm of searchTerms) {
        try {
          const controller3 = new AbortController();
          const timeoutId3 = setTimeout(() => controller3.abort(), 2000);
          
          const checkResponse3 = await fetch(`/download-api/check-file?search=${encodeURIComponent(searchTerm)}`, {
            signal: controller3.signal,
          });
          
          clearTimeout(timeoutId3);
          
          if (checkResponse3.ok) {
            const result3 = await checkResponse3.json();
            if (result3.exists && result3.url) {
              const localUrl = result3.url;
              setLocalFileMap((prev) => new Map(prev).set(url, localUrl));
              return localUrl;
            }
          }
        } catch (fetchError3) {
          continue;
        }
      }
    }

    // Файл не найден
    setLocalFileMap((prev) => new Map(prev).set(url, null));
    return null;
  } catch (error) {
    console.warn('Ошибка при проверке локального файла:', error);
    setLocalFileMap((prev) => new Map(prev).set(url, null));
    return null;
  }
}
