import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SearchFilter from './SearchFilter';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        setProducts(response.data.data);
        if (response.data.data.length === 0) {
          setError('No products found. Try a different search term.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('No products found. Try a different search term.');
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
        Search for products by name.
      </p>
      
      <SearchFilter onSearchChange={handleSearchChange} currentSearch={searchTerm} />

      {error && (
        <div className="alert alert-info">
          {error}
        </div>
      )}

      {!error && products.length === 0 ? (
        <div className="alert alert-info">
          No products found. Try a different search term.
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Search Results</h5>
              </div>
              <div className="card-body">
                {products.map(product => (
                  <div key={product.id} className="border-bottom py-3">
                    <h5 className="mb-1">{product.name}</h5>
                    <small className="text-muted">Product ID: {product.id}</small>
                    <div className="mt-2">
                      <Link to={`/product/${product.id}`} className="btn btn-sm btn-primary">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;