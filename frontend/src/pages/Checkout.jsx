import { useState } from "react";

function Checkout() {
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "Cash on Delivery",
  });

  const cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
  );

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCustomer({
      ...customer,
      [name]: value,
    });
  };

  const placeOrder = (event) => {
    event.preventDefault();

    setOrderPlaced(true);

    localStorage.removeItem("cart");
  };

  if (orderPlaced) {
    return (
      <div className="order-success-page">

        <div className="success-card">

          <div className="success-icon">
            🎉
          </div>

          <p className="success-label">
            ORDER CONFIRMED
          </p>

          <h1>
            Order Placed Successfully!
          </h1>

          <p>
            Thank you for shopping with StyleAI.
          </p>

          <p className="success-description">
            Your order has been received and will
            be processed shortly.
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="checkout-page">

      {/* Header */}

      <div className="checkout-header">

        <button
          className="checkout-back"
          onClick={() => {
            window.location.href = "/cart";
          }}
        >
          ← Back to Cart
        </button>

        <p className="checkout-label">
          SECURE CHECKOUT
        </p>

        <h1>
          Complete Your Order 💳
        </h1>

        <p>
          Enter your details and choose your
          preferred payment method.
        </p>

      </div>


      {/* Checkout Layout */}

      <div className="checkout-layout">

        {/* Customer Details */}

        <div className="checkout-form-card">

          <h2>
            Customer Details
          </h2>

          <p className="form-description">
            Where should we deliver your order?
          </p>

          <form onSubmit={placeOrder}>

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Delivery Address
              </label>

              <textarea
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                rows="4"
                required
              />

            </div>


            <div className="form-row">

              <div className="form-group">

                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={customer.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  required
                />

              </div>

            </div>


            {/* Payment */}

            <div className="payment-section">

              <h3>
                Payment Method
              </h3>

              <select
                name="payment"
                value={customer.payment}
                onChange={handleChange}
              >
                <option>
                  Cash on Delivery
                </option>

                <option>
                  UPI
                </option>

                <option>
                  Credit / Debit Card
                </option>
              </select>

            </div>


            <button
              className="place-order-button"
              type="submit"
            >
              Place Order →
            </button>

          </form>

        </div>


        {/* Order Summary */}

        <div className="order-summary-card">

          <div className="summary-header">

            <p>
              YOUR ORDER
            </p>

            <h2>
              Order Summary
            </h2>

          </div>


          {cart.length === 0 ? (

            <div className="empty-checkout">

              <div>
                🛒
              </div>

              <h3>
                Your cart is empty
              </h3>

              <button
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Continue Shopping
              </button>

            </div>

          ) : (

            <>

              <div className="checkout-items">

                {cart.map((item) => (

                  <div
                    className="checkout-item"
                    key={item.id}
                  >

                    <div className="checkout-item-image">

                      <img
                        src={item.image}
                        alt={item.name}
                      />

                    </div>

                    <div className="checkout-item-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                    </div>

                    <strong>
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>

                ))}

              </div>


              <div className="summary-divider" />


              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Delivery
                </span>

                <strong className="free">
                  FREE
                </strong>

              </div>


              <div className="summary-divider" />


              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>

              </div>


              <div className="secure-message">

                🔒
                <span>
                  Secure checkout and safe shopping
                </span>

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default Checkout;