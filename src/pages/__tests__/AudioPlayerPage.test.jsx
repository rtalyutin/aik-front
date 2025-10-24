import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import AudioPlayerPage from '../AudioPlayerPage.jsx'

describe('AudioPlayerPage', () => {
  let playSpy
  let pauseSpy

  const renderPage = () =>
    render(
      <HelmetProvider>
        <AudioPlayerPage />
      </HelmetProvider>,
    )

  beforeEach(() => {
    playSpy = jest
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve())
    pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('allows selecting track from the list', async () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 2, name: /warmup anthem/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /celebration lights/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /celebration lights/i }),
      ).toBeInTheDocument()
    })

    expect(playSpy).toHaveBeenCalled()
  })

  it('toggles playback when the primary control is pressed', async () => {
    renderPage()

    const playButton = screen.getByRole('button', { name: /старт/i })
    fireEvent.click(playButton)

    await waitFor(() => {
      expect(playSpy).toHaveBeenCalled()
    })

    const pauseButton = screen.getByRole('button', { name: /пауза/i })
    fireEvent.click(pauseButton)

    await waitFor(() => {
      expect(pauseSpy).toHaveBeenCalled()
    })

    expect(screen.getByRole('button', { name: /старт/i })).toBeInTheDocument()
  })

  it('switches to the next track via the navigation control', async () => {
    renderPage()

    const nextButton = screen.getByRole('button', { name: /следующий/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /battle formation/i }),
      ).toBeInTheDocument()
    })

    expect(playSpy).toHaveBeenCalled()
  })
})
