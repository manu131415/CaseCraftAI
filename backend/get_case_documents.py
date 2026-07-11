import os
import sys
import shutil
import psycopg2
from psycopg2.extras import RealDictCursor

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.doc_gen import DATABASE_URL

def fetch_and_export_docs(case_id):
    print(f"Connecting to database to fetch documents for case: {case_id}...")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    
    try:
        # Fetch document records
        cursor.execute("""
            SELECT document_id, title, file_path, document_type 
            FROM documents 
            WHERE case_id = %s;
        """, (case_id,))
        docs = cursor.fetchall()
        
        if not docs:
            print(f"No generated documents found in database for case '{case_id}'.")
            return
            
        # Target export directory
        export_dir = os.path.join(r"c:\Users\vyomi\OneDrive\Desktop\CaseCraftAI", f"case_docs_{case_id}")
        os.makedirs(export_dir, exist_ok=True)
        print(f"Found {len(docs)} documents. Exporting to: {export_dir}")
        
        backend_dir = r"c:\Users\vyomi\OneDrive\Desktop\CaseCraftAI\backend"
        copied_count = 0
        
        for doc in docs:
            file_path = doc['file_path']
            # Make path absolute if relative
            if not os.path.isabs(file_path):
                abs_src_path = os.path.join(backend_dir, file_path)
            else:
                abs_src_path = file_path
                
            if os.path.exists(abs_src_path):
                # Copy file to export directory
                dest_filename = os.path.basename(abs_src_path)
                dest_path = os.path.join(export_dir, dest_filename)
                shutil.copy2(abs_src_path, dest_path)
                print(f"  -> Copied: {doc['title']} ({dest_filename})")
                copied_count += 1
            else:
                print(f"  -> Warning: File not found at {abs_src_path} for document '{doc['title']}'")
                
        print(f"\nSuccessfully exported {copied_count}/{len(docs)} documents.")
        
    except Exception as e:
        print("Failed to export documents:", e)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        case_id = input("Enter Case ID (e.g. CASE001): ").strip()
    else:
        case_id = sys.argv[1]
        
    if case_id:
        fetch_and_export_docs(case_id)
    else:
        print("Case ID cannot be empty.")
