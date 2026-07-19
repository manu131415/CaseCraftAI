import requests
import json

complaint_id = 'b6d306c8-26eb-4c69-af8c-f49cb6e94588'

try:
    resp = requests.get(f'http://localhost:8000/api/complaints/{complaint_id}')
    print(f'Status: {resp.status_code}')
    if resp.status_code == 200:
        data = resp.json()
        print('Success!')
        print(f'Complaint: {data["complaint"]["complaintTitle"]}')
        print(f'Victims: {len(data["victims"])} victim(s)')
        print(f'Draft: {data["complaint"]["is_draft"]}')
        print(f'Full Response: {json.dumps(data, indent=2)}')
    else:
        print(f'Error: {resp.json()}')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
