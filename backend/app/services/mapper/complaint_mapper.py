from models.complaint_schema import (
    ComplaintExtraction,
    Complainant,
    Victim,
    Suspect,
)


# ==========================================================
# PDF
# ==========================================================

def map_pdf(data: dict) -> dict:

    complaint = ComplaintExtraction()

    sections = data.get("sections", {})

    incident = sections.get("incident_details", {})

    complainant = sections.get("complainant_details", {})

    complaint.complaintType = "Complaint"

    complaint.category = "General"

    complaint.priority = "Medium"

    complaint.location = incident.get("location", "")

    complaint.incidentDate = incident.get("date", "")

    complaint.description = incident.get("description", "")

    complaint.aiSummary = "\n".join(
        data.get("key_facts", [])
    )

    complaint.complainants = [

        Complainant(

            name=complainant.get("name", ""),

            contact=complainant.get("phone", ""),

            statement=sections.get(
                "narrative_text",
                "",
            ),

        )

    ]

    suspects = []

    for person in sections.get(
        "accused_details",
        [],
    ):

        suspects.append(

            Suspect(

                name=person.get("name", ""),

                description=person.get(
                    "description",
                    "",
                ),

            )

        )

    complaint.suspects = suspects

    return complaint.model_dump()


# ==========================================================
# IMAGE
# ==========================================================

def map_image(data: dict) -> dict:

    complaint = ComplaintExtraction()

    scene = data.get("scene", {})

    complaint.complaintType = "Image Evidence"

    complaint.category = "Evidence"

    complaint.priority = "Medium"

    complaint.location = scene.get(
        "location_type",
        "",
    )

    complaint.description = scene.get(
        "summary",
        "",
    )

    complaint.aiSummary = scene.get(
        "summary",
        "",
    )

    complaint.officerNotes = "\n".join(

        data.get(
            "suspicious_observations",
            [],
        )

    )

    suspects = []

    for person in data.get(
        "people",
        [],
    ):

        suspects.append(

            Suspect(

                description=person.get(
                    "description",
                    "",
                ),

                status=person.get(
                    "activity",
                    "",
                ),

            )

        )

    complaint.suspects = suspects

    return complaint.model_dump()


# ==========================================================
# AUDIO
# ==========================================================

def map_audio(data: dict) -> dict:

    complaint = ComplaintExtraction()

    transcript = data.get(
        "transcript",
        "",
    )

    complaint.complaintType = "Voice Complaint"

    complaint.category = "Audio"

    complaint.priority = "Medium"

    complaint.description = transcript

    complaint.aiSummary = transcript

    complaint.complainants = [

        Complainant(

            statement=transcript

        )

    ]

    return complaint.model_dump()