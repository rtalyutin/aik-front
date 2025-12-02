#!/usr/bin/env node
import { getEnvValidationResult, REQUIRED_ENV_KEYS } from '../src/config/apiEndpoints.js';

const { missingKeys, details } = getEnvValidationResult();

if (missingKeys.length === 0) {
  console.log('✅ Все обязательные переменные окружения заданы:', REQUIRED_ENV_KEYS.join(', '));
  process.exit(0);
}

console.error('❌ Найдены проблемы с переменными окружения:');
missingKeys.forEach((key) => console.error(`- ${key}`));

if (details.length) {
  console.error('\nДетали:');
  details.forEach((detail) => console.error(`• ${detail}`));
}

process.exit(1);
