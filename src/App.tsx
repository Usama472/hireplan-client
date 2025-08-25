import { AuthSessionProvider } from '@/lib/context/AuthSessionContext'
import AuthRedirection from '@/lib/hooks/AuthRedirection'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './routes'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthSessionProvider>
        <AuthRedirection>
          <RouterProvider router={router} />
          <Toaster position='top-right' richColors />
        </AuthRedirection>
      </AuthSessionProvider>
    </ErrorBoundary>
  )
}

export default App
