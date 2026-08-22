# Importing required libraries
from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import check_password_hash
from functools import wraps
import pymysql
import os
import re
from decimal import Decimal
from dotenv import load_dotenv  # type: ignore

# Load environment variables from .env
load_dotenv()


# Define paths for frontend and image directories
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)
IMAGE_DIR = os.path.join(FRONTEND_DIR, "images")

# Allow frontend to communicate with Flask
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "NightwaveClubSecretKey2026")

# Configuring session cookies
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None"
)

# Route to serve frontend files 
@app.route("/images/<path:filename>")
def product_image(filename):
    return send_from_directory(IMAGE_DIR, filename)

# Enable credentials for cross-origin session cookies
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://cst150-club-website.vercel.app/"
    ]
)

# Function to get a database connection
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

# Function to validate customer checkout information
def validate_customer_data(data):
    if not isinstance(data, dict):
        return "Invalid request data"
    email = data.get("email", "")
    phone = data.get("phone", "")
    suburb = data.get("suburb", "")

    # Check that values are strings
    if not isinstance(email, str):
        return "Invalid email address"

    if not isinstance(phone, str):
        return "Invalid phone number"

    if not isinstance(suburb, str):
        return "Invalid suburb"

    # Remove unnecessary spaces
    email = email.strip()
    phone = phone.strip()
    suburb = suburb.strip()

    # Validate email
    if not email:
        return "Email is required"

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return "Invalid email address"

    if len(email) > 150:
        return "Email is too long"

    # Validate phone
    if not phone:
        return "Phone number is required"

    if not re.match(r"^[0-9 +()\-]{8,20}$", phone):
        return "Invalid phone number"

    # Validate suburb
    if not suburb:
        return "Suburb is required"

    if len(suburb) > 100:
        return "Suburb is too long"

    return None


# Function to validate products and quantities
def validate_order_items(items):

    if not isinstance(items, list) or len(items) == 0:
        return "At least one product is required"

    for item in items:

        if not isinstance(item, dict):
            return "Invalid order item"

        product_id = item.get("product_id")
        quantity = item.get("quantity")

        # bool is technically an int in Python,
        # so explicitly reject boolean values
        if isinstance(product_id, bool) or not isinstance(product_id, int):
            return "Invalid product ID"

        if product_id <= 0:
            return "Product ID must be greater than zero"

        if isinstance(quantity, bool) or not isinstance(quantity, int):
            return "Quantity must be an integer"

        if quantity <= 0:
            return "Quantity must be greater than zero"

    return None

# Route for the home endpoint
@app.route("/")
def home():

    return jsonify({
        "message": "Nightwave Club API is running"
    })

# Route to test the database connection
@app.route("/api/test-db", methods=["GET"])
def test_db():
    connection = None
    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 AS database_test")
            result = cursor.fetchone()
        # Returning successful response 
        return jsonify({
            "success": True,
            "message": "Database connection successful",
            "result": result
        }), 200

    except Exception as e:
        print("Database error:", e)
        return jsonify({
            "success": False,
            "error": "Database connection failed"
        }), 500

    finally:
        if connection:
            connection.close()

