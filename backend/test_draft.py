import requests
import json

# Test save-draft endpoint
payload = {
    'complaint': {
        'complaintTitle': 'Frontend Draft Test',
        'crimeCategory': 'Theft',
        'crimeSubcategory': 'Burglary',
        'priority': 'High',
        'complaintMode': 'Phone',
        'incidentDate': '2026-07-19',
        'incidentTime': '10:00',
        'location': 'Location',
        'landmark': 'Landmark',
        'emergency': 'No',
        'description': 'Test draft',
        'aiSummary': '',
        'officerNotes': '',
        'complainantName': 'Test User',
        'complainantFatherName': '',
        'complainantAge': '30',
        'complainantGender': 'M',
        'complainantPhone': '9999999999',
        'complainantEmail': 'test@example.com',
        'complainantAddress': '',
        'complainantAadhaar': '',
        'complainantRelationship': '',
        'complainantOccupation': '',
        'complainantNationality': '',
        'complainantPhotoUrl': '',
        'complainantPhotoName': ''
    },
    'victims': [],
    'suspects': [],
    'attachments': []
}

resp = requests.post('http://localhost:8000/api/complaints/save-draft', json=payload)
print(f'Save Draft Status: {resp.status_code}')

# Now get the list
resp2 = requests.get('http://localhost:8000/api/complaints/')
print(f'List Status: {resp2.status_code}')
data = resp2.json()
print(f'Total complaints: {len(data["complaints"])}')
for c in data['complaints'][-3:]:
    print(f'  - {c["complaint_number"]}: {c["complaint_title"]} (Draft: {c["is_draft"]})')
