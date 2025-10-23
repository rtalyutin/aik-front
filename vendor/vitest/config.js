export function defineConfig(config) {
  return typeof config === 'function' ? config() : config
}

export default defineConfig
