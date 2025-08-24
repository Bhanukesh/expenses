# run_app.py

import uvicorn
import os

if __name__ == "__main__":
    # Retrieve the PORT environment variable if it exists, otherwise default to 8000
    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "main:app",
        host="127.0.0.1",  # Changed from 0.0.0.0 to 127.0.0.1 for local development
        port=port,
        workers=1, # Can only be 1 since we are using an in-memory database
        reload=False  # Set to False in production
    )
