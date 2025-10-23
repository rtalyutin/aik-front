import { markers } from '../../vitest/index.js'
import { expect } from '../../vitest/public-api.js'

const matchers = {
  toBeInTheDocument(received) {
    const pass = Boolean(received && received[markers.DOCUMENT_MARKER])
    return {
      pass,
      message: () =>
        pass
          ? 'Expected element not to be in the document'
          : 'Expected element to be in the document',
    }
  },
}

expect.extend(matchers)

export default matchers
