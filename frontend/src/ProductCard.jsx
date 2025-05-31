import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryBadgeClass = (category) => {
    const categoryClasses = {
      'Laptops': 'bg-primary',
      'Smartphones': 'bg-success',
      'Audio': 'bg-warning text-dark',
      'Accessories': 'bg-info',
      'Monitors': 'bg-secondary'
    };
    return categoryClasses[category] || 'bg-dark';
  };

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="mb-2">
          <span className={`badge ${getCategoryBadgeClass(product.category)} mb-2`}>
            {product.category}
          </span>
        </div>
        
        <h5 className="card-title">{product.name}</h5>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="h5 mb-0 text-primary">{formatPrice(product.price)}</span>
          </div>
          
          <Link 
            to={`/product/${product.id}`} 
            className="btn btn-primary w-100"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;