from sentence_transformers import SentenceTransformer

print("Before loading")

model = SentenceTransformer("intfloat/multilingual-e5-large")

print("After loading")