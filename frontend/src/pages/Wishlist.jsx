import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);

  // Load wishlist
  useEffect(() => {
    const savedWishlist =
      JSON.parse(
        localStorage.getItem("wishlist")
      ) || [];

    setWishlist(savedWishlist);
  }, []);

  // Remove product
  const removeFromWishlist = (id) => {
    const updatedWishlist =
      wishlist.filter(
        (product) => product.id !== id
      );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  // Move product to cart
  const addToCart = (product) => {
    const existingCart =
      JSON.parse(
        localStorage.getItem("cart")
      ) || [];

    const alreadyInCart =
      existingCart.some(
        (item) => item.id === product.id
      );

    if (!alreadyInCart) {
      existingCart.push(product);

      localStorage.setItem(
        "cart",
        JSON.stringify(existingCart)
      );
    }

    alert(
      `${product.name} added to cart! 🛒`
    );
  };

  // View product
  const viewProduct = (product) => {
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    navigate("/product");
  };

  // Try on product
  const tryOn = (product) => {
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    navigate("/try-on");
  };

  return (
    <div className="wishlist-page">

      {/* HEADER */}

      <div className="wishlist-header">

        <button
          onClick={() => navigate("/")}
        >
          ← Continue Shopping
        </button>

        <h1>
          ❤️ My Wishlist
        </h1>

        <p>
          {wishlist.length}{" "}
          {wishlist.length === 1
            ? "item"
            : "items"}{" "}
          saved
        </p>

      </div>


      {/* EMPTY WISHLIST */}

      {wishlist.length === 0 && (

        <div className="empty-wishlist">

          <div
            style={{
              fontSize: "70px",
              marginBottom: "20px",
            }}
          >
            ♡
          </div>

          <h2>
            Your Wishlist is Empty
          </h2>

          <p>
            Save products you love and
            come back to them later.
          </p>

          <button
            onClick={() => navigate("/")}
          >
            🛍️ Explore Products
          </button>

        </div>

      )}


      {/* WISHLIST PRODUCTS */}

      {wishlist.length > 0 && (

        <div className="wishlist-grid">

          {wishlist.map((product) => (

            <div
              className="wishlist-card"
              key={product.id}
            >

              {/* IMAGE */}

              <div className="wishlist-image">

                <img
                  src={product.image}
                  alt={product.name}
                />

                <button
                  className="wishlist-remove"
                  onClick={() =>
                    removeFromWishlist(
                      product.id
                    )
                  }
                  title="Remove from wishlist"
                >
                  ❤️
                </button>

              </div>


              {/* DETAILS */}

              <div className="wishlist-info">

                <p className="product-category">
                  {product.category}
                  {product.subcategory
                    ? ` • ${product.subcategory}`
                    : ""}
                </p>

                <h3>
                  {product.name}
                </h3>

                <h4>
                  ₹
                  {product.price.toLocaleString(
                    "en-IN"
                  )}
                </h4>


                {/* BUTTONS */}

                <button
                  onClick={() =>
                    viewProduct(product)
                  }
                >
                  View Product →
                </button>


                <button
                  onClick={() =>
                    tryOn(product)
                  }
                >
                  ✨ Try On with AI
                </button>


                <button
                  onClick={() =>
                    addToCart(product)
                  }
                >
                  🛒 Add to Cart
                </button>


                <button
                  onClick={() =>
                    removeFromWishlist(
                      product.id
                    )
                  }
                >
                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Wishlist; 