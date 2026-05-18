import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import FormPage from './pages/FormPage'
import ResponsePage from './pages/ResponsePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/response/:leadId" element={<ResponsePage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
