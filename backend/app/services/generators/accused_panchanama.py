from services.doc_generator import render_document


def generate_accused_panchanama(data):

    context = {

        "date":
            data.get("date",""),

        "time":
            data.get("time",""),

        "place":
            data.get("place",""),

        "accused_name":
            data.get("accused_name",""),

        "father_name":
            data.get("father_name",""),

        "accused_address":
            data.get("accused_address",""),

        "officer_name":
            data.get("officer_name",""),

        "officer_rank":
            data.get("officer_rank",""),

        "witness_1":
            data.get("witness_1",""),

        "witness_2":
            data.get("witness_2",""),

        "found_articles":
            data.get("found_articles","")
    }


    render_document(
        "accused_panchanama.docx",
        context,
        "accused_panchanama.docx"
    )