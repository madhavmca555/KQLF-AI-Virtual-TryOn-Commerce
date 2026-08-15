import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductDetails() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const savedProduct =
      localStorage.getItem("selectedProduct");

    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    }
  }, []);

  if (!product) {
    return (
      <div className="product-details">
        <h2>Product not found</h2>

        <button
          onClick={() => navigate("/")}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  const handleTryOn = () => {
    // Make absolutely sure the selected
    // product is saved before going to Try-On.
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    navigate("/try-on");
  };

  const handleAddToCart = () => {
    const existingCart =
      JSON.parse(
        localStorage.getItem("cart")
      ) || [];

    const alreadyAdded =
      existingCart.find(
        (item) => item.id === product.id
      );

    if (!alreadyAdded) {
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

  const handleBuyNow = () => {
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    navigate("/checkout");
  };

  return (
    <div className="product-details">

      {/* Back */}

      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back to Products
      </button>


      {/* Product */}

      <div className="product-details-container">

        <div className="product-details-image">

          <img
            src={product.image}
            alt={product.name}
          />

        </div>


        <div className="product-details-info">

          <p className="product-category">
            {product.category}
            {product.subcategory
              ? ` • ${product.subcategory}`
              : ""}
          </p>


          <h1>
            {product.name}
          </h1>


          <h2>
            ₹
            {product.price.toLocaleString(
              "en-IN"
            )}
          </h2>


          <p>
            A stylish premium product
            selected from the StyleAI
            collection.
          </p>


          {/* Try On */}

          <button
            className="primary-button"
            onClick={handleTryOn}
          >
            ✨ Try On with AI
          </button>


          {/* Cart */}

          <button
            className="secondary-button"
            onClick={handleAddToCart}
          >
            🛒 Add to Cart
          </button>


          {/* Buy */}

          <button
            className="buy-now-button"
            onClick={handleBuyNow}
          >
            💳 Buy Now
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails; 