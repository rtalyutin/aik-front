import { markers } from '../../vitest/index.js'

let currentTree = null

export function cleanup() {
  currentTree = null
}

export function render(node) {
  currentTree = normalise(node)
  return { container: currentTree }
}

export const screen = {
  getByRole(role, options = {}) {
    if (!currentTree) {
      throw new Error('No rendered tree available. Did you call render()?')
    }
    const match = findByRole(currentTree, role, options)
    if (!match) {
      const description = roleDescription(role, options)
      throw new Error(`Unable to find an element by role: ${description}`)
    }
    return {
      node: match,
      [markers.DOCUMENT_MARKER]: true,
      get textContent() {
        return textContent(match)
      },
    }
  },
}

function normalise(node) {
  if (node == null) {
    return null
  }
  if (typeof node === 'function') {
    return normalise(node())
  }
  if (typeof node === 'string') {
    return { type: 'text', value: node }
  }
  if (typeof node === 'object' && node.type === 'element') {
    return {
      type: 'element',
      tag: node.tag,
      props: node.props ?? {},
      children: Array.isArray(node.children)
        ? node.children.map((child) => normalise(child)).filter(Boolean)
        : [],
    }
  }
  if (typeof node === 'object' && node.type === 'text') {
    return {
      type: 'text',
      value: node.value != null ? String(node.value) : '',
    }
  }
  if (typeof node === 'object' && node.type === 'fragment') {
    return {
      type: 'fragment',
      children: Array.isArray(node.children)
        ? node.children.map((child) => normalise(child)).filter(Boolean)
        : [],
    }
  }
  if (Array.isArray(node)) {
    return {
      type: 'fragment',
      children: node.map((child) => normalise(child)).filter(Boolean),
    }
  }
  throw new TypeError(`Unsupported node passed to render: ${typeof node}`)
}

function findByRole(node, role, options) {
  if (!node) {
    return null
  }
  if (node.type === 'element' && matchesRole(node, role, options)) {
    return node
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = findByRole(child, role, options)
      if (result) {
        return result
      }
    }
  }
  if (node.type === 'fragment' && Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = findByRole(child, role, options)
      if (result) {
        return result
      }
    }
  }
  return null
}

function matchesRole(node, role, options) {
  if (role === 'heading') {
    const level = options.level ?? null
    if (typeof level === 'number') {
      if (node.tag !== `h${level}`) {
        return false
      }
    } else if (!/^h[1-6]$/.test(node.tag ?? '')) {
      return false
    }
    if (options.name) {
      const content = textContent(node)
      if (typeof options.name === 'string') {
        return content === options.name
      }
      if (options.name instanceof RegExp) {
        return options.name.test(content)
      }
      return false
    }
    return true
  }
  if (role === 'button') {
    return (node.tag ?? '').toLowerCase() === 'button'
  }
  return false
}

function textContent(node) {
  if (!node) {
    return ''
  }
  if (node.type === 'text') {
    return node.value ?? ''
  }
  if (Array.isArray(node.children)) {
    return node.children.map((child) => textContent(child)).join('')
  }
  return ''
}

function roleDescription(role, options) {
  if (role === 'heading' && typeof options.level === 'number') {
    return `heading level ${options.level}`
  }
  return role
}
