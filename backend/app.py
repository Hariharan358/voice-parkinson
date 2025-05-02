from flask import Flask, request, jsonify
import os
import librosa
import numpy as np
from flask_cors import CORS
from werkzeug.utils import secure_filename
import joblib
import logging

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

# Set up logging
logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

# Constants for file upload
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {'wav', 'mp3'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the trained Parkinson's model
try:
    model = joblib.load('parkinsons_model.pkl')
    app.logger.info("Model loaded successfully")
except Exception as e:
    app.logger.error(f"Error loading model: {str(e)}")
    raise RuntimeError("Error loading model")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_features(y, sr):
    # Extract 13 MFCC features
    mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13), axis=1)
    
    # Extract 7 chroma features
    chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=7), axis=1)

    # Zero Crossing Rate (1 value)
    zcr = np.mean(librosa.feature.zero_crossing_rate(y=y))

    # Spectral Centroid (1 value)
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))

    # Combine all features into a single feature array (13 + 7 + 1 + 1 = 22)
    features = np.hstack([mfccs, chroma, [zcr, spectral_centroid]])

    # Check if we have exactly 22 features
    if len(features) != 22:
        raise ValueError(f"Feature extraction resulted in {len(features)} features, expected 22.")

    return features

def analyze_audio(file_path):
    try:
        # Load audio file using librosa
        y, sr = librosa.load(file_path, sr=None)

        # Extract features
        features = extract_features(y, sr)

        # Log the extracted features for debugging
        app.logger.info(f"Extracted features: {features}")

        # Predict with the model
        features_2d = features.reshape(1, -1)
        prediction = model.predict(features_2d)
        app.logger.info(f"Prediction output shape: {prediction.shape}, value: {prediction}")

        # Get probability
        try:
            probas = model.predict_proba(features_2d)
            app.logger.info(f"Predict_proba output shape: {probas.shape}, value: {probas}")
            probability = probas[0, 1] if probas.shape[1] == 2 else probas[0, 0]
        except AttributeError:
            app.logger.warning("Model does not support predict_proba, using prediction only")
            probability = float(prediction[0]) if prediction[0] in [0, 1] else 0.5

        result = {
            "prediction": "Healthy" if prediction[0] == 1 else "Parkinson s",
            "probability": round(float(probability), 2),
            "features": {
                "mfccs": list(np.round(features[:13], 6)),
                "chroma": list(np.round(features[13:20], 6)),
                "zeroCrossingRate": round(features[20], 6),
                "spectralCentroid": round(features[21], 6)
            }
        }

        return result
    except Exception as e:
        app.logger.error(f"Error during audio analysis: {str(e)}")
        return {"error": str(e)}

@app.route('/upload', methods=['OPTIONS'])
def upload_options():
    response = jsonify({"status": "ok"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:8080")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    return response, 200

@app.route('/upload', methods=['POST'])
def upload_file():
    app.logger.info(f"Request files: {request.files}, Content-Type: {request.content_type}")
    if 'file' not in request.files:
        app.logger.error("No file part in the request")
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        app.logger.error("No file selected")
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(file_path)
            app.logger.info(f"File saved at: {file_path}")
            result = analyze_audio(file_path)
            if "error" in result:
                app.logger.error(f"Error during analysis: {result['error']}")
                return jsonify({"error": result["error"]}), 500
            return jsonify(result), 200
        except Exception as e:
            app.logger.error(f"Error during file processing: {str(e)}")
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
                app.logger.info(f"File deleted: {file_path}")
    else:
        app.logger.error("Invalid file type uploaded")
        return jsonify({"error": "Invalid file type. Only .wav or .mp3 are allowed."}), 400

@app.route('/predict', methods=['POST'])
def predict_file():
    return upload_file()  # Reuse upload_file logic

if __name__ == '__main__':
    app.run(debug=True)