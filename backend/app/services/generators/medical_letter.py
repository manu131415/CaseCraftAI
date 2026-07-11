from doc_generator import render_document
from db import get_complaint

def generate_medical_letter(case_id):
    complaint = get_complaint(case_id)

    if complaint is None:
        print("Complaint not found")
        return

    context = {
        "case_id": complaint["complaint_id"],
        "hospital_name": "Civil Hospital Ahmedabad",
        "patient_name": complaint["complainant_name"],
        "patient_age": "",
        "patient_gender": "",
        "incident_date": complaint["created_at"].strftime("%d-%m-%Y") if complaint["created_at"] else "",
        "incident_location": complaint["location"],
        "injury_description": complaint["description"],
        "officer_name": "",
        "officer_rank": "",
        "police_station": "",
    }

    render_document(
        "medical_treatment_letter.docx",
        context,
        f"medical_{case_id}.docx",
    )

    print("Medical Treatment Letter Generated!")