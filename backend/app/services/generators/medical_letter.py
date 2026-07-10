from doc_generator import render_document
from db import get_complaint


def generate_medical_letter(case_id):

    complaint = get_complaint(case_id)

    if complaint is None:
        print("Complaint not found")
        return


    data = complaint["extracted"]


    victim = data.get("victim", {})


    context = {

        "case_id":
            case_id,


        "hospital_name":
            "Civil Hospital Ahmedabad",


        "patient_name":
            victim.get("name", ""),


        "patient_age":
            victim.get("age", ""),


        "patient_gender":
            victim.get("gender", ""),


        "incident_date":
            data.get("datetime", ""),


        "incident_location":
            data.get("location", ""),


        "injury_description":
            data.get("injury_description")
            or data.get("description")
            or "",


        "officer_name":
            "",


        "officer_rank":
            "",


        "police_station":
            ""
    }


    render_document(
        "medical_treatment_letter.docx",
        context,
        f"medical_{case_id}.docx"
    )


    print("Medical Treatment Letter Generated!")