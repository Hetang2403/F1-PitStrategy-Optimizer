# F1 Pit Stop Strategy Predictor

A production-ready machine learning system that predicts optimal Formula 1 pit stop timing using historical race data and real-time race conditions.

**[Live Demo](https://f1-pit-strategy-optimizer.vercel.app/)** 

## Overview

This project combines my passion for Formula 1 with practical machine learning engineering to solve a real-world racing optimization problem. The system analyzes 2,600+ historical pit stops across multiple F1 seasons to predict optimal pit stop timing based on race conditions, tire strategy, and track position.

### Key Highlights

- **High-Performance Models**: XGBoost models achieving R² scores of 0.851 (single-season) and 0.772 (multi-season)
- **Production-Ready API**: FastAPI backend with proper error handling, CORS configuration, and comprehensive validation
- **Real-Time Predictions**: Instant strategy recommendations with confidence intervals
- **Interactive Dashboard**: F1-themed web interface with live visualizations
- **Containerized Deployment**: Docker-based deployment on Railway with CI/CD pipeline

## Problem Statement

Pit stop timing is one of the most critical strategic decisions in Formula 1 racing. Teams must balance:
- Tire degradation and performance
- Track position and gap to competitors  
- Race conditions (safety cars, weather)
- Fuel load and overall race strategy

Poor pit stop timing can cost positions, while optimal timing can win races. This system provides data-driven predictions to inform these high-stakes decisions.

## Technical Architecture

```
┌─────────────────┐
│   Frontend      │ → HTML/CSS/JS with Chart.js visualizations
│   (Dashboard)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   FastAPI       │ → REST API with validation and error handling
│   Backend       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   XGBoost       │ → Dual model system (single/multi-season)
│   Models        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   FastF1 API    │ → Historical F1 data (2018-2023)
└─────────────────┘
```

## Machine Learning Approach

### Data Collection & Processing

- **Source**: FastF1 API providing official F1 timing data
- **Dataset**: 2,600+ pit stops across 5 F1 seasons (2020-2024)
- **Features Engineered**: 13 ML-ready features including:
  - Race context (stint number, race round, year)
  - Tire information (compound type, tire life/age, condition)
  - Driver and race identification (driver, race name)
  - Performance metrics (fastest lap speed, lap time)
  - Track conditions (safety car status, yellow flags, VSC)
  - Track position (current position)

### Model Development

**Dual Model Strategy:**
1. **Single-Season Model (2023)**: R² = 0.851
   - Trained on homogeneous data from single regulation era
   - Higher accuracy for current season predictions
   - Optimized for teams operating under consistent rules

2. **Multi-Season Model (2020-2024)**: R² = 0.772
   - Captures long-term strategic patterns
   - More robust to regulation changes
   - Better generalization across different conditions

**Key Finding**: More data doesn't always improve performance when it introduces heterogeneity. The 2023-only model outperforms the multi-season model by 10% R² due to consistent regulations.

### Feature Importance Analysis

Top predictors identified through XGBoost feature importance:
1. **Stint** (38.7%) - Primary driver of pit timing decisions
2. **Compound (Tire Type)** (18.6%) - Different compounds have different degradation patterns
3. **Safety Car Status** (9.3%) - Critical for opportunistic pit stops
4. **Race Round** (6.7%) - Track-specific strategic patterns
5. **Yellow Flag Status** (6.4%) - Caution periods affect strategy

Other contributing factors include race identification, lap times, VSC status, speed, position, tire life, driver, and tire condition (fresh vs. used).

## API Documentation

### Understanding Input Fields

Before making predictions, here's what each field represents and how to fill it out:

#### Basic Info

**`Driver`** (dropdown selection)
- Select the driver you want to predict pit strategy for
- Example: "Max Verstappen (VER)", "Lewis Hamilton (HAM)"
- Context: Different drivers and teams may have different strategic tendencies

**`Race`** (dropdown selection)
- Select the Grand Prix circuit
- Example: "Bahrain Grand Prix", "Monaco Grand Prix"
- Context: Each track has unique characteristics affecting pit strategy (pit lane length, overtaking difficulty)

#### Race Status

**`Position`** (integer, 1-20)
- Current track position of the driver
- Example: `3` means running in 3rd place
- Context: Track position affects strategic options (leaders can control tempo, followers need aggressive strategies)

**`Stint`** (integer, 1-4)
- Which tire stint the driver is currently on
- Example: `2` = second stint (after first pit stop)
- `1` = race start, `2` = after 1st pit, `3` = after 2nd pit
- Most races have 2-3 stints; complex strategies may have 4

**`Tyre Life (laps)`** (integer, 0-50)
- Number of laps completed on current set of tires
- Example: `15` means the current tires have done 15 laps
- Context: Tire degradation is the primary factor in pit timing decisions

#### Tyre Info

**`Compound`** (dropdown selection)
- Type of tire currently fitted
- Options: "Soft", "Medium", "Hard", "Intermediate", "Wet"
- Example: Select "Soft" for the red-marked soft compound
- Context: Different compounds have different performance windows and degradation rates
  - Soft: Fastest but degrades quickly (~15-25 laps)
  - Medium: Balanced performance (~25-35 laps)
  - Hard: Slowest but most durable (~35-50+ laps)

**`Condition`** (dropdown selection)
- Whether tires are fresh (new) or used
- Options: "Fresh", "Used"
- Example: Select "Fresh" if tires were just fitted, "Used" if they're scrubbed from practice/qualifying
- Context: Fresh tires perform slightly better initially; used tires may have more predictable behavior

#### Performance

**`Fastest Lap Speed (km/h)`** (float, 250-350)
- Driver's fastest lap speed achieved so far in the race
- Example: `325.5` km/h
- Context: Indicates car performance and tire condition; lower speeds may suggest degradation

**`Lap Time (seconds)`** (float, 70-120)
- Current lap time in seconds
- Example: `78.234` seconds
- Context: Increasing lap times suggest tire degradation; used to assess pit urgency

#### Additional

**`Race Round`** (integer, 1-24)
- Which race of the season this is
- Example: `6` for the 6th race of the calendar
- Context: Early season races vs. late season may have different strategic patterns

**`Year`** (integer, 2020-2024)
- Which F1 season
- Example: `2024`
- Context: Regulations change between years, affecting tire behavior and strategy

### Example Scenarios

#### Scenario 1: Verstappen Mid-Race on Degrading Softs
```json
{
  "driver": "Max Verstappen (VER)",
  "race": "Bahrain Grand Prix",
  "position": 3,
  "stint": 2,
  "tyre_life": 15,
  "compound": "Soft",
  "condition": "Fresh",
  "fastest_lap_speed": 325.5,
  "lap_time": 78.234,
  "race_round": 6,
  "year": 2024
}
```
**Interpretation**: Second stint on fresh soft tires with 15 laps completed. Softs typically last 20-25 laps, so pit stop likely needed within 5-10 laps.

#### Scenario 2: Hamilton on Hard Tires Early in Race
```json
{
  "driver": "Lewis Hamilton (HAM)",
  "race": "Silverstone Grand Prix",
  "position": 1,
  "stint": 1,
  "tyre_life": 18,
  "compound": "Hard",
  "condition": "Fresh",
  "fastest_lap_speed": 318.2,
  "lap_time": 91.543,
  "race_round": 10,
  "year": 2024
}
```
**Interpretation**: Race leader on fresh hard compound with only 18 laps. Hard tires can last 40+ laps, so model should predict much later pit stop (lap 35-45 range).

#### Scenario 3: Leclerc on Used Mediums, High Tire Life
```json
{
  "driver": "Charles Leclerc (LEC)",
  "race": "Monaco Grand Prix",
  "position": 5,
  "stint": 2,
  "tyre_life": 32,
  "compound": "Medium",
  "condition": "Used",
  "fastest_lap_speed": 298.4,
  "lap_time": 75.892,
  "race_round": 8,
  "year": 2024
}
```
**Interpretation**: Second stint on used mediums with high tire life (32 laps). Used tires started with some wear, and 32 laps is near the limit for mediums - immediate pit stop likely recommended.

### Request/Response Format

### Request/Response Format

#### `POST /predict`
Predict optimal pit stop lap for given race conditions.

**Request Body:**
```json
{
  "driver": "Max Verstappen (VER)",
  "race": "Bahrain Grand Prix",
  "position": 3,
  "stint": 2,
  "tyre_life": 15,
  "compound": "Soft",
  "condition": "Fresh",
  "fastest_lap_speed": 325.5,
  "lap_time": 78.234,
  "race_round": 6,
  "year": 2024
}
```

**Response:**
```json
{
  "predicted_pit_lap": 42,
  "model_used": "single_season",
  "input_summary": {
    "driver": "Max Verstappen (VER)",
    "race": "Bahrain Grand Prix",
    "position": 3,
    "stint": 2,
    "tyre_life": 15,
    "compound": "Soft"
  }
}
```

#### `GET /health`
Health check endpoint for monitoring.

## Setup & Installation

### Prerequisites
- Python 3.9+
- Docker (optional, for containerized deployment)

### Local Development

```bash
# Clone repository
git clone https://github.com/Hetang2403/F1-PitStrategy-Optimizer.git
cd F1-PitStrategy-Optimizer

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn backend.main:app --reload

# Access dashboard at http://localhost:8000
```

### Docker Deployment

```bash
# Build image
docker build -t f1-pit-predictor .

# Run container
docker run -p 8000:8000 f1-pit-predictor
```

## Project Structure

```
f1-pit-stop-predictor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/              # Trained XGBoost models
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # Dashboard UI
│   ├── styles.css           # F1-themed styling
│   └── app.js               # Frontend logic
├── notebooks/
│   ├── data_collection.ipynb
│   ├── eda.ipynb
│   └── model_training.ipynb
├── Dockerfile
├── .dockerignore
└── README.md
```

## Key Technical Decisions

### Why XGBoost?
- Handles complex non-linear relationships in pit stop strategy
- Built-in feature importance for model interpretability
- Fast inference for real-time predictions
- Robust to missing data and outliers

### Why Dual Models?
- Single-season model for maximum accuracy on current regulations
- Multi-season model for robustness and historical context
- Allows comparison and confidence validation

### Why FastAPI?
- Modern async support for concurrent requests
- Automatic OpenAPI documentation
- Built-in validation with Pydantic models
- Production-ready performance

## Challenges & Solutions

### Challenge 1: Data Quality
**Problem**: Red flag tire changes and damage-related early pit stops contaminated training data.

**Solution**: Implemented track status filtering and lap-based heuristics to exclude anomalous pit stops, improving model accuracy by 8%.

### Challenge 2: Deployment Constraints
**Problem**: AWS account verification delays threatened project timeline.

**Solution**: Pivoted to Railway for rapid deployment while maintaining production-grade infrastructure (Docker, CI/CD).

### Challenge 3: Feature Engineering
**Problem**: Raw lap timing data insufficient for strategic predictions.

**Solution**: Created 15 engineered features capturing race context, tire strategy, and historical patterns.

## Future Enhancements

- **Telemetry Integration**: Incorporate speed, throttle, and brake data for tire degradation modeling
- **Weather Data**: Add rain probability and track temperature
- **Reinforcement Learning**: Optimize entire race strategy, not just single pit stops
- **Live Race Mode**: Real-time predictions during active races
- **Multi-Model Ensemble**: Combine XGBoost with neural networks for improved accuracy

## Performance Metrics

- **Single-Season Model**: R² = 0.851, MAE = 2.3 laps
- **Multi-Season Model**: R² = 0.772, MAE = 2.8 laps
- **API Response Time**: <50ms average
- **Uptime**: 99.9% over 30 days
- **Containerized Size**: ~180MB optimized image

## Technologies Used

**Machine Learning**: Python, XGBoost, scikit-learn, pandas, numpy

**Backend**: FastAPI, Pydantic, uvicorn

**Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js

**Data Collection**: FastF1 API

**Deployment**: Docker, Railway, GitHub Actions

**Development**: Jupyter, Git, VS Code

## Contributing

This is a portfolio project, but feedback and suggestions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share on social media if you find it interesting

## License

MIT License - feel free to use this project for learning or personal projects.

## Contact

**Hetang** - hetangpatel24@gmail.com | [\[LinkedIn\] ](https://www.linkedin.com/in/hetangpatel/)| [Portfolio]

*Built as part of my transition into data science and ML engineering. Always open to opportunities in sports analytics, F1 teams, or early-stage startups working on interesting technical challenges.*

## Acknowledgments

- FastF1 team for the excellent open-source F1 data API
- F1Technical Reddit community for domain expertise and feedback
- XGBoost developers for the robust ML framework

---

⭐ If you found this project interesting, please consider giving it a star!
