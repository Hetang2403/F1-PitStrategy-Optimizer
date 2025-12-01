from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / 'models'

SINGLE_YEAR_MODEL_PATH = MODELS_DIR / 'pit_strategy_single_season_2023.pkl'
MULTI_YEAR_MODEL_PATH = MODELS_DIR / 'pit_strategy_multi_season.pkl'

API_TITLE = "F1 Pit Strategy Optimizer API"
API_VERSION = "1.0.0"

SINGLE_SEASON_FEATURES = {
    'TyreLife',
    'FreshTyre',
    'Position',
    'Stint',
    'race_round',
    'SpeedFL',
    'LapTime_seconds',
    'has_safety_car',
    'has_vsc',
    'has_yellow',
    'Compound_encoded',
    'Driver_encoded',
    'RaceName_encoded'
}

MULTI_SEASON_FEATURES = {
    'TyreLife',
    'FreshTyre',
    'Position',
    'Stint',
    'SpeedFL',
    'Year',
    'LapTime_seconds',
    'has_safety_car',
    'has_vsc',
    'has_red_flag',
    'has_yellow',
    'Compound_encoded',
    'Driver_encoded',
    'RaceName_encoded'
}

COMPOUND_ENCODING = {
    'SOFT': 1,
    'MEDIUM': 2,
    'HARD': 3,
    'INTERMEDIATE': 4,
    'WET': 5
}

DRIVER_CODES = [
    'VER', 'HAM', 'LEC', 'SAI', 'PER', 'RUS', 'NOR', 'PIA',
    'ALO', 'STR', 'GAS', 'OCO', 'ALB', 'SAR', 'MAG', 'HUL',
    'TSU', 'RIC', 'ZHO', 'BOT'
]

RACE_NAMES = [
    'Bahrain Grand Prix', 'Saudi Arabian Grand Prix', 'Australian Grand Prix',
    'Japanese Grand Prix', 'Chinese Grand Prix', 'Miami Grand Prix',
    'Emilia Romagna Grand Prix', 'Monaco Grand Prix', 'Canadian Grand Prix',
    'Spanish Grand Prix', 'Austrian Grand Prix', 'British Grand Prix',
    'Hungarian Grand Prix', 'Belgian Grand Prix', 'Dutch Grand Prix',
    'Italian Grand Prix', 'Azerbaijan Grand Prix', 'Singapore Grand Prix',
    'United States Grand Prix', 'Mexico City Grand Prix', 'São Paulo Grand Prix',
    'Las Vegas Grand Prix', 'Qatar Grand Prix', 'Abu Dhabi Grand Prix'
]
