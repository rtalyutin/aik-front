import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Footer from '../../components/Footer.jsx'
import DocsPage from '../DocsPage.jsx'
import NotFoundPage from '../NotFoundPage.jsx'

const TestLayout = () => (
  <div>
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
)

describe('Docs navigation', () => {
  it('переходит на страницу документации без отображения NotFound', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<TestLayout />}>
              <Route index element={<h1>Главная</h1>} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: /документация/i }))

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /документация aik front/i,
      }),
    ).toBeInTheDocument()

    expect(screen.queryByRole('heading', { level: 1, name: /404/i })).not.toBeInTheDocument()
  })
})