# Route to retrieve products from the database
@app.route("/api/products", methods=["GET"])
def get_products():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    product_id,
                    product_title,
                    product_description,
                    sell_price,
                    cost_price,
                    product_image,
                    created_at
                FROM products
                ORDER BY product_id ASC
            """)

            products = cursor.fetchall()

        formatted_products = []

        for product in products:

            image = product["product_image"]

            # Make image path usable by frontend
            if image and not str(image).startswith("/"):
                image = "/images/" + str(image)

            formatted_products.append({
                # Original database fields
                "product_id": product["product_id"],
                "product_title": product["product_title"],
                "product_description": product["product_description"],
                "sell_price": float(product["sell_price"]),
                "cost_price": float(product["cost_price"]),
                "product_image": image,

                # Easier names for JavaScript
                "id": product["product_id"],
                "title": product["product_title"],
                "description": product["product_description"],
                "price": float(product["sell_price"]),
                "image": image
            })

        return jsonify({
            "success": True,
            "products": formatted_products
        }), 200

    except Exception as e:
        print("Product retrieval error:", e)

        return jsonify({
            "success": False,
            "error": "Unable to retrieve products"
        }), 500

    finally:
        if connection:
            connection.close()

# Route to create a new order
@app.route("/api/orders", methods=["POST"])
def create_order():

    connection = None

    try:
        # -----------------------------------------
        # Get request data
        # -----------------------------------------

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400

        # -----------------------------------------
        # Validate customer
        # -----------------------------------------

        customer_error = validate_customer_data(data)

        if customer_error:
            return jsonify({
                "success": False,
                "error": customer_error
            }), 400

        # -----------------------------------------
        # Validate items
        # -----------------------------------------

        items = data.get("items")

        items_error = validate_order_items(items)

        if items_error:
            return jsonify({
                "success": False,
                "error": items_error
            }), 400

        # -----------------------------------------
        # Connect to database
        # -----------------------------------------

        connection = get_db_connection()

        # Start transaction
        connection.begin()

        total_amount = Decimal("0.00")
        order_items = []

        # -----------------------------------------
        # Get product prices from DATABASE
        # -----------------------------------------

        with connection.cursor() as cursor:

            for item in items:

                product_id = item["product_id"]
                quantity = item["quantity"]

                cursor.execute("""
                    SELECT
                        product_id,
                        product_title,
                        cost_price,
                        sell_price
                    FROM products
                    WHERE product_id = %s
                """, (product_id,))

                product = cursor.fetchone()

                # Product doesn't exist
                if not product:

                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "error": f"Product {product_id} not found"
                    }), 404

                # -----------------------------------------
                # Get REAL price from MySQL
                # -----------------------------------------

                cost_price = Decimal(
                    str(product["cost_price"])
                )

                sale_price = Decimal(
                    str(product["sell_price"])
                )

                # -----------------------------------------
                # Calculate subtotal
                # -----------------------------------------

                subtotal = sale_price * quantity

                total_amount += subtotal

                order_items.append({
                    "product_id": product_id,
                    "quantity": quantity,
                    "cost_price": cost_price,
                    "sale_price": sale_price,
                    "subtotal": subtotal
                })

        # -----------------------------------------
        # Customer details
        # -----------------------------------------

        email = data["email"].strip()
        phone = data["phone"].strip()
        suburb = data["suburb"].strip()

        # -----------------------------------------
        # Insert customer
        # -----------------------------------------

        with connection.cursor() as cursor:

            cursor.execute("""
                INSERT INTO customers
                    (email, phone, suburb)
                VALUES
                    (%s, %s, %s)
            """, (
                email,
                phone,
                suburb
            ))

            customer_id = cursor.lastrowid

        # -----------------------------------------
        # Insert order
        # -----------------------------------------

        with connection.cursor() as cursor:

            cursor.execute("""
                INSERT INTO orders
                    (customer_id, total_amount, status)
                VALUES
                    (%s, %s, %s)
            """, (
                customer_id,
                total_amount,
                "Completed"
            ))

            order_id = cursor.lastrowid

        # -----------------------------------------
        # Insert order items
        # -----------------------------------------

        with connection.cursor() as cursor:

            for item in order_items:

                cursor.execute("""
                    INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        quantity,
                        cost_price,
                        sale_price,
                        subtotal
                    )
                    VALUES
                    (%s, %s, %s, %s, %s, %s)
                """, (
                    order_id,
                    item["product_id"],
                    item["quantity"],
                    item["cost_price"],
                    item["sale_price"],
                    item["subtotal"]
                ))

        # -----------------------------------------
        # Commit transaction
        # -----------------------------------------

        connection.commit()

        # -----------------------------------------
        # Successful response
        # -----------------------------------------

        return jsonify({
            "success": True,
            "message": "Order completed successfully",
            "order_id": order_id,
            "total": float(total_amount)
        }), 201

    except pymysql.MySQLError as e:

        print("MySQL order error:", e)

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "error": "Database error while completing order"
        }), 500

    except Exception as e:

        print("Order error:", e)

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "error": "Unable to complete order"
        }), 500

    finally:

        if connection:
            connection.close()

# Decorator to require admin authentication for certain routes
def admin_required(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):
        if not session.get("admin_id"):
            return jsonify({
                "success": False,
                "error": "Admin authentication required"
            }), 401
        return function(*args, **kwargs)
    return decorated_function

# Route for admin login 
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    connection = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        username = data.get("username")
        password = data.get("password")
        if not isinstance(username, str) or not username.strip():
            return jsonify({
                "success": False,
                "error": "Username is required"
            }), 400
        if not isinstance(password, str) or not password:

            return jsonify({
                "success": False,
                "error": "Password is required"
            }), 400
        username = username.strip()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""SELECT
                    admin_id,
                    username,
                    password_hash
                FROM admins
                WHERE username = %s""", (username,))
            admin = cursor.fetchone()
        if not admin:
            return jsonify({
                "success": False,
                "error": "Invalid username or password"
            }), 401

        if not check_password_hash(
            admin["password_hash"],
            password
        ):

            return jsonify({
                "success": False,
                "error": "Invalid username or password"
            }), 401

        session.clear()
        session["admin_id"] = admin["admin_id"]
        session["admin_username"] = admin["username"]

        return jsonify({
            "success": True,
            "message": "Admin login successful",
            "username": admin["username"]
        }), 200

    except Exception as e:
        print("Admin login error:", e)
        return jsonify({
            "success": False,
            "error": "Unable to process admin login"
        }), 500
    
    finally:
        if connection:
            connection.close()

