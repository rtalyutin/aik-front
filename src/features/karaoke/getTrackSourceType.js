const MEDIA_EXTENSIONS = /(\.mp4|\.webm|\.ogg|\.mp3|\.wav|\.m4a|\.aac|\.flac|\.mov|\.mkv)(?:$|[?#])/i;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeUrl = (value) => {
  if (!isNonEmptyString(value)) {
    return '';
  }

  try {
    const parsed = new URL(value, 'http://localhost');

    return parsed.toString();
  } catch (error) {
    return value.trim();
  }
};

const getHost = (url) => {
  try {
    const parsed = new URL(url);

    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch (error) {
    return '';
  }
};

const isMediaFile = (url) => {
  if (!isNonEmptyString(url)) {
    return false;
  }

  return MEDIA_EXTENSIONS.test(url);
};

export const getTrackSourceType = (rawUrl) => {
  const normalized = normalizeUrl(rawUrl);

  if (!isNonEmptyString(normalized)) {
    return 'unknown';
  }

  const host = getHost(normalized);

  if (host.includes('youtube.com') || host === 'youtu.be') {
    return 'youtube';
  }

  if (host.includes('vk.com') || host.includes('vkontakte.ru')) {
    return 'vk';
  }

  if (isMediaFile(normalized)) {
    return 'media';
  }

  return 'unknown';
};

export default getTrackSourceType;
