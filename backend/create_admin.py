import pymysql
import os
from dotenv import load_dotenv  # type: ignore
from werkzeug.security import generate_password_hash

load_dotenv() # Load environment variables from .env file

# Create an admin account with the specified username and password
username = "admin"
password = "nightwave2026"

connection = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT", 3306))
)
# Create the admin account
try:
    with connection.cursor() as cursor:
        password_hash = generate_password_hash(password)
        cursor.execute(
            """
            INSERT INTO admins (username, password_hash)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
            """,
            (username, password_hash),
        )
    connection.commit()
    print(f"Admin account created/updated successfully: {username}")
finally:
    connection.close()