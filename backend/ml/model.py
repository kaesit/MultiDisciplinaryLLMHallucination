import os
import random
import json
import re
import requests
import pickle
import numpy as np

try:
    import tensorflow as tf
    import sklearn
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("WARNING: TensorFlow or Scikit-Learn is not installed. Falling back to Ollama or Mock predictor.")

class HallucinationPredictor:
    def __init__(self):
        self.is_loaded = False
        self.model = None
        self.vectorizer = None
        self.encoder = None
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(current_dir, "models", "halusinasyon_siniflandirici_dl.h5")
        self.vectorizer_path = os.path.join(current_dir, "models", "vectorizers", "tfidf_vectorizer.pkl")
        self.encoder_path = os.path.join(current_dir, "models", "encoders", "label_encoder.pkl")
        
        self.ollama_url = "http://localhost:11434/api/chat"
        # User requested to use Mistral
        self.evaluator_model = "mistral"
        
    def load_model(self):
        if ML_AVAILABLE:
            try:
                # Load Deep Learning model
                self.model = tf.keras.models.load_model(self.model_path)
                
                # Load Vectorizer and Encoder
                with open(self.vectorizer_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                with open(self.encoder_path, 'rb') as f:
                    self.encoder = pickle.load(f)
                    
                print(f"Successfully loaded Deep Learning model, vectorizer, and encoder.")
                self.is_loaded = True
            except Exception as e:
                print(f"Error loading ML components: {e}")
                print("Falling back to Ollama API for predictions.")
        else:
            print("Real ML model not loaded due to missing dependencies. Falling back to Ollama API or mock predictions.")

    def predict(self, text: str, domain: str) -> dict:
        """
        Evaluates if a given text contains hallucinations.
        Uses the loaded .h5 ML model if available, otherwise falls back to Ollama API.
        """
        # --- 1. ML Model Prediction Path ---
        if self.is_loaded and self.model is not None and self.vectorizer is not None and self.encoder is not None:
            try:
                # Transform text using the TF-IDF vectorizer
                vectorized_text = self.vectorizer.transform([text]).toarray()
                
                # Get model prediction
                prediction = self.model.predict(vectorized_text)
                
                # Model likely outputs probabilities for multiple classes (softmax) or a single sigmoid
                if len(prediction.shape) > 1 and prediction.shape[1] > 1:
                    predicted_class_index = np.argmax(prediction[0])
                    confidence = float(prediction[0][predicted_class_index])
                    
                    # Convert index back to original label
                    h_type = str(self.encoder.inverse_transform([predicted_class_index])[0])
                    
                    # Determine score based on whether it's classified as hallucination
                    # If the label is something like 'Yok', 'None', 'Dogru', score should be low
                    no_hallucination_labels = ['yok', 'none', 'dogru', 'false', '0']
                    if str(h_type).lower() in no_hallucination_labels:
                        hallucination_score = 1.0 - confidence
                        details = "Response appears consistent and factual based on the ML model."
                    else:
                        hallucination_score = confidence
                        details = f"DL Model detected '{h_type}' hallucination for the '{domain}' domain."
                else:
                    # Binary classification case
                    hallucination_score = float(prediction[0][0]) if len(prediction.shape) > 1 else float(prediction[0])
                    if hallucination_score > 0.5:
                        h_type = "hallucination_detected"
                        details = f"DL Model detected a high probability of hallucination for the '{domain}' domain."
                    else:
                        h_type = "none"
                        details = "Response appears consistent and factual based on the ML model."
                    
                    confidence = float(abs(hallucination_score - 0.5) * 2.0)
                
                return {
                    "hallucination_score": hallucination_score,
                    "hallucination_type": h_type,
                    "confidence": max(0.1, min(confidence, 1.0)),
                    "details": details
                }
            except Exception as e:
                print(f"ML Model prediction failed: {e}. Falling back to Ollama.")

        # --- 2. Ollama API Fallback Path ---
        eval_prompt = f"""You are an expert hallucination detector. Analyze the following text in the domain of '{domain}' for any hallucinations, factual errors, logical inconsistencies, or fabrications.

Text to analyze:
"{text}"

Provide your evaluation in strict JSON format with exactly the following keys:
- "hallucination_score": A float between 0.0 (no hallucination) and 1.0 (definitely hallucinated).
- "hallucination_type": A string categorizing the hallucination (e.g., "fabrication", "inconsistency", "math_error", "factual_error", "none").
- "confidence": A float between 0.0 and 1.0 indicating your confidence in this assessment.
- "details": A short explanation of your findings.

Respond ONLY with valid JSON. Do not include markdown formatting like ```json or any other text."""
        
        payload = {
            "model": self.evaluator_model,
            "messages": [{"role": "user", "content": eval_prompt}],
            "stream": False,
            "format": "json"
        }
        
        try:
            response = requests.post(self.ollama_url, json=payload, timeout=300)
            response.raise_for_status()
            result_text = response.json()["message"]["content"].strip()
            
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result_text = json_match.group(0)
                
            evaluation = json.loads(result_text)
            
            return {
                "hallucination_score": float(evaluation.get("hallucination_score", 0.0)),
                "hallucination_type": str(evaluation.get("hallucination_type", "unknown")),
                "confidence": float(evaluation.get("confidence", 0.8)),
                "details": str(evaluation.get("details", "No details provided."))
            }
            
        except Exception as e:
            print(f"Error during Ollama evaluation: {e}")
            return {
                "hallucination_score": round(random.uniform(0.0, 1.0), 2),
                "hallucination_type": "error_fallback",
                "confidence": 0.5,
                "details": f"Failed to reach Ollama evaluator and ML model failed. Returning mock fallback. Error: {str(e)[:50]}"
            }

    def chat(self, messages: list, model_name: str = "mistral") -> str:
        """Generates conversational response via Ollama for the chat interface."""
        payload = {
            "model": model_name,
            "messages": messages,
            "stream": False
        }
        try:
            response = requests.post(self.ollama_url, json=payload, timeout=300)
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except Exception as e:
            print(f"Chat API Error: {e}")
            return "Sorry, I am currently unable to process requests due to a connection error with my inference engine."

# Create a singleton instance to be used across the app
predictor = HallucinationPredictor()
