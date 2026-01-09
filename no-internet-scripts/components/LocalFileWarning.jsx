import React from 'react';
import { isLocalFeaturesEnabled } from '../utils/isLocalFeaturesEnabled.js';

/**
 * Компонент для отображения предупреждения о дубликатах файлов
 * Виден только когда включены локальные фичи
 */
const LocalFileWarning = () => {
  if (!isLocalFeaturesEnabled()) {
    return null;
  }

  return (
    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
      ⚠️ Внимание: файлы с одинаковыми именами будут перезаписаны. Убедитесь, что названия файлов уникальны.
    </p>
  );
};

export default LocalFileWarning;
