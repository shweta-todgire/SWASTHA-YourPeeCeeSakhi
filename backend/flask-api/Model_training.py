import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# === Load dataset ===
df = pd.read_csv("PCOS_dummy_dataset.csv")

# === Preprocess ===
# Simplify column names
df.columns = [c.strip().replace(" ", "_").replace("?", "") for c in df.columns]

# Replace textual categories with simpler values
df = df.replace({
    "None": 0, "Mild": 1, "Moderate": 2, "Severe": 3,
    "Irregular": 1, "Regular": 0, "Absent": 1
})

# Select features aligned with frontend
selected_features = [
    "Cycle_Delay",        # menstrual irregularity
    "Acne",
    "Excessive_Hair_Growth",
    "Scalp_Hair_Loss",
    "Dark_Skin_Patches",
    "Weight_Gain",
    "Pain"
]

X = df[selected_features]
y = df["Likely_PCOS"]

# === Train/Test Split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Train Model ===
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# === Evaluate ===
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"✅ Model Training Complete. Accuracy: {acc*100:.2f}%")

# === Save model ===
joblib.dump(model, os.path.join(BASE_DIR, "pcos_model.pkl"))
print("✅ Model saved as pcos_model.pkl")
