import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders karaoke hero copy and single navigation item', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Пой со мной!' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Основное меню' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Музыка' })).toHaveAttribute('href', '#music')
  })

  it('shows the demo lyrics list', () => {
    render(<App />)

    const lyricsItems = screen.getAllByRole('listitem')
    expect(lyricsItems.length).toBeGreaterThan(0)
  })
})
