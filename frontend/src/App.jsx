import { useEffect, useState } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import ProductDetails from "./pages/ProductDetails";
import TryOn from "./pages/TryOn";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";


// ======================================================
// KQLF PRODUCTS
// ======================================================

const products = [
  {
    id: 1,
    name: "Premium Casual Shirt",
    category: "Men",
    subcategory: "Shirt",
    price: 1499,
    image: "/products/shirt.jpg",
  },
  {
    id: 2,
    name: "Classic Slim Fit Pants",
    category: "Men",
    subcategory: "Pants",
    price: 1799,
    image: "/products/pants.jpg",
  },
  {
    id: 3,
    name: "Urban Casual Shoes",
    category: "Men",
    subcategory: "Shoes",
    price: 2499,
    image: "/products/shoes.jpg",
  },
  {
    id: 4,
    name: "Classic Analog Watch",
    category: "Accessories",
    subcategory: "Watch",
    price: 2999,
    image: "/products/watch.jpg",
  },
  {
    id: 5,
    name: "Premium Black T-Shirt",
    category: "Men",
    subcategory: "T-Shirt",
    price: 999,
    image: "/products/black-tshirt.jpg",
  },
  {
    id: 6,
    name: "Classic Denim Jacket",
    category: "Men",
    subcategory: "Jacket",
    price: 2199,
    image: "/products/denim-jacket.jpg",
  },
  {
    id: 7,
    name: "Comfort Casual Hoodie",
    category: "Men",
    subcategory: "Hoodie",
    price: 1899,
    image: "/products/hoodie.jpg",
  },
  {
    id: 8,
    name: "Premium Polo T-Shirt",
    category: "Men",
    subcategory: "Polo",
    price: 1299,
    image: "/products/polo.jpg",
  },
  {
    id: 9,
    name: "Elegant Floral Dress",
    category: "Women",
    subcategory: "Dress",
    price: 1999,
    image: "/products/floral-dress.jpg",
  },
  {
    id: 10,
    name: "Designer Party Dress",
    category: "Women",
    subcategory: "Dress",
    price: 2499,
    image: "/products/party-dress.jpg",
  },
  {
    id: 11,
    name: "Traditional Silk Saree",
    category: "Women",
    subcategory: "Saree",
    price: 3499,
    image: "/products/silk-saree.jpg",
  },
  {
    id: 12,
    name: "Designer Banarasi Saree",
    category: "Women",
    subcategory: "Saree",
    price: 4999,
    image: "/products/banarasi-saree.jpg",
  },
];


// ======================================================
// HOME PAGE
// ======================================================

