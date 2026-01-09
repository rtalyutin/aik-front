import React, { useState, useCallback } from 'react';
import karaokeConfig from '../../src/features/karaoke/config.js';
import { getTrackSourceType } from '../../src/features/karaoke/getTrackSourceType.js';

import { isLocalFeaturesEnabled } from '../utils/isLocalFeaturesEnabled.js';

const DownloadAllYoutubeVideos = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  if (!isLocalFeaturesEnabled()) {
    return null;
  }

  const handleDownloadAll = useCallback(async () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadStatus('Получаю список треков...');

    try {
      const allTracks = karaokeConfig.localTracks || [];
      
      // Фильтруем треки с прямыми ссылками на медиа файлы (не YouTube, не VK)
      const mediaTracks = allTracks.filter((track) => {
        const url = track.embedUrl || track.src || '';
        const sourceType = getTrackSourceType(url);
        // Скачиваем только прямые медиа файлы (http/https ссылки на mp4, mp3 и т.д.)
        return sourceType === 'media' && (url.startsWith('http://') || url.startsWith('https://'));
      });

      if (mediaTracks.length === 0) {
        setDownloadStatus('Треки с прямыми ссылками не найдены в конфиге');
        setIsDownloading(false);
        return;
      }

      setDownloadStatus(`Найдено ${mediaTracks.length} треков. Начинаю скачивание...`);

      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const failedTracks = [];

      for (let i = 0; i < mediaTracks.length; i++) {
        const track = mediaTracks[i];
        const url = track.embedUrl || track.src || '';
        const trackName = `${track.title || 'Без названия'}${track.artist ? ` — ${track.artist}` : ''}`;

        setDownloadStatus(`Скачиваю ${i + 1}/${mediaTracks.length}: ${trackName}`);

        try {
          if (!url || !url.trim()) {
            throw new Error('URL не указан');
          }

          console.log(`📥 Скачиваю трек "${trackName}":`, url);

          // Определяем расширение файла из URL
          const urlObj = new URL(url);
          const urlPath = urlObj.pathname;
          const urlExtension = urlPath.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || 'mp4';
          
          // Используем ID трека для надежного сопоставления
          // Если ID нет, используем хеш URL
          let fileName;
          if (track.id) {
            // Используем ID трека как основу имени файла
            // Заменяем все не-ASCII символы и спецсимволы на подчеркивания
            const safeId = track.id
              .replace(/[^a-z0-9_-]/gi, '_') // Заменяем все не-буквы/цифры на _
              .replace(/_+/g, '_') // Убираем множественные подчеркивания
              .replace(/^_|_$/g, '') // Убираем подчеркивания в начале и конце
              .substring(0, 100);
            fileName = `${safeId}.${urlExtension}`;
          } else {
            // Если ID нет, создаем хеш из URL
            const urlHash = btoa(url).replace(/[^a-z0-9]/gi, '_').substring(0, 50);
            fileName = `${urlHash}.${urlExtension}`;
          }

          // Отправляем запрос на сервер для скачивания и сохранения
          const downloadResponse = await fetch('/download-api/download-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: url,
              filename: fileName,
            }),
          });

          if (!downloadResponse.ok) {
            const errorData = await downloadResponse.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `HTTP ${downloadResponse.status}`);
          }

          const result = await downloadResponse.json();
          
          if (result.skipped) {
            skippedCount++;
            console.log(`⏭️  Пропущен (уже существует): ${trackName} -> ${result.filepath}`);
          } else {
            successCount++;
            console.log(`✅ Скачан и сохранен: ${trackName} -> ${result.filepath}`);
          }
          
          // Небольшая задержка между скачиваниями
          if (i < mediaTracks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          errorCount++;
          const errorMessage = error?.message || String(error) || 'Неизвестная ошибка';
          failedTracks.push({
            name: trackName,
            url: url,
            error: errorMessage,
          });
          console.error(`❌ Ошибка при скачивании ${trackName}:`, error);
        }
      }

      let finalStatus = `Готово! Скачано: ${successCount}, Пропущено (уже есть): ${skippedCount}, Ошибок: ${errorCount} из ${mediaTracks.length} треков`;
      
      if (successCount > 0 || skippedCount > 0) {
        finalStatus += `\n\nФайлы сохранены в папку no-internet-scripts/downloads/`;
      }
      
      if (failedTracks.length > 0) {
        finalStatus += '\n\nНе скачались:';
        failedTracks.forEach((failed) => {
          finalStatus += `\n• ${failed.name}: ${failed.error}`;
        });
      }

      setDownloadStatus(finalStatus);
    } catch (error) {
      setDownloadStatus(`Ошибка: ${error.message}`);
      console.error('Ошибка при скачивании всех треков:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading]);

  return (
    <div className="karaoke-page__local-controls">
      <label className="karaoke-page__local-label">
        Скачать все треки с прямыми ссылками из конфига в папку Downloads
      </label>
      <button
        type="button"
        onClick={handleDownloadAll}
        disabled={isDownloading}
        style={{
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: isDownloading ? '#cc0000' : '#ff0000',
          color: '#ffffff',
          font: 'inherit',
          fontWeight: 600,
          cursor: isDownloading ? 'not-allowed' : 'pointer',
          opacity: isDownloading ? 0.7 : 1,
          transition: 'opacity 0.2s ease, background 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isDownloading) {
            e.currentTarget.style.background = '#cc0000';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDownloading) {
            e.currentTarget.style.background = '#ff0000';
          }
        }}
      >
        {isDownloading ? 'Скачиваю...' : 'Скачать'}
      </button>
      {downloadStatus && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
          }}
        >
          {downloadStatus}
        </div>
      )}
    </div>
  );
};

export default DownloadAllYoutubeVideos;
