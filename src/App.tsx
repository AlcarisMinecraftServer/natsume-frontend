import { Slide, ToastContainer } from 'react-toastify'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import SidebarLayout from './components/layout/SidebarLayout'

const ItemsPage = lazy(() => import('./features/items/pages/ItemsPage'))
const ItemCreatePage = lazy(() => import('./features/items/pages/ItemCreatePage'))
const ItemEditPage = lazy(() => import('./features/items/pages/ItemEditPage'))
const NotFoundPage = lazy(() => import('./features/common/pages/NotFoundPage'))

function App() {
  return (
    <>
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
            <Route path="/" element={<SidebarLayout />}>
              <Route path="items" element={<ItemsPage />} />
              <Route path="items/create" element={<ItemCreatePage />} />
              <Route path="items/edit/:id" element={<ItemEditPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
