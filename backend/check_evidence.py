import requests

# Get the evidence records for the complaint
complaint_id = 'faf5d175-f7f4-4c50-91c4-fe6c3b3394e1'
r = requests.get(f'http://127.0.0.1:8000/api/evidences?complaint_id={complaint_id}', timeout=20)

if r.status_code == 200:
    evidences = r.json() or []
    print(f'Found {len(evidences)} evidence records for complaint')
    for i, evidence in enumerate(evidences[-2:], 1):  # Show last 2 records
        print(f'\nEvidence {i}:')
        print(f'  - File: {evidence.get("file_name")}')
        print(f'  - Type: {evidence.get("file_type")}')
        print(f'  - URL: {evidence.get("file_path")}')
        print(f'  - Created: {evidence.get("created_at")}')
else:
    print(f'Error: {r.status_code}')
    print(r.json())
