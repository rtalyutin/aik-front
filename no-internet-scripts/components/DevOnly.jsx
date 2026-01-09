import React, { useState, useEffect } from 'react';
import { isLocalFeaturesEnabled } from '../utils/isLocalFeaturesEnabled.js';

/**
 * Компонент-обёртка для условного рендеринга DownloadAllYoutubeVideos только когда включены локальные фичи.
 * В продакшене или без VITE_ENABLE_LOCAL_FEATURES всегда возвращает null.
 */
const DevOnlyDownloadAllYoutubeVideos = (props) => {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (!isLocalFeaturesEnabled()) {
      return;
    }

    import('./DownloadAllYoutubeVideos.jsx')
      .then((module) => {
        setComponent(() => module.default);
      })
      .catch((error) => {
        console.warn('Не удалось загрузить DownloadAllYoutubeVideos:', error);
      });
  }, []);

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
};

export default DevOnlyDownloadAllYoutubeVideos;
