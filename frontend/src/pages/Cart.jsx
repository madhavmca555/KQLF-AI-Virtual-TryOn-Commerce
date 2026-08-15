import { useEffect, useState } from "react";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    setCart(savedCart);
  }, []);

  const updateCart = (id, change) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + change,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your Cart 🛒</h1>

        <p>Your cart is empty.</p>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart 🛒</h1>

      {cart.map((item) => (
        <div
          key={item.id}
          className="cart-item"
        >
          <img
            src={item.image}
            alt={item.name}
            width="150"
          />

          <div>
            <h2>{item.name}</h2>

            <p>
              ₹{item.price.toLocaleString("en-IN")}
            </p>

            <div>
              <button
                onClick={() =>
                  updateCart(item.id, -1)
                }
              >
                −
              </button>

              <span
                style={{
                  margin: "0 15px",
                }}
              >
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  updateCart(item.id, 1)
                }
              >
                +
              </button>
            </div>

            <br />

            <button
              onClick={() =>
                removeItem(item.id)
              }
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <hr />

      <h2>
        Total: ₹{total.toLocaleString("en-IN")}
      </h2>

      <button
        onClick={() => {
          window.location.href = "/checkout";
        }}
      >
        Proceed to Checkout 💳
      </button>
    </div>
  );
}

export default Cart; 