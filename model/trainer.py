#!/usr/bin/env python3
"""
SAPOR User Model Trainer

Trains a personalized recommendation model for each user based on:
- Taste preferences
- Mood preferences  
- Carbon preference
- Meal ratings history (if any)

Usage:
    python trainer.py --userId <id> --tastes <taste1,taste2> --moods <mood1,mood2> --carbon <low|medium|high>

Example:
    python trainer.py --userId 123 --tastes spicy,sweet --moods cozy,energetic --carbon low
"""

import sys
import os
import argparse
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def parse_args():
    parser = argparse.ArgumentParser(description='Train user recommendation model')
    parser.add_argument('--userId', required=True, help='User ID')
    parser.add_argument('--tastes', required=True, help='Comma-separated taste preferences')
    parser.add_argument('--moods', required=True, help='Comma-separated mood preferences')
    parser.add_argument('--carbon', required=True, choices=['low', 'medium', 'high'], help='Carbon preference')
    return parser.parse_args()

def encode_preferences(tastes, moods, carbon_pref):
    """
    Encode user preferences into feature vector
    """
    # Taste encoding (common tastes)
    taste_options = ['spicy', 'sweet', 'savory', 'sour', 'bitter', 'umami', 'salty']
    taste_vector = [1 if taste in tastes else 0 for taste in taste_options]
    
    # Mood encoding (common moods)
    mood_options = ['cozy', 'energetic', 'relaxed', 'focused', 'social', 'adventurous']
    mood_vector = [1 if mood in moods else 0 for mood in mood_options]
    
    # Carbon preference encoding
    carbon_score = {'low': 0.0, 'medium': 0.5, 'high': 1.0}[carbon_pref]
    
    return taste_vector + mood_vector + [carbon_score]

def generate_synthetic_data(user_prefs):
    """
    Generate synthetic training data based on user preferences
    
    Since new users don't have rating history, we create synthetic
    positive and negative examples based on their stated preferences
    """
    n_samples = 100
    n_features = len(user_prefs)
    
    X_train = []
    y_train = []
    
    # Generate positive examples (meals user would like)
    for _ in range(60):
        # Start with user preferences
        features = user_prefs.copy()
        # Add some random noise
        noise = np.random.normal(0, 0.1, len(features))
        features = [max(0, min(1, f + n)) for f, n in zip(features, noise)]
        X_train.append(features)
        y_train.append(1)  # Like
    
    # Generate negative examples (meals user wouldn't like)
    for _ in range(40):
        # Opposite of preferences
        features = [1 - p if p in [0, 1] else np.random.random() for p in user_prefs]
        # Add noise
        noise = np.random.normal(0, 0.2, len(features))
        features = [max(0, min(1, f + n)) for f, n in zip(features, noise)]
        X_train.append(features)
        y_train.append(0)  # Dislike
    
    return np.array(X_train), np.array(y_train)

def train_model(user_id, tastes, moods, carbon_pref):
    """
    Train and save user's personalized model
    """
    print(f"🤖 Training model for user: {user_id}")
    print(f"   Tastes: {', '.join(tastes)}")
    print(f"   Moods: {', '.join(moods)}")
    print(f"   Carbon: {carbon_pref}")
    
    # Encode preferences
    user_prefs = encode_preferences(tastes, moods, carbon_pref)
    print(f"   Encoded {len(user_prefs)} features")
    
    # Generate training data
    X_train, y_train = generate_synthetic_data(user_prefs)
    print(f"   Generated {len(X_train)} training examples")
    
    # Create and train model
    model = RandomForestClassifier(
        n_estimators=50,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Create scaler
    scaler = StandardScaler()
    scaler.fit(X_train)
    
    # Save model and metadata
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_data = {
        'model': model,
        'scaler': scaler,
        'user_prefs': user_prefs,
        'tastes': tastes,
        'moods': moods,
        'carbon_pref': carbon_pref
    }
    
    model_path = os.path.join(model_dir, f'{user_id}.pkl')
    joblib.dump(model_data, model_path)
    
    print(f"✅ Model trained and saved to: {model_path}")
    print(f"   Accuracy: {model.score(X_train, y_train):.2%}")
    
    return model_path

if __name__ == '__main__':
    try:
        args = parse_args()
        
        # Parse tastes and moods
        tastes = [t.strip().lower() for t in args.tastes.split(',') if t.strip()]
        moods = [m.strip().lower() for m in args.moods.split(',') if m.strip()]
        
        if not tastes:
            print("❌ Error: At least one taste preference is required")
            sys.exit(1)
        
        # Train model
        model_path = train_model(
            user_id=args.userId,
            tastes=tastes,
            moods=moods if moods else [],
            carbon_pref=args.carbon
        )
        
        print(f"\n🎉 Training complete!")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Training failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
