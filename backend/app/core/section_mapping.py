# app/core/section_mapping.py
import re

NEW_ACTS = {"BNS", "BNSS", "BSA"}
OLD_ACTS = {"IPC", "CrPC", "IEA"}


def _word_boundary_pattern(section_number: str) -> str:
    return r"\y" + re.escape(section_number.strip()) + r"\y"


def _cross_references(conn, act_code: str, section_number: str) -> list[dict]:
    if not section_number:
        return []
    pattern = _word_boundary_pattern(section_number)
    cur = conn.cursor()

    if act_code in NEW_ACTS:
        cur.execute("""
            SELECT old_act, old_section, subject, summary_of_comparison
            FROM legal_section_mappings
            WHERE new_act = %s AND new_section ~ %s
        """, (act_code, pattern))
    elif act_code in OLD_ACTS:
        cur.execute("""
            SELECT new_act, new_section, subject, summary_of_comparison
            FROM legal_section_mappings
            WHERE old_act = %s AND old_section ~ %s
        """, (act_code, pattern))
    else:
        cur.close()
        return []

    rows = cur.fetchall()
    cur.close()
    return [
        {"act": r[0], "section": r[1], "subject": r[2], "summary_of_comparison": r[3]}
        for r in rows
    ]


def enrich_sections_with_cross_references(conn, ranked_sections: list[dict]) -> list[dict]:
    for section in ranked_sections:
        section["cross_references"] = _cross_references(
            conn, section["act_code"], section["section_number"]
        )
    return ranked_sections