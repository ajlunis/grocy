import requests
import json
import base64

API_URL = "http://localhost:8000/api"

def create_userfield(entity, name, caption, type, config=None):
    # Check if exists
    # We can't easily list all definition via API for a check, but creation might fail if exists
    # or we just try to create.
    # Actually, the userfields table has a unique constraint on (entity, name) usually.

    # But wait, there is no direct API to CREATE userfields in Grocy officially documented
    # as a standard "user" action?
    # Usually userfields are created in the system settings "Userfields" UI.
    # The API endpoint /objects/userfields can be used.

    data = {
        "entity": entity,
        "name": name,
        "caption": caption,
        "type": type,
        "show_as_column_in_tables": 1
    }
    if config:
        data["config"] = config

    resp = requests.post(f"{API_URL}/objects/userfields", json=data)
    if resp.status_code == 200:
        print(f"Created userfield {name}")
        return resp.json()["created_object_id"]
    else:
        print(f"Failed to create userfield {name}: {resp.text}")
        return None

def set_product_userfield(product_id, field_name, value):
    # Userfields are set via PUT /userfields/products/{productId}
    data = {
        field_name: value
    }
    resp = requests.put(f"{API_URL}/userfields/products/{product_id}", json=data)
    if resp.status_code == 204:
        print(f"Set {field_name}={value} for product {product_id}")
    else:
        print(f"Failed to set userfield: {resp.text}")

def run():
    # 1. Create Userfields
    # Text
    create_userfield("products", "qa_text", "QA Text", "text")
    # Checkbox
    create_userfield("products", "qa_checkbox", "QA Checkbox", "checkbox")
    # Select (Preset list)
    create_userfield("products", "qa_select", "QA Select", "preset-list", "Red,Green,Blue")

    # 2. Update Products
    # We need some products. In dev mode demo data, we have products.
    # Let's get products
    resp = requests.get(f"{API_URL}/objects/products")
    products = resp.json()

    if len(products) < 3:
        print("Not enough products to test")
        return

    # Product 1: Text="Foo", Checkbox=1, Select="Red"
    set_product_userfield(products[0]["id"], "qa_text", "Foo")
    set_product_userfield(products[0]["id"], "qa_checkbox", 1)
    set_product_userfield(products[0]["id"], "qa_select", "Red")

    # Product 2: Text="Bar", Checkbox=0, Select="Green"
    set_product_userfield(products[1]["id"], "qa_text", "Bar")
    set_product_userfield(products[1]["id"], "qa_checkbox", 0)
    set_product_userfield(products[1]["id"], "qa_select", "Green")

    # Product 3: Not set (Empty)
    # Ensure they are empty/null.
    # The API might not support unsetting easily if not null, but usually empty string or nothing works.
    set_product_userfield(products[2]["id"], "qa_text", "")
    set_product_userfield(products[2]["id"], "qa_checkbox", 0)
    set_product_userfield(products[2]["id"], "qa_select", "")

if __name__ == "__main__":
    run()
