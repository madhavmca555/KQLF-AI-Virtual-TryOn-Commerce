import { useEffect, useRef, useState } from "react";

function TryOn() {
  const [product, setProduct] = useState(null);

  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadStatus, setUploadStatus] = useState("");
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Camera
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("user");
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  // ==========================================
  // LOAD SELECTED PRODUCT
  // ==========================================

  useEffect(() => {
    const savedProduct =
      localStorage.getItem("selectedProduct");

    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    } else {
      setProduct({
        id: 1,
        name: "Premium Casual Shirt",
        category: "Men",
        subcategory: "Shirt",
        price: 1499,
        image: "/products/shirt.jpg",
      });
    }
  }, []);


  // ==========================================
  // PHOTO REQUIREMENTS
  // ==========================================

  const getPhotoInstructions = () => {
    if (!product) {
      return [
        "Use a clear, well-lit photo",
        "Keep your body clearly visible",
        "Face the camera",
      ];
    }

    const type =
      product.subcategory?.toLowerCase() || "";

    if (
      type.includes("pant") ||
      type.includes("dress") ||
      type.includes("saree")
    ) {
      return [
        "Use a full-body photo",
        "Keep your waist and legs visible",
        "Stand straight and face the camera",
        "Use good lighting",
      ];
    }

    if (type.includes("shoe")) {
      return [
        "Make sure both feet are visible",
        "Use a full-body or legs-and-feet photo",
        "Stand straight",
        "Use good lighting",
      ];
    }

    if (
      type.includes("shirt") ||
      type.includes("t-shirt") ||
      type.includes("polo") ||
      type.includes("jacket") ||
      type.includes("hoodie")
    ) {
      return [
        "Keep your upper body clearly visible",
        "Face the camera",
        "Keep your shoulders visible",
        "Use good lighting",
      ];
    }

    return [
      "Use a clear photo",
      "Keep your body clearly visible",
      "Face the camera",
      "Use good lighting",
    ];
  };


  // ==========================================
  // FILE UPLOAD
  // ==========================================

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setImage(URL.createObjectURL(file));

    setUploadStatus("");
    setTryOnResult(null);
    setCapturedImage(null);
  };


  // ==========================================
  // OPEN CAMERA
  // ==========================================

  const openCamera = async () => {
    try {
      setUploadStatus(
        "Requesting camera permission..."
      );

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      setCameraStream(stream);
      setShowCamera(true);
      setCapturedImage(null);
      setUploadStatus("");

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current
            .play()
            .catch((error) => {
              console.error(
                "Video play error:",
                error
              );
            });
        }
      }, 100);
    } catch (error) {
      console.error(
        "Camera Error:",
        error
      );

      setUploadStatus(
        "Camera access was denied or is not available. Please allow camera permission or use Upload Photo."
      );
    }
  };


  // ==========================================
  // STOP CAMERA
  // ==========================================

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream
        .getTracks()
        .forEach((track) => track.stop());
    }

    setCameraStream(null);
    setShowCamera(false);
  };


  // ==========================================
  // SWITCH CAMERA
  // ==========================================

  const switchCamera = async () => {
    const newFacing =
      cameraFacing === "user"
        ? "environment"
        : "user";

    if (cameraStream) {
      cameraStream
        .getTracks()
        .forEach((track) => track.stop());
    }

    setCameraFacing(newFacing);

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: newFacing,
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }
    } catch (error) {
      console.error(
        "Switch camera error:",
        error
      );

      setUploadStatus(
        "Unable to switch camera."
      );
    }
  };


  // ==========================================
  // CAPTURE PHOTO
  // ==========================================

  const capturePhoto = () => {
    if (
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    if (cameraFacing === "user") {
      context.translate(
        canvas.width,
        0
      );

      context.scale(-1, 1);
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setUploadStatus(
            "Could not capture photo."
          );

          return;
        }

        const file = new File(
          [blob],
          "camera-photo.jpg",
          {
            type: "image/jpeg",
          }
        );

        const previewUrl =
          URL.createObjectURL(blob);

        setSelectedFile(file);
        setCapturedImage(previewUrl);
        setImage(previewUrl);
        setTryOnResult(null);

        stopCamera();

        setUploadStatus(
          "Photo captured successfully! You can use it or retake it."
        );
      },
      "image/jpeg",
      0.92
    );
  };


  // ==========================================
  // RETAKE
  // ==========================================

  const retakePhoto = async () => {
    setCapturedImage(null);
    setImage(null);
    setSelectedFile(null);
    setUploadStatus("");

    await openCamera();
  };


  // ==========================================
  // UPLOAD PHOTO TO BACKEND
  // ==========================================

  const uploadPhoto = async () => {
    if (!selectedFile) {
      setUploadStatus(
        "Please choose or take your photo first."
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedFile
    );

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/upload-photo",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Upload failed"
        );
      }

      setUploadStatus(
        `Photo uploaded successfully: ${
          data.filename ||
          selectedFile.name
        }`
      );
    } catch (error) {
      console.error(
        "Upload Error:",
        error
      );

      setUploadStatus(
        "Could not connect to the backend."
      );
    }
  };


  // ==========================================
  // AI TRY-ON
  // ==========================================

  const tryOnWithAI = async () => {
    if (!selectedFile) {
      setUploadStatus(
        "Please choose or take your photo first."
      );

      return;
    }

    if (!product) {
      setUploadStatus(
        "Please select a product first."
      );

      return;
    }

    setIsProcessing(true);
    setTryOnResult(null);

    setUploadStatus(
      "🤖 AI is processing your try-on..."
    );

    try {
      const formData =
        new FormData();

      // Customer photo
      formData.append(
        "customer_image",
        selectedFile
      );

      // Get selected product image
      const productResponse =
        await fetch(
          product.image
        );

      if (!productResponse.ok) {
        throw new Error(
          "Could not load product image."
        );
      }

      const productBlob =
        await productResponse.blob();

      // Selected product
      formData.append(
        "product_image",
        productBlob,
        product.image
          .split("/")
          .pop() || "product.jpg"
      );

      // Send request
      const response =
        await fetch(
          "http://127.0.0.1:8000/try-on",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(
        "Backend Try-On response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "AI Try-On failed"
        );
      }

      if (!data.success) {
        const details =
          data.details
            ? JSON.stringify(
                data.details
              )
            : "";

        throw new Error(
          `${
            data.message ||
            "AI Try-On failed"
          } ${details}`
        );
      }

      if (!data.image_url) {
        throw new Error(
          "AI result image was not returned."
        );
      }

      setTryOnResult(
        data.image_url
      );

      setUploadStatus(
        "✨ AI Virtual Try-On completed successfully!"
      );

    } catch (error) {
      console.error(
        "Try-On Error:",
        error
      );

      // ======================================
      // FRIENDLY QUOTA ERROR
      // ======================================

      const errorMessage =
        error.message || "";

      if (
        errorMessage.includes(
          "QUOTA_EXCEEDED"
        ) ||
        errorMessage.includes(
          "monthly try-ons"
        ) ||
        errorMessage.includes(
          "plan's monthly"
        ) ||
        errorMessage.includes(
          "monthly"
        ) &&
        errorMessage.includes(
          "try-ons"
        )
      ) {
        setUploadStatus(
          "⚠️ AI Try-On is temporarily unavailable. We've reached the current AI processing limit. Please try again later."
        );
      } else {
        setUploadStatus(
          "⚠️ We couldn't process the AI Try-On right now. Please check your photo and try again."
        );
      }

    } finally {
      setIsProcessing(false);
    }
  };


  // ==========================================
  // CAMERA CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, [cameraStream]);


  // ==========================================
  // LOADING
  // ==========================================

  if (!product) {
    return (
      <div className="try-on-page">
        <h1>
          Loading...
        </h1>
      </div>
    );
  }


  const photoInstructions =
    getPhotoInstructions();


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="try-on-page">

      <h1>
        AI Virtual Try-On ✨
      </h1>

      <p>
        See how the selected product
        may look on you.
      </p>


      {/* SELECTED PRODUCT */}

      <div className="selected-product">

        <h2>
          Selected Product
        </h2>

        <img
          src={product.image}
          alt={product.name}
        />

        <h3>
          {product.name}
        </h3>

        <p>
          ₹
          {product.price.toLocaleString(
            "en-IN"
          )}
        </p>

      </div>


      {/* PHOTO REQUIREMENTS */}

      <div
        className="upload-section"
        style={{
          textAlign: "left",
        }}
      >

        <h2>
          📸 Photo Requirements
        </h2>

        <p>
          For the best AI Try-On result:
        </p>

        <ul
          style={{
            lineHeight: "1.9",
            color: "#555",
          }}
        >
          {photoInstructions.map(
            (instruction, index) => (
              <li key={index}>
                {instruction}
              </li>
            )
          )}
        </ul>

      </div>


      {/* PHOTO OPTIONS */}

      {!showCamera && !image && (

        <div className="upload-section">

          <h2>
            Add Your Photo
          </h2>

          <p>
            Upload an existing photo or
            take a new photo using your
            camera.
          </p>


          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              justifyContent:
                "center",
              marginTop: "25px",
            }}
          >

            {/* UPLOAD */}

            <label
              style={{
                display: "inline-block",
                padding: "15px 22px",
                background:
                  "#ffffff",
                color: "#171717",
                border:
                  "1px solid #171717",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              📁 Upload Photo

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
                style={{
                  display: "none",
                }}
              />

            </label>


            {/* CAMERA */}

            <button
              onClick={openCamera}
              style={{
                padding:
                  "15px 22px",
                border: "none",
                borderRadius:
                  "10px",
                background:
                  "#171717",
                color: "#ffffff",
                fontWeight:
                  "700",
              }}
            >
              📷 Take Photo
            </button>

          </div>

        </div>

      )}


      {/* CAMERA */}

      {showCamera && (

        <div className="upload-section">

          <h2>
            📷 Take Your Photo
          </h2>

          <p>
            Position yourself inside
            the camera frame.
          </p>


          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              margin: "20px auto",
              background: "#111",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                display: "block",
                maxHeight: "650px",
                objectFit: "cover",
                transform:
                  cameraFacing === "user"
                    ? "scaleX(-1)"
                    : "none",
              }}
            />

          </div>


          {/* CAMERA BUTTONS */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent:
                "center",
            }}
          >

            <button
              onClick={
                capturePhoto
              }
              style={{
                padding:
                  "15px 25px",
                border: "none",
                borderRadius:
                  "50px",
                background:
                  "#171717",
                color: "#ffffff",
                fontWeight:
                  "700",
              }}
            >
              📸 Capture Photo
            </button>


            <button
              onClick={
                switchCamera
              }
              style={{
                padding:
                  "15px 20px",
                border:
                  "1px solid #171717",
                borderRadius:
                  "10px",
                background:
                  "#ffffff",
                color:
                  "#171717",
                fontWeight:
                  "700",
              }}
            >
              🔄 Switch Camera
            </button>


            <button
              onClick={
                stopCamera
              }
              style={{
                padding:
                  "15px 20px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "10px",
                background:
                  "#ffffff",
                color:
                  "#555",
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}


      {/* HIDDEN CANVAS */}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />


      {/* PHOTO PREVIEW */}

      {image && !showCamera && (

        <div className="customer-photo">

          <h2>
            👤 Your Photo
          </h2>

          <img
            src={image}
            alt="Your photo"
          />


          {capturedImage && (

            <p
              style={{
                color: "#16803c",
                fontWeight: "600",
              }}
            >
              ✓ Photo captured
              successfully
            </p>

          )}


          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent:
                "center",
              marginTop: "15px",
            }}
          >

            {/* RETAKE */}

            {capturedImage && (

              <button
                onClick={
                  retakePhoto
                }
              >
                🔄 Retake Photo
              </button>

            )}


            {/* UPLOAD */}

            <button
              onClick={
                uploadPhoto
              }
            >
              ⬆️ Upload Photo
            </button>

          </div>

        </div>

      )}


      {/* STATUS */}

      {uploadStatus && (

        <p
          className="status"
          style={{
            margin:
              "20px auto",
            maxWidth:
              "700px",
          }}
        >
          {uploadStatus}
        </p>

      )}


      {/* TRY ON */}

      {image && !showCamera && (

        <div
          style={{
            marginTop: "20px",
          }}
        >

          <button
            onClick={
              tryOnWithAI
            }
            disabled={
              isProcessing
            }
          >

            {isProcessing
              ? "🤖 Processing..."
              : "✨ Try On with AI"}

          </button>

        </div>

      )}


      {/* AI RESULT */}

      {tryOnResult && (

        <div className="try-on-result">

          <h2>
            ✨ AI Try-On Result
          </h2>


          <img
            src={tryOnResult}
            alt="AI Virtual Try-On Result"
          />


          <div
            className="result-buttons"
            style={{
              display: "flex",
              gap: "12px",
              justifyContent:
                "center",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >

            <button
              onClick={() => {
                window.location.href =
                  "/cart";
              }}
            >
              🛒 Go to Cart
            </button>


            <button
              onClick={() => {
                setTryOnResult(null);
                setUploadStatus("");
              }}
            >
              🔄 Try Again
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default TryOn; 