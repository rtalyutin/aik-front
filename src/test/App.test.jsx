import { fireEvent, render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders karaoke hero title and static navigation label', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Пой со мной!' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Основное меню' })).toBeInTheDocument()
    expect(screen.getByText('Музыка')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Музыка' })).toBeNull()
  })

  it('shows the demo lyrics list', () => {
    render(<App />)

    const lyricsItems = screen.getAllByRole('listitem')
    expect(lyricsItems.length).toBeGreaterThan(0)
  })

  it('allows hiding the infographic card', () => {
    render(<App />)

    const closeButton = screen.getByRole('button', { name: 'Скрыть инфографику' })
    fireEvent.click(closeButton)

    expect(screen.queryByRole('region', { name: 'Как работает AI караоке' })).toBeNull()
  })
})
