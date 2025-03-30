import pandas as pd
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load and preprocess data
df = pd.read_csv("synthetic_browsing_history_with_emails.csv")
features = df.groupby("category").agg({
    "timestamp": ["count", lambda x: (pd.to_datetime("2025-03-29") - pd.to_datetime(x).max()).days],
    "website": "nunique"
})
features.columns = ["visit_count", "recency", "unique_sites"]
labels = pd.qcut(features["visit_count"], q=3, labels=["Low", "Medium", "High"])

# Train model
X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict and prioritize
predictions = model.predict(features)
features["interest"] = predictions
prioritized = features.sort_values(by=["visit_count"], ascending=[False])

# Fetch the top 5 most frequently visited categories
top_3_frequent = prioritized.head(3)
print("Top 3 Most Frequently Visited Categories:")
print(top_3_frequent)

# Save the top 5 categories to a JSON file
top_3_frequent.reset_index().to_json("top_categories.json", orient="records", indent=4)
print("Top 3 categories saved to top_categories.json")