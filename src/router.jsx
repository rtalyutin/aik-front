import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'

const HomePage = lazy(() => import('./pages/Home.jsx'))
const NewsPage = lazy(() => import('./pages/NewsPage.jsx'))
const SchedulePage = lazy(() => import('./pages/SchedulePage.jsx'))
const TeamsPage = lazy(() => import('./pages/TeamsPage.jsx'))
const AudioPlayerPage = lazy(() => import('./pages/AudioPlayerPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

const withSuspense = (Component) => (
  <Suspense
    fallback={
      <div className="page-loader">
        <LoadingSpinner />
      </div>
    }
  >
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: withSuspense(NotFoundPage),
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'news',
        element: withSuspense(NewsPage),
      },
      {
        path: 'schedule',
        element: withSuspense(SchedulePage),
      },
      {
        path: 'audio-player',
        element: withSuspense(AudioPlayerPage),
      },
      {
        path: 'teams',
        element: withSuspense(TeamsPage),
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
])

export default router
