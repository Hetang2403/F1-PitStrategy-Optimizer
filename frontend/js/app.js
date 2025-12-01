const API_URL = 'https://f1-pitstrategy-optimizer-production.up.railway.app';
let selectedModel = 'single';
let strategyChart = null;
let confidenceChart = null;
let predictionHistory = [];

// Driver codes for the 2024/2025 F1 season
const DRIVER_CODES = [
    'VER', 'PER', 'LEC', 'SAI', 'HAM', 'RUS', 
    'NOR', 'PIA', 'ALO', 'STR', 'GAS', 'OCO',
    'ALB', 'SAR', 'COL', 'MAG', 'HUL', 'BEA',
    'TSU', 'RIC', 'LAW', 'BOT', 'ZHO'
];

// All Grand Prix races in the 2024/2025 calendar
const RACE_NAMES = [
    'Bahrain Grand Prix',
    'Saudi Arabian Grand Prix',
    'Australian Grand Prix',
    'Japanese Grand Prix',
    'Chinese Grand Prix',
    'Miami Grand Prix',
    'Emilia Romagna Grand Prix',
    'Monaco Grand Prix',
    'Canadian Grand Prix',
    'Spanish Grand Prix',
    'Austrian Grand Prix',
    'British Grand Prix',
    'Hungarian Grand Prix',
    'Belgian Grand Prix',
    'Dutch Grand Prix',
    'Italian Grand Prix',
    'Azerbaijan Grand Prix',
    'Singapore Grand Prix',
    'United States Grand Prix',
    'Mexico City Grand Prix',
    'São Paulo Grand Prix',
    'Las Vegas Grand Prix',
    'Qatar Grand Prix',
    'Abu Dhabi Grand Prix'
];


// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏎️ F1 Dashboard initialized');
    
    initializeCharts();
    initializeEventListeners();
    checkAPIStatus();
});

// ===================================
// Event Listeners
// ===================================

function initializeEventListeners() {
    // Model switcher
    document.querySelectorAll('.switch-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedModel = this.dataset.model;
            updateModelBadge();
        });
    });
    
    // Form submission
    document.getElementById('predictionForm').addEventListener('submit', handlePrediction);
    
    // Navigation (future enhancement)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Future: Handle view switching
        });
    });
}

function updateModelBadge() {
    const badge = document.getElementById('modelBadge');
    badge.textContent = selectedModel === 'single' ? 'Single Season' : 'Multi Season';
}

// ===================================
// API Status Check
// ===================================

async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log('✅ API Connected');
            document.querySelector('.status-dot').style.background = '#27ae60';
        }
    } catch (error) {
        console.error('❌ API Connection Failed:', error);
        document.querySelector('.status-dot').style.background = '#e74c3c';
        document.querySelector('.api-status span:last-child').textContent = 'API Disconnected';
    }
}

// ===================================
// Prediction Handler
// ===================================

async function handlePrediction(e) {
    e.preventDefault();
    
    const btn = document.getElementById('predictBtn');
    const predictionDisplay = document.getElementById('predictionDisplay');
    
    // Start loading
    btn.classList.add('loading');
    btn.disabled = true;
    
    try {
        // Gather form data
        const formData = {
            driver: document.getElementById('driver').value,
            race_name: document.getElementById('race_name').value,
            position: parseInt(document.getElementById('position').value),
            stint: parseInt(document.getElementById('stint').value),
            tyre_life: parseInt(document.getElementById('tyre_life').value),
            compound: document.getElementById('compound').value,
            fresh_tyre: parseInt(document.getElementById('fresh_tyre').value),
            speed_fl: parseFloat(document.getElementById('speed_fl').value),
            lap_time_seconds: parseFloat(document.getElementById('lap_time_seconds').value),
            race_round: parseInt(document.getElementById('race_round').value),
            year: parseInt(document.getElementById('year').value),
            has_safety_car: 0,
            has_vsc: 0,
            has_red_flag: 0,
            has_yellow: 0,
            model_type: selectedModel
        };
        
        console.log('📝 Sending prediction request:', formData);
        
        // Make API call
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Prediction received:', data);
        
        // Store in history
        predictionHistory.push({
            timestamp: new Date(),
            data: data,
            input: formData
        });
        
        // Display results
        displayPrediction(data);
        updateCharts(data);
        
    } catch (error) {
        console.error('❌ Prediction failed:', error);
        showError(error.message);
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ===================================
// Display Prediction
// ===================================

function displayPrediction(data) {
    const display = document.getElementById('predictionDisplay');
    
    const html = `
        <div class="prediction-result">
            <div class="prediction-value">${data.optimal_lap}</div>
            <div class="prediction-label">Optimal Pit Lap</div>
            
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${data.confidence * 100}%"></div>
            </div>
            
            <div class="prediction-meta">
                <div class="meta-row">
                    <span class="meta-label">Confidence</span>
                    <span class="meta-value">${(data.confidence * 100).toFixed(1)}%</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Model MAE</span>
                    <span class="meta-value">±${data.mae} laps</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Range</span>
                    <span class="meta-value">Lap ${data.prediction_lower} - ${data.prediction_upper}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Model</span>
                    <span class="meta-value">${data.model_used === 'single' ? 'Single Season' : 'Multi Season'}</span>
                </div>
            </div>
        </div>
    `;
    
    display.innerHTML = html;
}

// ===================================
// Charts Initialization
// ===================================

function initializeCharts() {
    initStrategyChart();
    initConfidenceChart();
}

function initStrategyChart() {
    const ctx = document.getElementById('strategyChart');
    
    strategyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Aggressive', 'Optimal', 'Conservative'],
            datasets: [{
                label: 'Lap Number',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(46, 204, 113, 0.8)'
                ],
                borderColor: [
                    'rgba(231, 76, 60, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(46, 204, 113, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#999',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#999',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function initConfidenceChart() {
    const ctx = document.getElementById('confidenceChart');
    
    confidenceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Confidence', 'Uncertainty'],
            datasets: [{
                data: [0, 100],
                backgroundColor: [
                    'rgba(225, 6, 0, 0.8)',
                    'rgba(255, 255, 255, 0.1)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// ===================================
// Update Charts
// ===================================

function updateCharts(data) {
    // Update strategy chart
    if (strategyChart && data.alternatives) {
        const laps = data.alternatives.map(alt => alt.lap);
        strategyChart.data.datasets[0].data = laps;
        strategyChart.update('active');
    }
    
    // Update confidence chart
    if (confidenceChart) {
        const confidence = (data.confidence * 100).toFixed(1);
        const uncertainty = (100 - confidence).toFixed(1);
        
        confidenceChart.data.datasets[0].data = [confidence, uncertainty];
        confidenceChart.update('active');
        
        // Add center text
        confidenceChart.options.plugins.tooltip = {
            enabled: true
        };
    }
}

// ===================================
// Error Handling
// ===================================

function showError(message) {
    const toast = document.getElementById('errorToast');
    const messageEl = document.getElementById('errorMessage');
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// ===================================
// Utility Functions
// ===================================

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function exportHistory() {
    const dataStr = JSON.stringify(predictionHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `f1-predictions-${Date.now()}.json`;
    link.click();
}

// ===================================
// Console Styling
// ===================================

console.log('%cF1 Pit Strategy Optimizer', 'font-size: 20px; font-weight: bold; color: #e10600');
console.log('%cDashboard loaded successfully', 'color: #27ae60');
console.log('%cAPI: ' + API_URL, 'color: #999');
