import './styles/App.css'

import { Slide, ToastContainer } from 'react-toastify'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import SidebarLayout from './components/layout/SidebarLayout'

import ItemsPage from './features/items/pages/ItemsPage'
import ItemCreatePage from './features/items/pages/ItemCreatePage'
import ItemEditPage from './features/items/pages/ItemEditPage'

import NotFoundPage from './features/common/pages/NotFoundPage'

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
        <Routes>
          <Route path="/" element={<SidebarLayout />}>
            <Route path="items" element={<ItemsPage />} />
            <Route path="items/create" element={<ItemCreatePage />} />
            <Route path="items/edit/:id" element={<ItemEditPage />} />
            {/* <Route path="recipes" element={<RecipesPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="player" element={<PlayerPage />} /> */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
