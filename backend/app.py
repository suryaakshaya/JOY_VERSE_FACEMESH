# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import torch
import torch.nn as nn
from train import EmotionTransformer

app = Flask(__name__)
CORS(app)

# Load model and preprocessing parameters
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = EmotionTransformer(
    input_dim=468 * 3,
    hidden_dim=128,
    n_layers=1,
    n_heads=8,
    dropout=0.3,
    n_classes=6  # Adjusted for 6 valid emotions
)
try:
    model.load_state_dict(torch.load('backend/emotion_model.pth', map_location=device))
    model.eval()
    model.to(device)
    print(f"✅ Model loaded successfully from: {model_path}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# ✅ Load label encoder
try:
    label_encoder = np.load('backend/label_encoder.npy', allow_pickle=True)
    mean = np.load('backend/mean.npy', allow_pickle=True)
    std = np.load('backend/std.npy', allow_pickle=True)
    print(f"Label encoder loaded: {list(label_encoder)}")
except Exception as e:
    print(f"Error loading label encoder or stats: {e}")
    label_encoder, mean, std = None, None, None

@app.route('/detect_emotion', methods=['POST'])
def predict_emotion():
    data = request.get_json()
    landmarks = data.get('landmarks', [])
    print(f"Received landmarks length: {len(landmarks)}")

    if not landmarks or len(landmarks) != 468 * 3:
        return jsonify({'error': f'Invalid landmarks: expected {468*3}, got {len(landmarks)}'}), 400

    try:
        # Normalize landmarks
        features = np.array(landmarks, dtype=np.float32)
        if mean is not None and std is not None:
            features = (features - mean) / std
        features_tensor = torch.FloatTensor(features).unsqueeze(0).to(device)
    except Exception as e:
        print(f"Error processing landmarks: {e}")
        return jsonify({'error': 'Error processing landmarks'}), 400

    try:
        with torch.no_grad():
            output = model(features_tensor)
            probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
            predicted_idx = torch.max(output, 1)[1].item()
            if label_encoder is not None:
                emotion = label_encoder[predicted_idx]
                prob_dict = {label_encoder[i]: float(prob) for i, prob in enumerate(probabilities)}
                print(f"Predicted emotion: {emotion}, Probabilities: {prob_dict}")
                return jsonify({'emotion': emotion, 'probabilities': prob_dict})
            else:
                return jsonify({'error': 'Label encoder not loaded'}), 500
    except Exception as e:
        print(f"🔥 Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

# 🟢 Run server
if __name__ == '__main__':
    app.run(debug=True, port=5000)