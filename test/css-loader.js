const CSS_EXTENSION = '.css';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.endsWith(CSS_EXTENSION)) {
    const url = new URL(specifier, context.parentURL).href;
    return {
      shortCircuit: true,
      url,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith(CSS_EXTENSION)) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default new Proxy({}, { get: () => "" });',
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
