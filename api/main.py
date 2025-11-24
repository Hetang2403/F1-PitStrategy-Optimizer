from fastapi import FastAPI, HTTPException
import pickle
import pandas as pd
from pathlib import Path

from api.config import (
    SINGLE_YEAR_MODEL_PATH,
    MULTI_YEAR_MODEL_PATH,
    COMPOUND_ENCODING,
    SINGLE_SEASON_FEATURES,      
    MULTI_SEASON_FEATURES        
)
from api.models import PredictionRequest

app = FastAPI(
    title="F1 Pit Strategy Optimizer API", 
    description="API for predicting optimal pit stop strategies in Formula 1 races",
    version="1.0.0"
)

single_model = None
multi_model = None

@app.on_event("startup")
def load_models():
    global single_model, multi_model
    try:
        with open(SINGLE_YEAR_MODEL_PATH, 'rb') as f:
            single_model = pickle.load(f)
        with open(MULTI_YEAR_MODEL_PATH, 'rb') as f:
            multi_model = pickle.load(f)
    except Exception as e:
        raise RuntimeError(f"Error loading models: {e}")
    
@app.get("/")
def home():
    return {
        "status": "API is running",
        "message": "F1 Pit Strategy Optimizer API is running successfully.",
        "models_loaded": {
            "single-year" : single_model is not None, 
            "multi-year" : multi_model is not None
        } 
    }

@app.post("/predict")
def predict_pit_strategy(request: PredictionRequest):
    try:
        compound_encoded = COMPOUND_ENCODING[request.compound]
        driver_encoded = hash(request.driver) % 1000
        race_encoded = hash(request.race_name) % 1000
        if request.model_type == 'single':
            # Single-season model features
            features = {
                'TyreLife': request.tyre_life,
                'FreshTyre': request.fresh_tyre,
                'Position': request.position,
                'Stint': request.stint,
                'race_round': request.race_round if request.race_round else 1,
                'SpeedFL': request.speed_fl,
                'LapTime_seconds': request.lap_time_seconds,
                'has_safety_car': request.has_safety_car,
                'has_vsc': request.has_vsc,
                'has_yellow': request.has_yellow,
                'Compound_encoded': compound_encoded,
                'Driver_encoded': driver_encoded,
                'RaceName_encoded': race_encoded
            }
        else:
            # Multi-season model features
            features = {
                'TyreLife': request.tyre_life,
                'FreshTyre': request.fresh_tyre,
                'Position': request.position,
                'Stint': request.stint,
                'SpeedFL': request.speed_fl,
                'Year': request.year,
                'LapTime_seconds': request.lap_time_seconds,
                'has_safety_car': request.has_safety_car,
                'has_vsc': request.has_vsc,
                'has_red_flag': request.has_red_flag,
                'has_yellow': request.has_yellow,
                'Compound_encoded': compound_encoded,
                'Driver_encoded': driver_encoded,
                'RaceName_encoded': race_encoded
            }

        df = pd.DataFrame([features])
        model  = single_model if request.model_type == 'single' else multi_model

        prediction = float(model.predict(df)[0])

        mae = 4.47 if request.model_type == 'single' else 5.36
        confidence = 0.851 if request.model_type == 'single' else 0.772

        return {
            "optimal_lap": round(prediction, 1),
            "confidence": confidence,
            "model_used": request.model_type,
            "mae": mae,
            "prediction_lower": round(prediction - mae, 1),
            "prediction_upper": round(prediction + mae, 1),
            "alternatives": [
                {
                    "type": "Aggressive",
                    "lap": round(prediction - 4),
                    "risk_level": "HIGH",
                    "advantage": "+2.3s"
                },
                {
                    "type": "Optimal",
                    "lap": round(prediction),
                    "risk_level": "MEDIUM",
                    "advantage": "+4.1s"
                },
                {
                    "type": "Conservative",
                    "lap": round(prediction + 4),
                    "risk_level": "LOW",
                    "advantage": "+1.8s"
                }
            ],
            "input_summary": {
                "driver": request.driver,
                "race": request.race_name,
                "position": request.position,
                "stint": request.stint,
                "tyre_life": request.tyre_life,
                "compound": request.compound
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))