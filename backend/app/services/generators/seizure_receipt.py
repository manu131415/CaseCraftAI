from services.doc_generator import render_document


def generate_seizure_receipt(data):

    context = {

        "police_station":
            data.get("police_station",""),

        "fir_number":
            data.get("fir_number",""),

        "date":
            data.get("date",""),

        "seizure_location":
            data.get("seizure_location",""),

        "seized_items":
            data.get("seized_items",""),

        "property_description":
            data.get("property_description",""),

        "seized_from":
            data.get("seized_from",""),

        "officer_name":
            data.get("officer_name",""),

        "officer_rank":
            data.get("officer_rank","")
    }


    render_document(
        "seizure_receipt.docx",
        context,
        "seizure_receipt.docx"
    )