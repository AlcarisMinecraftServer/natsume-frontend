import { Slide, ToastContainer } from 'react-toastify'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import SidebarLayout from './components/layout/SidebarLayout'

import { AuthProvider } from '@/features/auth/context/AuthContext'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'

const ItemsPage = lazy(() => import('./features/items/pages/ItemsPage'))
const ItemCreatePage = lazy(() => import('./features/items/pages/ItemCreatePage'))
const ItemEditPage = lazy(() => import('./features/items/pages/ItemEditPage'))
const NotFoundPage = lazy(() => import('./features/common/pages/NotFoundPage'))
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const AuthCallbackPage = lazy(() => import('./features/auth/pages/AuthCallbackPage'))

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        closeButton={false}
        hideProgressBar={true}
        newestOnTop={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="items" replace />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="items/create" element={<ItemCreatePage />} />
              <Route path="items/edit/:id" element={<ItemEditPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
