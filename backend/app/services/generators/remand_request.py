from services.doc_generator import render_document


def generate_remand_request(data):

    context = {

        "fir_number":
            data.get("fir_number",""),

        "police_station":
            data.get("police_station",""),

        "legal_sections":
            data.get("legal_sections",""),

        "accused_name":
            data.get("accused_name",""),

        "accused_address":
            data.get("accused_address",""),

        "remand_reasons":
            data.get("remand_reasons",""),

        "investigation_status":
            data.get("investigation_status",""),

        "pending_investigation":
            data.get("pending_investigation",""),

        "remand_days":
            data.get("remand_days",""),

        "officer_name":
            data.get("officer_name","")
    }


    render_document(
        "remand_request.docx",
        context,
        "remand_request.docx"
    )