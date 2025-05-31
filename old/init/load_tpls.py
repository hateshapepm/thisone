import mariadb
import csv
import sys


def get_category_id(cursor, category_name):
    """
    Fetch the category ID from sls_tpl_categories table.
    If the category does not exist, insert it and return the new ID.
    """
    try:
        # Check if the category exists
        cursor.execute("SELECT tpl_categories_id FROM sls_tpl_categories WHERE category = %s", (category_name,))
        result = cursor.fetchone()
        if result:
            return result[0]  # Return the existing category ID

        # Insert the new category
        cursor.execute("INSERT INTO sls_tpl_categories (category) VALUES (%s)", (category_name,))
        return cursor.lastrowid  # Return the new category ID

    except mariadb.Error as e:
        print(f"Error fetching or inserting category '{category_name}': {e}")
        return None


# Get the database name from command-line arguments
if len(sys.argv) > 1 and sys.argv[1] == "--test":
    target_db = "deeplike_test_db"
else:
    target_db = "deeplike_db"

# Configuration
db_config = {
    'host': 'localhost',
    'user': 'dd',
    'password': 'this',
    'database': target_db,
    'autocommit': True
}

csv_file_path = "/home/dd/my/codes/deeplike/init/csv/sls_tpls.csv"

# Connect to MariaDB
try:
    conn = mariadb.connect(**db_config)
    cursor = conn.cursor()
    print(f"Connected to the database: {target_db}")
except mariadb.Error as e:
    print(f"Error connecting to the database: {e}")
    exit()

# Insert data into the database
try:
    with open(csv_file_path, "r", encoding="utf-8") as csv_file:
        csv_reader = csv.reader(csv_file, delimiter='|')
        for row in csv_reader:
            if len(row) != 10:  # Ensure the row has exactly 10 elements
                print(f"Skipping row due to mismatched fields: {row}")
                continue

            # Extract the category name and other fields
            category_name, apex_domain, protocol, domain, url_path, alive, twofa_required, high_value, notes, description = row

            # Lookup or insert the category ID
            fk_category_id = get_category_id(cursor, category_name)
            if not fk_category_id:
                print(f"Skipping row due to category lookup failure: {row}")
                continue

            # Convert boolean fields to proper values
            alive = bool(int(alive)) if alive.isdigit() else 1
            twofa_required = bool(int(twofa_required)) if twofa_required.isdigit() else 0
            high_value = bool(int(high_value)) if high_value.isdigit() else 0

            # Insert the data into the sls_tpls table
            try:
                cursor.execute("""
                    INSERT INTO sls_tpls (
                        fk_category_id, apex_domain, protocol, domain,
                        url_path, alive, twofa_required, high_value, notes, description
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (fk_category_id, apex_domain, protocol, domain, url_path, alive, twofa_required, high_value, notes,
                      description))
            except mariadb.Error as e:
                print(f"Error inserting row into sls_tpls: {e}")
        print(f"Data from {csv_file_path} inserted successfully.")
except FileNotFoundError:
    print(f"File {csv_file_path} not found.")
except mariadb.Error as e:
    print(f"Error inserting data: {e}")
finally:
    cursor.close()
    conn.close()
    print("Database connection closed.")