function Home() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("wishlist")
      ) || [];
    } catch {
      return [];
    }
  });


  useEffect(() => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);


  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return currentWishlist.filter(
          (item) => item.id !== product.id
        );
      }

      return [
        ...currentWishlist,
        product,
      ];
    });
  };


  const isWishlisted = (id) => {
    return wishlist.some(
      (item) => item.id === id
    );
  };


  const openProduct = (product) => {
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    navigate("/product");
  };


  return (
    <div className="app">

      {/* ==================================================
          NAVBAR
          ================================================== */}

      <nav className="navbar">

        <div
          className="brand-logo"
          onClick={() => navigate("/")}
        >

          <div className="brand-monogram">
            KQLF
          </div>

          <div className="brand-name">
            KING & QUEEN

            <span>
              LUXURY FASHION
            </span>
          </div>

        </div>


        <div className="nav-links">

          <button
            onClick={() => navigate("/")}
          >
            Home
          </button>


          <button
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Products
          </button>


          <button
            onClick={() =>
              navigate("/try-on")
            }
          >
            ✨ KQLF AI FIT
          </button>


          <button
            onClick={() =>
              navigate("/wishlist")
            }
          >
            ❤️ Wishlist

            {wishlist.length > 0 &&
              ` (${wishlist.length})`}
          </button>


          <button
            onClick={() =>
              navigate("/cart")
            }
          >
            🛒 Cart
          </button>

        </div>

      </nav>


      {/* ==================================================
          HERO
          ================================================== */}

      <section className="hero">

        {/* LEFT SIDE */}

        <div className="hero-content">

          <p className="hero-label">
            ✦ KQLF • KING & QUEEN LUXURY FASHION
          </p>


          <h1>
            RULE YOUR
            <span>
              STYLE.
            </span>
          </h1>


          <p className="hero-description">
            Discover luxury fashion made for
            every King and Queen. Your favorite
            looks virtually before you buy.
          </p>


          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() =>
                navigate("/try-on")
              }
            >
              ✨ Try On with KQLF AI
            </button>


            <button
              className="secondary-button"
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore Products
            </button>

          </div>

        </div>


        {/* ==================================================
            YOUR KQLF LOGO
            ================================================== */}

        <div className="hero-visual">

          <img
            src="/kqlf-logo.png"
            alt="KQLF King and Queen Luxury Fashion"
            className="kqlf-logo-image"
          />

        </div>

      </section>


      {/* ==================================================
          FEATURES
          ================================================== */}

      <section className="features">

        <div className="feature">

          <div className="feature-icon">
            ✨
          </div>

          <h3>
            KQLF AI FIT
          </h3>

          <p>
            See how clothes look on you
            before buying.
          </p>

        </div>


        <div className="feature">

          <div className="feature-icon">
            🛍️
          </div>

          <h3>
            Shop Your Style
          </h3>

          <p>
            Discover products selected
            for your style.
          </p>

        </div>


        <div className="feature">

          <div className="feature-icon">
            ❤️
          </div>

          <h3>
            Save Favorites
          </h3>

          <p>
            Save products you love
            to your wishlist.
          </p>

        </div>

      </section>


      {/* ==================================================
          FEATURED PRODUCTS
          ================================================== */}

      <section
        className="products-section"
        id="products"
      >

        <div className="section-header">

          <div>

            <p className="section-label">
              OUR COLLECTION
            </p>

            <h2>
              Featured Products
            </h2>

          </div>

          <p>
            Explore our latest styles
          </p>

        </div>


        <div className="products-grid">

          {products.map((product) => {

            const liked =
              isWishlisted(product.id);

            return (

              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-image">

                  <img
                    src={product.image}
                    alt={product.name}
                  />


                  <button
                    className="wishlist-heart"
                    onClick={() =>
                      toggleWishlist(product)
                    }
                  >
                    {liked
                      ? "❤️"
                      : "♡"}
                  </button>

                </div>


                <div className="product-info">

                  <p className="product-category">
                    {product.category}
                    {" • "}
                    {product.subcategory}
                  </p>


                  <h3>
                    {product.name}
                  </h3>


                  <div className="product-bottom">

                    <strong>
                      ₹
                      {product.price.toLocaleString(
                        "en-IN"
                      )}
                    </strong>


                    <button
                      onClick={() =>
                        openProduct(product)
                      }
                    >
                      View Product →
                    </button>

                  </div>


                  <button
                    className="wishlist-text-button"
                    onClick={() =>
                      toggleWishlist(product)
                    }
                  >
                    {liked
                      ? "❤️ Saved to Wishlist"
                      : "♡ Add to Wishlist"}
                  </button>

                </div>

              </div>

            );
          })}

        </div>

      </section>


      {/* ==================================================
          CTA
          ================================================== */}

      <section className="cta">

        <p>
          RULE YOUR STYLE.
        </p>


        <h2>
          Try it. See it. Rule it.
        </h2>


        <button
          onClick={() =>
            navigate("/try-on")
          }
        >
          Try KQLF AI FIT ✨
        </button>

      </section>


      {/* ==================================================
          FOOTER
          ================================================== */}

      <footer>

        <div className="footer-brand">
          KQLF
        </div>


        <p>
          KING & QUEEN LUXURY FASHION
        </p>


        <p className="footer-motto">
          RULE YOUR STYLE. TRY IT. SEE IT. RULE IT.
        </p>


        <p className="copyright">
          © 2026 KQLF. All rights reserved.
        </p>

      </footer>

    </div>
  );
}


// ======================================================
// APP ROUTER
// ======================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/product"
          element={<ProductDetails />}
        />

        <Route
          path="/try-on"
          element={<TryOn />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App; 