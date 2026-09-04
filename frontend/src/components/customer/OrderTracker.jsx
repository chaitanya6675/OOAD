import React from 'react';
import { Check, Clock, Package, Truck, Home, AlertCircle } from 'lucide-react';

export const OrderTracker = ({ orderStatus, cancelReason }) => {
  if (orderStatus === 'Cancelled') {
    return (
      <div className="alert alert-danger" style={{ margin: '1.5rem 0' }}>
        <AlertCircle size={20} />
        <div>
          <strong>Order Cancelled:</strong> {cancelReason || 'This order was cancelled and any payments have been refunded / inventory restored.'}
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Home }
  ];

  const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const currentIndex = statusOrder.indexOf(orderStatus);

  return (
    <div style={{ margin: '2rem 0' }}>
      <div className="order-stepper">
        {steps.map((step, idx) => {
          const isCompleted = currentIndex > idx;
          const isActive = currentIndex === idx;
          const Icon = step.icon;

          return (
            <div 
              key={step.key} 
              className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-circle">
                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
