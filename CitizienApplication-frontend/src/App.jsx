// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' // React Router importları
import ApplicationForm from './pages/ApplicationForm'
import Header from "./components/Header"
import ThankYouPage from './pages/ThankYouPage' // Teşekkür sayfasını ekliyoruz

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Header />
        <Routes>
          {/* Form Sayfası */}
          <Route path="/" element={<ApplicationForm />} />
          {/* Teşekkür Sayfası */}
          <Route path="/tesekkur" element={<ThankYouPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
