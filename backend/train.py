import pandas as pd
import numpy as np
import sounddevice as sd
import soundfile as sf
import librosa
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import os

# 1. Load the dataset
df = pd.read_csv(r"C:\Users\mrvan\Downloads\parkinsons\parkinsons.data")

# 2. Separate features and target
X = df.drop(columns=["name", "status"])
y = df["status"]

# 3. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. Feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. Hyperparameter tuning with GridSearchCV
param_grid = {
    'C': [0.1, 1, 10, 100],
    'gamma': [0.001, 0.01, 0.1, 1],
    'kernel': ['rbf']
}

grid = GridSearchCV(SVC(), param_grid, refit=True, verbose=0, cv=5)
grid.fit(X_train_scaled, y_train)

# 6. Best estimator
y_pred = grid.predict(X_test_scaled)

# 7. Evaluate the model
print("\nBest Parameters:", grid.best_params_)
print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 8. Save the best model and scaler
joblib.dump(grid.best_estimator_, "parkinsons_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\nModel and scaler saved successfully!")

# 9. Record voice
print("\nRecording 3 seconds of audio...")
duration = 3  # seconds
fs = 22050  # sample rate
recording = sd.rec(int(duration * fs), samplerate=fs, channels=1)
sd.wait()
sf.write("test_audio.wav", recording, fs)
print("Recording complete and saved as test_audio.wav")

# 10. Extract features from voice using librosa
def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=fs)
    f0 = librosa.yin(y, fmin=50, fmax=300, sr=sr)
    jitter = np.std(np.diff(f0)) / np.mean(f0)
    shimmer = np.std(y) / np.mean(np.abs(y))
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=5)
    
    # Extract features and ensure the correct shape (22 features)
    features = np.hstack((
        np.mean(f0), jitter, shimmer,
        np.mean(mfccs, axis=1)
    ))
    
    # Pad or truncate to ensure it has 22 features
    return features[:22] if len(features) > 22 else np.pad(features, (0, 22 - len(features)))

# Extract and scale the features
features = extract_features("test_audio.wav").reshape(1, -1)

# Scale the features directly as numpy arrays
features_scaled = scaler.transform(features)

# Make prediction
prediction = grid.predict(features_scaled)
print("\nVoice-based Prediction:", "Parkinson's" if prediction[0] == 1 else "Healthy")
