import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders a placeholder heading for the main page', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Главная страница' })).toBeInTheDocument()
  })

  it('describes upcoming content for the application', () => {
    render(<App />)

    expect(screen.getByText('Здесь появится приложение AI Karaoke.')).toBeInTheDocument()
  })
})
