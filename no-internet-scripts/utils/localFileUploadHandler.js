/**
 * Обработчик загрузки локальных файлов в dev режиме
 * Сохраняет файлы на локальный сервер в папку downloads
 */

/**
 * Сохраняет файлы на локальный сервер
 * @param {File[]} files - массив файлов для сохранения
 * @returns {Promise<void>}
 */
import { isLocalFeaturesEnabled } from './isLocalFeaturesEnabled.js';

export async function saveFilesToDownloads(files) {
  if (!isLocalFeaturesEnabled()) {
    return;
  }

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/download-api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        console.log(`✅ Файл сохранен в downloads: ${result.originalName}`);
      } else {
        console.warn(`⚠️ Не удалось сохранить файл ${file.name} на сервер`);
      }
    } catch (error) {
      console.warn(`⚠️ Ошибка при сохранении файла ${file.name}:`, error);
      // Продолжаем работу, даже если сохранение на сервер не удалось
    }
  }
}
