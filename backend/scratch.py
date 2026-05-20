import pickle
import os

base = 'ml/models/'
with open(os.path.join(base, 'vectorizers/tfidf_vectorizer.pkl'), 'rb') as f:
    vectorizer = pickle.load(f)

with open(os.path.join(base, 'encoders/label_encoder.pkl'), 'rb') as f:
    encoder = pickle.load(f)

print("Vectorizer max_features or vocab len:", len(vectorizer.vocabulary_))
print("Encoder classes:", encoder.classes_)
