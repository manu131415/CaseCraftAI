import inspect
from docxtpl import DocxTemplate

methods = [m for m, _ in inspect.getmembers(DocxTemplate, predicate=inspect.isfunction)]
print("Methods in DocxTemplate:", methods)

# Print a couple of loading-related methods
for name in ['render', 'save', 'get_docx', 'init_docx']:
    if name in methods:
        print(f"\n--- Source of {name} ---")
        print(inspect.getsource(getattr(DocxTemplate, name)))

