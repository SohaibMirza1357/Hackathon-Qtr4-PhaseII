import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.environ["DATABASE_URL"]
BETTER_AUTH_SECRET: str = os.environ["BETTER_AUTH_SECRET"]
FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
