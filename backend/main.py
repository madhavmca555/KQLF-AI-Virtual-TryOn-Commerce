import os
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from gradio_client import Client, handle_file


# ==========================================
# ENVIRONMENT
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ENV_FILE = os.path.join(
    BASE_DIR,
    ".env"
)

load_dotenv(ENV_FILE)


# ==========================================
# APP
# ==========================================

app = FastAPI(
    title="StyleAI Backend",
    description="AI-powered e-commerce and virtual try-on backend",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# RESULT FOLDER
# ==========================================

RESULT_DIR = os.path.join(
    BASE_DIR,
    "results"
)

os.makedirs(
    RESULT_DIR,
    exist_ok=True
)


# Make /results/... accessible
app.mount(
    "/results",
    StaticFiles(directory=RESULT_DIR),
    name="results"
)


# ==========================================
# HUGGING FACE IDM-VTON
# ==========================================

HF_TOKEN = os.getenv("HF_TOKEN")

if HF_TOKEN:
    print("Hugging Face token loaded successfully.")
else:
    print("WARNING: HF_TOKEN is missing from .env")


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "StyleAI Backend is running"
    }


# ==========================================
# HEALTH
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================
# UPLOAD PHOTO
# ==========================================

@app.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...)
):

    return {

        "success": True,

        "message":
            "Photo uploaded successfully",

        "filename":
            file.filename
    }


# ==========================================
# AI TRY-ON
# ==========================================

@app.post("/try-on")
async def try_on(
    customer_image: UploadFile = File(...),
    product_image: UploadFile = File(...)
):

    # --------------------------------------
    # Check Hugging Face token
    # --------------------------------------

    if not HF_TOKEN:

        return {

            "success": False,

            "message":
                "HF_TOKEN is missing from .env"

        }


    print(
        "Starting AI Virtual Try-On..."
    )


    # --------------------------------------
    # Temporary files
    # --------------------------------------

    customer_filename = (
        f"person_{uuid.uuid4().hex}.jpg"
    )

    product_filename = (
        f"garment_{uuid.uuid4().hex}.jpg"
    )


    customer_path = os.path.join(
        RESULT_DIR,
        customer_filename
    )

    product_path = os.path.join(
        RESULT_DIR,
        product_filename
    )


    # --------------------------------------
    # Read images
    # --------------------------------------

    try:

        customer_data = (
            await customer_image.read()
        )

        product_data = (
            await product_image.read()
        )

    except Exception as error:

        print(
            "Image reading error:",
            error
        )

        return {

            "success": False,

            "message":
                "Could not read uploaded images",

            "error":
                str(error)

        }


    # --------------------------------------
    # Validate images
    # --------------------------------------

    if not customer_data:

        return {

            "success": False,

            "message":
                "Customer image is empty"

        }


    if not product_data:

        return {

            "success": False,

            "message":
                "Product image is empty"

        }


    # --------------------------------------
    # Save temporary images
    # --------------------------------------

    try:

        with open(
            customer_path,
            "wb"
        ) as file:

            file.write(
                customer_data
            )


        with open(
            product_path,
            "wb"
        ) as file:

            file.write(
                product_data
            )


    except Exception as error:

        print(
            "File save error:",
            error
        )

        return {

            "success": False,

            "message":
                "Could not save uploaded images",

            "error":
                str(error)

        }


    print(
        "Customer image:",
        customer_path
    )

    print(
        "Product image:",
        product_path
    )


    # ======================================
    # CONNECT TO IDM-VTON
    # ======================================

    try:

        print(
            "Connecting to Hugging Face IDM-VTON..."
        )


        client = Client(
            "yisol/IDM-VTON",
            token=HF_TOKEN
        )


        print(
            "Connected to IDM-VTON."
        )


        # ----------------------------------
        # Person image structure
        # ----------------------------------

        person_image = {

            "background":
                customer_path,

            "layers": [],

            "composite":
                customer_path

        }


        # ----------------------------------
        # Garment description
        # ----------------------------------

        garment_description = (
            "A fashionable clothing item "
            "for an e-commerce virtual "
            "try-on."
        )


        # ----------------------------------
        # Call IDM-VTON
        # ----------------------------------

        print(
            "Sending images to IDM-VTON..."
        )


        result = client.predict(

            person_image,

            handle_file(
                product_path
            ),

            garment_description,

            True,

            False,

            30,

            42,

            api_name="/tryon"

        )


        print(
            "IDM-VTON response received."
        )


        # ----------------------------------
        # Extract generated image
        # ----------------------------------

        if not result:

            return {

                "success": False,

                "message":
                    "IDM-VTON returned no result"

            }


        output_file = result[0]


        if not output_file:

            return {

                "success": False,

                "message":
                    "AI result image was empty"

            }


        print(
            "Generated result:",
            output_file
        )


        # ==================================
        # COPY RESULT TO OUR RESULTS FOLDER
        # ==================================

        final_filename = (
            f"tryon_{uuid.uuid4().hex}.png"
        )


        final_path = os.path.join(
            RESULT_DIR,
            final_filename
        )


        # ----------------------------------
        # Copy generated file
        # ----------------------------------

        with open(
            output_file,
            "rb"
        ) as source_file:

            generated_data = (
                source_file.read()
            )


        with open(
            final_path,
            "wb"
        ) as result_file:

            result_file.write(
                generated_data
            )


        # ----------------------------------
        # Browser URL
        # ----------------------------------

        result_url = (
            "http://127.0.0.1:8000/"
            f"results/{final_filename}"
        )


        print(
            "AI result saved:",
            final_path
        )


        # ==================================
        # SUCCESS
        # ==================================

        return {

            "success": True,

            "message":
                "AI Virtual Try-On completed",

            "image_url":
                result_url

        }


    # ======================================
    # ERROR HANDLING
    # ======================================

    except Exception as error:

        print(
            "IDM-VTON error:",
            error
        )


        return {

            "success": False,

            "message":
                "Could not process AI Try-On",

            "error":
                str(error)

        }


# ==========================================
# END
# ========================================== 