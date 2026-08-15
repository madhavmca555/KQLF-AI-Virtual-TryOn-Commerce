import os
import uuid
import shutil
from pathlib import Path

from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from gradio_client import Client, handle_file


# ============================================================
# KQLF AI VIRTUAL TRY-ON BACKEND
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

RESULTS_DIR = BASE_DIR / "results"
UPLOADS_DIR = BASE_DIR / "uploads"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv(BASE_DIR / ".env")

HF_TOKEN = os.getenv("HF_TOKEN")

if HF_TOKEN:
    print("Hugging Face token loaded successfully.")
else:
    print("WARNING: HF_TOKEN is missing from .env")


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="KQLF AI Virtual Try-On API",
    description="AI-powered virtual fashion try-on backend",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC RESULTS
# ============================================================

app.mount(
    "/results",
    StaticFiles(directory=str(RESULTS_DIR)),
    name="results"
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
async def root():

    return {
        "success": True,
        "message": "KQLF AI Virtual Try-On Backend is running",
        "service": "IDM-VTON",
        "status": "online"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health():

    return {
        "success": True,
        "status": "healthy"
    }


# ============================================================
# SAVE UPLOADED FILE
# ============================================================

async def save_upload_file(
    upload_file: UploadFile,
    destination: Path
):

    with destination.open("wb") as buffer:

        while True:

            chunk = await upload_file.read(
                1024 * 1024
            )

            if not chunk:
                break

            buffer.write(chunk)

    return destination


# ============================================================
# UPLOAD PHOTO
# ============================================================

@app.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...)
):

    print()
    print("=" * 60)
    print("PHOTO UPLOAD")
    print("=" * 60)

    print("File:", file.filename)

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    if extension not in allowed_extensions:

        return {
            "success": False,
            "message": (
                "Invalid image format. "
                "Please upload JPG, JPEG, PNG or WEBP."
            )
        }

    filename = (
        f"person_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    output_path = RESULTS_DIR / filename

    try:

        await save_upload_file(
            file,
            output_path
        )

        print(
            "Photo saved:",
            output_path
        )

        return {
            "success": True,
            "message": "Photo uploaded successfully.",
            "filename": filename
        }

    except Exception as e:

        print(
            "Upload error:",
            str(e)
        )

        return {
            "success": False,
            "message": "Could not save photo.",
            "error": str(e)
        }


# ============================================================
# CONNECT TO IDM-VTON
# ============================================================

def connect_to_idm_vton():

    print()
    print("=" * 60)
    print("Connecting to Hugging Face IDM-VTON...")
    print("=" * 60)

    try:

        if HF_TOKEN:

            client = Client(
                "yisol/IDM-VTON",
                token=HF_TOKEN
            )

        else:

            client = Client(
                "yisol/IDM-VTON"
            )

        print(
            "Connected to IDM-VTON."
        )

        return client

    except Exception as e:

        print(
            "IDM-VTON connection failed:",
            str(e)
        )

        raise


# ============================================================
# SAVE GENERATED RESULT
# ============================================================

def save_generated_result(
    result_file,
    request_id
):

    output_filename = (
        f"tryon_{request_id}.png"
    )

    output_path = (
        RESULTS_DIR / output_filename
    )

    # --------------------------------------------------------
    # STRING PATH
    # --------------------------------------------------------

    if isinstance(
        result_file,
        str
    ):

        source_path = Path(
            result_file
        )

        if source_path.exists():

            shutil.copy2(
                source_path,
                output_path
            )

            return output_filename

        # Could be a remote URL
        if result_file.startswith(
            "http://"
        ) or result_file.startswith(
            "https://"
        ):

            return result_file

    # --------------------------------------------------------
    # DICTIONARY
    # --------------------------------------------------------

    if isinstance(
        result_file,
        dict
    ):

        possible_path = (
            result_file.get("path")
            or result_file.get("url")
        )

        if possible_path:

            source_path = Path(
                possible_path
            )

            if source_path.exists():

                shutil.copy2(
                    source_path,
                    output_path
                )

                return output_filename

            return possible_path

    return None


# ============================================================
# AI VIRTUAL TRY-ON
# ============================================================

@app.post("/try-on")
async def try_on(

    customer_image: UploadFile = File(...),

    product_image: UploadFile = File(...),

    garment_description: str = Form(
        "A fashionable clothing garment"
    )

):

    request_id = uuid.uuid4().hex

    print()
    print("=" * 70)
    print("STARTING AI VIRTUAL TRY-ON")
    print("=" * 70)

    print(
        "Request ID:",
        request_id
    )

    print(
        "Customer image:",
        customer_image.filename
    )

    print(
        "Product image:",
        product_image.filename
    )

    print(
        "Garment description:",
        garment_description
    )

    # ========================================================
    # VALIDATE EXTENSIONS
    # ========================================================

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    customer_extension = Path(
        customer_image.filename or ""
    ).suffix.lower()

    product_extension = Path(
        product_image.filename or ""
    ).suffix.lower()

    if customer_extension not in allowed_extensions:

        return {
            "success": False,
            "message": (
                "Invalid customer image format."
            )
        }

    if product_extension not in allowed_extensions:

        return {
            "success": False,
            "message": (
                "Invalid product image format."
            )
        }

    # ========================================================
    # CREATE FILE NAMES
    # ========================================================

    customer_filename = (
        f"customer_{request_id}"
        f"{customer_extension}"
    )

    product_filename = (
        f"garment_{request_id}"
        f"{product_extension}"
    )

    customer_path = (
        UPLOADS_DIR / customer_filename
    )

    product_path = (
        UPLOADS_DIR / product_filename
    )

    # ========================================================
    # SAVE INPUT FILES
    # ========================================================

    try:

        print()
        print("Saving uploaded images...")

        await save_upload_file(
            customer_image,
            customer_path
        )

        await save_upload_file(
            product_image,
            product_path
        )

        print(
            "Customer image saved:",
            customer_path
        )

        print(
            "Product image saved:",
            product_path
        )

    except Exception as e:

        print(
            "Error saving images:",
            str(e)
        )

        return {
            "success": False,
            "message": "Could not save uploaded images.",
            "error": str(e)
        }

    # ========================================================
    # CONNECT TO IDM-VTON
    # ========================================================

    try:

        client = connect_to_idm_vton()

    except Exception as e:

        return {
            "success": False,
            "message": (
                "Could not connect to "
                "Hugging Face IDM-VTON."
            ),
            "error": str(e)
        }

    # ========================================================
    # PREPARE IDM-VTON INPUTS
    # ========================================================

    try:

        print()
        print(
            "Preparing images for IDM-VTON..."
        )

        # IDM-VTON uses an ImageEditor-style input.
        #
        # background = customer/person image
        # layers     = no manually painted mask
        # composite  = none
        #
        # Auto masking is enabled below.

        person_input = {

            "background": handle_file(
                str(customer_path)
            ),

            "layers": [],

            "composite": None
        }

        garment_input = handle_file(
            str(product_path)
        )

        print(
            "Images prepared successfully."
        )

    except Exception as e:

        print(
            "Image preparation error:",
            str(e)
        )

        return {
            "success": False,
            "message": (
                "Could not prepare images "
                "for IDM-VTON."
            ),
            "error": str(e)
        }

    # ========================================================
    # CALL IDM-VTON
    # ========================================================

    print()
    print("=" * 60)
    print("Sending images to IDM-VTON...")
    print("=" * 60)

    try:

        result = client.predict(

            dict=person_input,

            garm_img=garment_input,

            garment_des=garment_description,

            is_checked=True,

            is_checked_crop=False,

            denoise_steps=30,

            seed=42,

            api_name="/tryon"

        )

        print()
        print(
            "IDM-VTON response received."
        )

        print(
            "Response type:",
            type(result)
        )

        print(
            "Response:",
            result
        )

    except Exception as e:

        print()
        print("=" * 70)
        print("IDM-VTON ERROR")
        print("=" * 70)

        print(
            "Error:",
            str(e)
        )

        print("=" * 70)

        return {
            "success": False,
            "message": (
                "IDM-VTON could not "
                "process the images."
            ),
            "error": str(e)
        }

    # ========================================================
    # CHECK RESPONSE
    # ========================================================

    if not result:

        print(
            "IDM-VTON returned no result."
        )

        return {
            "success": False,
            "message": (
                "IDM-VTON returned no result."
            )
        }

    # ========================================================
    # EXTRACT GENERATED IMAGE
    # ========================================================

    try:

        generated_image = result[0]

        print()
        print(
            "Generated image:"
        )

        print(
            generated_image
        )

    except Exception as e:

        print(
            "Could not extract generated image:",
            str(e)
        )

        return {
            "success": False,
            "message": (
                "Could not extract "
                "the generated image."
            ),
            "error": str(e)
        }

    # ========================================================
    # SAVE GENERATED IMAGE
    # ========================================================

    try:

        saved_result = save_generated_result(
            generated_image,
            request_id
        )

    except Exception as e:

        print(
            "Error saving generated image:",
            str(e)
        )

        return {
            "success": False,
            "message": (
                "Could not save "
                "the generated image."
            ),
            "error": str(e)
        }

    if not saved_result:

        print(
            "Unknown generated image format."
        )

        return {
            "success": False,
            "message": (
                "IDM-VTON returned an "
                "unsupported image format."
            ),
            "details": str(
                generated_image
            )
        }

    # ========================================================
    # CREATE IMAGE URL
    # ========================================================

    if saved_result.startswith(
        "http://"
    ) or saved_result.startswith(
        "https://"
    ):

        image_url = saved_result

    else:

        image_url = (
            "http://127.0.0.1:8000"
            f"/results/{saved_result}"
        )

    # ========================================================
    # SUCCESS
    # ========================================================

    print()
    print("=" * 70)
    print("AI VIRTUAL TRY-ON SUCCESS")
    print("=" * 70)

    print(
        "Image URL:",
        image_url
    )

    print("=" * 70)
    print()

    # IMPORTANT:
    #
    # Your existing TryOn.jsx expects:
    #
    # data.image_url
    #
    # so we return image_url here.

    return {

        "success": True,

        "message": (
            "AI Virtual Try-On "
            "completed successfully."
        ),

        "image_url": image_url

    }


# ============================================================
# SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    print()
    print("=" * 70)
    print("KQLF AI VIRTUAL TRY-ON BACKEND")
    print("=" * 70)

    print(
        "Backend directory:",
        BASE_DIR
    )

    print(
        "Results directory:",
        RESULTS_DIR
    )

    print(
        "Uploads directory:",
        UPLOADS_DIR
    )

    print(
        "Starting FastAPI server..."
    )

    print(
        "URL: http://127.0.0.1:8000"
    )

    print("=" * 70)
    print()

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 