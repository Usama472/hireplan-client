import { AuthSessionProvider } from '@/lib/context/AuthSessionContext'
import AuthRedirection from '@/lib/hooks/AuthRedirection'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './routes'

function App() {
  return (
    <AuthSessionProvider>
      <AuthRedirection>
        <RouterProvider router={router} />
        <Toaster position='top-right' richColors />
      </AuthRedirection>
    </AuthSessionProvider>
  )
}

export default App
