import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Step 1: Load the dataset (assuming it's in CSV format)
df = pd.read_csv(r"C:\Users\mrvan\Downloads\parkinsons\parkinsons.data")

# Step 2: Drop the 'name' column since it's not a numeric feature
df = df.drop(columns=['name'])

# Step 3: Separate features and labels
X = df.iloc[:, :-1].values  # Features (everything except the last column)
y = df.iloc[:, -1].values   # Labels (last column)

# Step 4: Check the unique values in the target variable (y)
print(np.unique(y))  # Check if the target variable is binary (0 or 1)

# Step 5: If the target is continuous, binarize it (you can adjust the threshold based on your data)
# For example, if the labels are continuous but should be binary
y = np.where(y <= 5, 0, 1)  # Adjust the threshold as per your dataset

# Step 6: Split the dataset into training and testing sets (80-20 split)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 7: Initialize and train a classifier (Random Forest in this case)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Step 8: Evaluate the model
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Step 9: Save the trained model to a file
joblib.dump(model, 'parkinsons_model.pkl')

print("Model saved as parkinsons_model.pkl")
