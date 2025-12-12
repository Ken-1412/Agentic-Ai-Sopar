#!/usr/bin/env python3
"""
SAPOR Meal Predictor

Loads a trained user model and predicts meal suitability scores

Usage:
    python predictor.py --userId <id> --mealFeatures <features>

Example:
    python predictor.py --userId 123 --mealFeatures "1,0,1,0,0,0,0,1,1,0,0,0,0,0.2"
"""

import sys
import os
import argparse
import joblib
import numpy as np

def parse_args():
    parser = argparse.ArgumentParser(description='Predict meal scores for user')
    parser.add_argument('--userId', required=True, help='User ID')
    parser.add_argument('--mealFeatures', required=True, help='Comma-separated meal features')
    return parser.parse_args()

def load_model(user_id):
    """Load the trained model for a user"""
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
    model_path = os.path.join(model_dir, f'{user_id}.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found for user {user_id}")
    
    return joblib.load(model_path)

def predict_score(user_id, meal_features):
    """
    Predict how much a user would like a meal
    
    Returns:
        float: Probability score (0-1) of user liking the meal
    """
    # Load model
    model_data = load_model(user_id)
    model = model_data['model']
    scaler = model_data['scaler']
    
    # Prepare features
    features = np.array([meal_features])
    
    # Predict probability
    prob = model.predict_proba(features)[0][1]  # Probability of liking
    
    return prob

if __name__ == '__main__':
    try:
        args = parse_args()
        
        # Parse features
        meal_features = [float(x) for x in args.mealFeatures.split(',')]
        
        # Predict
        score = predict_score(args.userId, meal_features)
        
        print(f"Score: {score:.4f}")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Prediction failed: {str(e)}")
        sys.exit(1)
