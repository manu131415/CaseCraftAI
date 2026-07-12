import os
from docxtpl import DocxTemplate

filepath = r"c:\Users\vyomi\OneDrive\Desktop\CaseCraftAI\backend\app\services\templates\medical_treatment_letter.docx"
print("File exists:", os.path.exists(filepath))
doc = DocxTemplate(filepath)
print("Doc type:", type(doc))
print("Doc:", doc)
