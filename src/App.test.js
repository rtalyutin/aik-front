import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.js'

describe('App', () => {
  it('renders the default heading', () => {
    render(App())
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /static counter demo/i,
      }),
    ).toBeInTheDocument()
  })
})
