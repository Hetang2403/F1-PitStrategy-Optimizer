from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class PredictionRequest(BaseModel):
    tyre_life: int=Field(..., ge=1, le=50, description="laps on current tyre")
    fresh_tyre: int = Field(..., ge=0, le=1, description="Fresh tire (1) or used (0)")
    position: int = Field(..., ge=1, le=20, description="Current race position")
    stint: int = Field(..., ge=1, le=5, description="Current stint number")
    speed_fl: float = Field(..., ge=0, le=400, description="Fastest lap speed (km/h)")
    lap_time_seconds: float = Field(..., ge=60, le=200, description="Lap time in seconds")
    has_safety_car: int = Field(0, ge=0, le=1, description="Safety car deployed")
    has_vsc: int = Field(0, ge=0, le=1, description="Virtual safety car active")
    has_red_flag: int = Field(0, ge=0, le=1, description="Red flag")           
    has_yellow: int = Field(0, ge=0, le=1, description="Yellow flags")
    compound: Literal['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'] = Field(
        ..., description="Current tire compound"
    )
    driver: str = Field(..., description="Driver 3-letter code (e.g., 'VER')")
    race_name: str = Field(..., description="Race name (e.g., 'Monaco Grand Prix')")
    year: Optional[int] = Field(2024, ge=2020, le=2025, description="Season year")
    model_type: Literal['single', 'multi'] = Field(
        'single', description="Model to use: 'single' or 'multi'"
    )
    race_round: Optional[int] = Field(None, ge=1, le=24, description="Race round number")