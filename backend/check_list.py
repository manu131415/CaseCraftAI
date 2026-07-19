import requests
import json

# Get the list
resp = requests.get('http://localhost:8000/api/complaints/')
print(f'List Status: {resp.status_code}')
data = resp.json()
print(f'Total complaints: {len(data["complaints"])}')
print(f'Last complaint keys: {list(data["complaints"][-1].keys())}')
print(f'Last 2 complaints:')
for c in data['complaints'][-2:]:
    print(json.dumps(c, indent=2))
