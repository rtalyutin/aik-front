import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Папка для сохранения скачанных файлов (на уровень выше от server/)
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

// Создаем папку downloads, если её нет
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOWNLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Используем оригинальное имя файла
    // Если файл с таким именем уже существует, он будет перезаписан
    const originalName = file.originalname || `upload-${Date.now()}`;
    cb(null, originalName);
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Принимаем только медиа файлы
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Только видео и аудио файлы разрешены'), false);
    }
  },
});

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Эндпоинт для скачивания и сохранения файла
app.post('/api/download-file', async (req, res) => {
  try {
    const { url, filename } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL обязателен',
        message: 'Необходимо указать URL файла в теле запроса',
      });
    }

    // Определяем имя файла
    const safeFilename = filename || path.basename(new URL(url).pathname) || 'download';
    const filepath = path.join(DOWNLOADS_DIR, safeFilename);
    const tempFilepath = path.join(DOWNLOADS_DIR, `.${safeFilename}.tmp`);

    // Проверяем, существует ли файл ДО скачивания
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      console.log(`⏭️  Файл уже существует, пропускаю: ${filepath} (${stats.size} байт)`);
      
      return res.json({
        success: true,
        filepath: filepath,
        filename: safeFilename,
        size: stats.size,
        skipped: true,
        message: 'Файл уже существует',
      });
    }

    // Удаляем временный файл, если он остался от предыдущей попытки
    if (fs.existsSync(tempFilepath)) {
      console.log(`🗑️  Удаляю неполный файл от предыдущей попытки: ${tempFilepath}`);
      fs.unlinkSync(tempFilepath);
    }

    console.log(`📥 Скачиваю файл: ${url}`);

    // Используем прокси для обхода CORS, если нужно
    let fetchUrl = url;
    if (url.includes('s3.twcstorage.ru')) {
      // Если это s3, используем прямой запрос (сервер не имеет CORS ограничений)
      fetchUrl = url;
    }

    let buffer;
    try {
      // Скачиваем файл
      const fileResponse = await fetch(fetchUrl, {
        method: 'GET',
      });

      if (!fileResponse.ok) {
        throw new Error(`HTTP ${fileResponse.status}: ${fileResponse.statusText}`);
      }

      // Читаем файл как buffer
      const arrayBuffer = await fileResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      // Сохраняем во временный файл
      fs.writeFileSync(tempFilepath, buffer);

      // Переименовываем временный файл в финальный только после успешного скачивания
      fs.renameSync(tempFilepath, filepath);

      console.log(`✅ Файл сохранен: ${filepath}`);
    } catch (error) {
      // Удаляем временный файл при ошибке
      if (fs.existsSync(tempFilepath)) {
        try {
          fs.unlinkSync(tempFilepath);
          console.log(`🗑️  Удален неполный файл после ошибки: ${tempFilepath}`);
        } catch (unlinkError) {
          console.error('Ошибка при удалении временного файла:', unlinkError);
        }
      }
      throw error;
    }

    res.json({
      success: true,
      filepath: filepath,
      filename: safeFilename,
      size: buffer.length,
      skipped: false,
    });
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
    res.status(500).json({
      error: error.message || 'Внутренняя ошибка сервера',
    });
  }
});

// Эндпоинт для загрузки локальных файлов
app.post('/api/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Файл не был загружен',
      });
    }

    const originalName = req.file.originalname;
    const filepath = req.file.path; // Полный путь к сохраненному файлу
    const currentStats = fs.statSync(filepath);
    const currentSize = currentStats.size;

    console.log(`✅ Файл загружен: ${filepath} (${currentSize} байт)`);

    res.json({
      success: true,
      filepath: filepath,
      filename: originalName,
      originalName: originalName,
      size: currentSize,
      skipped: false,
    });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    // Удаляем временный файл при ошибке
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Не удалось удалить временный файл:', unlinkError);
      }
    }
    res.status(500).json({
      error: error.message || 'Внутренняя ошибка сервера',
    });
  }
});

// Эндпоинт для проверки наличия файла в downloads
app.get('/api/check-file', (req, res) => {
  try {
    const { filename, search } = req.query;

    // Если передан search, ищем файлы по части имени
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase().replace(/[^a-z0-9]/g, ''); // Убираем все не-буквы и не-цифры
      const files = fs.readdirSync(DOWNLOADS_DIR);
      
      // Ищем файлы, содержащие search в имени (без учета регистра и подчеркиваний)
      const matchingFiles = files.filter((file) => {
        if (!(file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.mp3') || 
              file.toLowerCase().endsWith('.webm') || file.toLowerCase().endsWith('.m4a'))) {
          return false;
        }
        
        // Убираем расширение и все подчеркивания, оставляем только буквы и цифры
        const fileBase = file.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/g, '');
        return fileBase.includes(searchLower);
      });

      if (matchingFiles.length > 0) {
        // Берем первый найденный файл
        const foundFile = matchingFiles[0];
        const filepath = path.join(DOWNLOADS_DIR, foundFile);
        const stats = fs.statSync(filepath);
        return res.json({
          exists: true,
          filepath: filepath,
          filename: foundFile,
          size: stats.size,
          url: `/download-api/serve-file/${encodeURIComponent(foundFile)}`,
        });
      }

      return res.json({
        exists: false,
        search: search,
      });
    }

    // Обычная проверка по точному имени файла
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({
        error: 'Имя файла или search обязательно',
      });
    }

    const filepath = path.join(DOWNLOADS_DIR, filename);

    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      return res.json({
        exists: true,
        filepath: filepath,
        filename: filename,
        size: stats.size,
        url: `/download-api/serve-file/${encodeURIComponent(filename)}`,
      });
    }

    return res.json({
      exists: false,
      filename: filename,
    });
  } catch (error) {
    console.error('Ошибка при проверке файла:', error);
    res.status(500).json({
      error: error.message || 'Внутренняя ошибка сервера',
    });
  }
});

// Эндпоинт для отдачи файлов из downloads
app.get('/api/serve-file/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filepath = path.join(DOWNLOADS_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        error: 'Файл не найден',
      });
    }

    // Определяем MIME-тип по расширению
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac',
      '.mov': 'video/quicktime',
      '.mkv': 'video/x-matroska',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Ошибка при отдаче файла:', error);
    res.status(500).json({
      error: error.message || 'Внутренняя ошибка сервера',
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, downloadsDir: DOWNLOADS_DIR });
});

// Очистка временных файлов при запуске сервера
function cleanupTempFiles() {
  try {
    const files = fs.readdirSync(DOWNLOADS_DIR);
    let cleanedCount = 0;
    
    files.forEach((file) => {
      if (file.startsWith('.') && file.endsWith('.tmp')) {
        const tempFilepath = path.join(DOWNLOADS_DIR, file);
        try {
          fs.unlinkSync(tempFilepath);
          cleanedCount++;
          console.log(`🗑️  Удален неполный файл: ${file}`);
        } catch (error) {
          console.error(`Ошибка при удалении ${file}:`, error);
        }
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`✅ Очищено ${cleanedCount} неполных файлов`);
    }
  } catch (error) {
    console.error('Ошибка при очистке временных файлов:', error);
  }
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер для скачивания файлов запущен на http://localhost:${PORT}`);
  console.log(`📁 Файлы сохраняются в: ${DOWNLOADS_DIR}`);
  console.log(`⚠️  Сервер работает только для локальной разработки!`);
  
  // Очищаем временные файлы при запуске
  cleanupTempFiles();
});
