/**
 * Проверяет, включены ли локальные фичи (скачивание файлов, локальная авторизация и т.д.)
 * Локальные фичи выключены по умолчанию, даже в dev режиме.
 * Включаются только если явно установлено VITE_ENABLE_LOCAL_FEATURES=true
 * 
 * @returns {boolean} true, если локальные фичи включены
 */
export const isLocalFeaturesEnabled = () => {
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Если не dev режим, фичи всегда выключены
  if (!isDev) {
    return false;
  }
  
  // В dev режиме включаются только если явно установлено VITE_ENABLE_LOCAL_FEATURES=true
  const enableLocalFeatures = import.meta.env.VITE_ENABLE_LOCAL_FEATURES === 'true';
  
  return enableLocalFeatures;
};