# Route for admin logout
@app.route("/api/admin/logout", methods=["POST"])
@admin_required
def admin_logout():
    session.clear()
    return jsonify({
        "success": True,
        "message": "Admin logged out successfully"
    }), 200

# Route to check admin authentication status
@app.route("/api/admin/status", methods=["GET"])
def admin_status():
    if session.get("admin_id"):

        return jsonify({
            "success": True,
            "authenticated": True,
            "username": session.get("admin_username")
        }), 200

    return jsonify({
        "success": True,
        "authenticated": False
    }), 200

# Route to retrieve sales data for admin
@app.route("/api/admin/sales", methods=["GET"])
@admin_required
def get_admin_sales():
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""SELECT
                    o.order_id,
                    o.order_date,
                    o.status,

                    c.customer_id,
                    c.email,
                    c.phone,
                    c.suburb,

                    p.product_id,
                    p.product_title,

                    oi.quantity,
                    oi.cost_price,
                    oi.sale_price,
                    oi.subtotal,

                    o.total_amount

                FROM orders o
                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                INNER JOIN order_items oi
                    ON o.order_id = oi.order_id

                INNER JOIN products p
                    ON oi.product_id = p.product_id

                WHERE o.status = 'Completed'

                ORDER BY o.order_date DESC """)
            sales = cursor.fetchall()

        # Convert Decimal values to float
        for sale in sales:
            sale["cost_price"] = float(
                sale["cost_price"])

            sale["sale_price"] = float(
                sale["sale_price"])

            sale["subtotal"] = float(
                sale["subtotal"])

            sale["total_amount"] = float(
                sale["total_amount"])

        return jsonify({
            "success": True,
            "sales": sales
        }), 200

    except Exception as e:
        print("Sales retrieval error:", e)

        return jsonify({
            "success": False,
            "error": "Unable to retrieve sales"
        }), 500

    finally:
        if connection:
            connection.close()

# Route to retrieve a specific order for admin
@app.route("/api/admin/orders/<int:order_id>", methods=["GET"])
@admin_required
def get_admin_order(order_id):
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    o.order_id,
                    o.order_date,
                    o.status,
                    o.total_amount,

                    c.customer_id,
                    c.email,
                    c.phone,
                    c.suburb,

                    p.product_id,
                    p.product_title,

                    oi.quantity,
                    oi.cost_price,
                    oi.sale_price,
                    oi.subtotal

                FROM orders o

                INNER JOIN customers c
                    ON o.customer_id = c.customer_id

                INNER JOIN order_items oi
                    ON o.order_id = oi.order_id

                INNER JOIN products p
                    ON oi.product_id = p.product_id

                WHERE o.order_id = %s

                ORDER BY oi.order_item_id """, (order_id,))
            order = cursor.fetchall()

        if not order:
            return jsonify({
                "success": False,
                "error": "Order not found"
            }), 404

        for item in order:

            item["total_amount"] = float(
                item["total_amount"]
            )

            item["cost_price"] = float(
                item["cost_price"]
            )

            item["sale_price"] = float(
                item["sale_price"]
            )

            item["subtotal"] = float(
                item["subtotal"]
            )

        return jsonify({
            "success": True,
            "order": order
        }), 200

    except Exception as e:
        print("Order retrieval error:", e)

        return jsonify({
            "success": False,
            "error": "Unable to retrieve order"
        }), 500

    finally:
        if connection:
            connection.close()

# Route to retrieve admin dashboard data
@app.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:

            cursor.execute("""
                SELECT COUNT(*) AS product_count
                FROM products
            """)
            product_result = cursor.fetchone()
            cursor.execute("""
                SELECT COUNT(*) AS order_count
                FROM orders
                WHERE status = 'Completed'
            """)

            order_result = cursor.fetchone()

            cursor.execute("""
                SELECT
                    COALESCE(SUM(total_amount), 0)
                    AS total_sales
                FROM orders
                WHERE status = 'Completed'
            """)
            sales_result = cursor.fetchone()

        return jsonify({
            "success": True,
            "dashboard": {
                "product_count":
                    product_result["product_count"],

                "completed_orders":
                    order_result["order_count"],

                "total_sales":
                    float(sales_result["total_sales"])
            }
        }), 200

    except Exception as e:
        print("Dashboard error:", e)
        return jsonify({
            "success": False,
            "error": "Unable to retrieve dashboard data"
        }), 500

    finally:
        if connection:
            connection.close()

# Run the Flask application
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )