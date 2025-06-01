import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import ProductDetail from './ProductDetail';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [responseTime, setResponseTime] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const searchProducts = async (term) => {
    setLoading(true)
    setError(null)
    const startTime = performance.now()
    
    try {
      const response = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(term)}`)
      const data = await response.json()
      const endTime = performance.now()
      
      if (data.success) {
        setProducts(data.data)
        setResponseTime(endTime - startTime)
      } else {
        setError('Failed to fetch products')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm === '') {
      searchProducts('')
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    searchProducts(searchTerm)
  }

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <a className="navbar-brand" href="/">Product Store</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/">Home</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;