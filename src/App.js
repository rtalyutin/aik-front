function normalizeChildren(children) {
  if (!children) {
    return []
  }
  if (Array.isArray(children)) {
    return children.flatMap((child) => normalizeChildren(child))
  }
  return [children]
}

export function App({ children } = {}) {
  return {
    type: 'element',
    tag: 'div',
    props: { className: 'app' },
    children: [
      {
        type: 'element',
        tag: 'h1',
        props: {},
        children: [{ type: 'text', value: 'Static Counter Demo' }],
      },
      ...normalizeChildren(children),
    ],
  }
}

export default App
