const STUB_SOURCES = {
  '.css': 'export default new Proxy({}, { get: () => "" });',
  '.svg': 'export default "";',
};

const getStubExtension = (value = '') =>
  Object.keys(STUB_SOURCES).find((extension) => value.endsWith(extension));

export async function resolve(specifier, context, defaultResolve) {
  const matchedExtension = getStubExtension(specifier);

  if (matchedExtension) {
    const url = new URL(specifier, context.parentURL).href;
    return {
      shortCircuit: true,
      url,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  const matchedExtension = getStubExtension(url);

  if (matchedExtension) {
    return {
      format: 'module',
      shortCircuit: true,
      source: STUB_SOURCES[matchedExtension] ?? 'export default "";',
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
