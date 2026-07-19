# app/services/doc_engine/formatter.py

from datetime import date, datetime


def format_date(value):

    if value is None:
        return ""

    if isinstance(value, (date, datetime)):
        return value.strftime("%d-%m-%Y")

    return str(value)


def format_datetime(value):

    if value is None:
        return ""

    if isinstance(value, datetime):
        return value.strftime("%d-%m-%Y %H:%M")

    return str(value)