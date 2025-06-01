import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SearchFilter from './SearchFilter';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [querySQL, setQuerySQL] = useState('');
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get search from URL parameters, default to empty
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(searchTerm)}`);
        setProducts(response.data.data);
        setQuerySQL(`SELECT id, name FROM products WHERE name ILIKE '%${searchTerm}%'`);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  const handleSearchChange = (search) => {
    if (search === '') {
      setSearchParams({});
    } else {
      setSearchParams({ search });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center mb-4">Product Search</h1>
      <p className="text-center text-muted mb-4">
        Search for products by name or category.
      </p>
      
      <SearchFilter onSearchChange={handleSearchChange} currentSearch={searchTerm} />

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && products.length === 0 ? (
        <div className="alert alert-info">
          No products found. Try a different search term.
        </div>
      ) : (
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card article-card">
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">
                    <small className="text-muted">Product ID: {product.id}</small>
                  </p>
                  <Link to={`/product/${product.id}`} className="btn btn-primary">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Query Information</h5>
              <p className="card-text"><strong>Total results:</strong> {products.length}</p>
              <p className="card-text"><strong>Search term:</strong> {searchTerm || 'All products'}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Current URL</h5>
              <p className="card-text">
                <code className="user-select-all">
                  {window.location.href}
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {querySQL && (
        <div className="card mt-4 bg-light">
          <div className="card-body">
            <h5 className="card-title">Executed SQL Query</h5>
            <pre className="bg-dark text-white p-3 rounded">
              {querySQL}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;