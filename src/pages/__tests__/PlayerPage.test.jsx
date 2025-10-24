import { jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import PlayerPage from '../PlayerPage.jsx'

const renderPlayerPage = () =>
  render(
    <HelmetProvider>
      <PlayerPage />
    </HelmetProvider>,
  )

describe('PlayerPage', () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      writable: true,
      value: jest.fn().mockResolvedValue(),
    })

    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('переключает активный трек при выборе из списка', async () => {
    const user = userEvent.setup()
    renderPlayerPage()

    const targetTrack = screen.getByRole('option', { name: /Northern Pulse/i })
    await user.click(targetTrack)

    const activeOption = screen.getByRole('option', { selected: true })
    expect(activeOption).toHaveTextContent('Northern Pulse')

    expect(screen.getByRole('heading', { level: 3, name: 'Northern Pulse' })).toBeInTheDocument()
  })

  it('управляет воспроизведением через кнопку play/pause', async () => {
    const user = userEvent.setup()
    renderPlayerPage()

    const playButton = screen.getByLabelText('Воспроизвести')
    await user.click(playButton)
    expect(screen.getByLabelText('Пауза')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Пауза'))
    expect(screen.getByLabelText('Воспроизвести')).toBeInTheDocument()
  })

  it('изменяет тональность в допустимых пределах', async () => {
    const user = userEvent.setup()
    renderPlayerPage()

    const increaseButton = screen.getByLabelText('Повысить тональность')
    const decreaseButton = screen.getByLabelText('Понизить тональность')

    await user.click(increaseButton)
    expect(screen.getByText('+1 полутон')).toBeInTheDocument()

    await user.click(decreaseButton)
    await user.click(decreaseButton)
    expect(screen.getByText('-1 полутон')).toBeInTheDocument()
  })

  it('переходит к следующему треку по кнопке и событию окончания', async () => {
    const user = userEvent.setup()
    const { container } = renderPlayerPage()

    await user.click(screen.getByLabelText('Следующий трек'))
    expect(screen.getByRole('heading', { level: 3, name: 'Northern Pulse' })).toBeInTheDocument()

    const audioElement = container.querySelector('audio')
    fireEvent(audioElement, new Event('ended'))
    expect(
      screen.getByRole('heading', { level: 3, name: "Champions' Reprise" }),
    ).toBeInTheDocument()
  })
})
