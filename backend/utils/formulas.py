"""
SCIENTIFIC FORMULAS MODULE
References:
1. Sowande & Sobola (2008). "Body Measurements of West African Dwarf Sheep".
2. Mahgoub et al. (2012). "Goat Meat Production and Quality".
"""
import math

# Allometric Coefficients (Sowande & Sobola, 2008 + Indian Regional Studies)
ALLOMETRIC_COEFFICIENTS = {
    'Boer':         {'a': 85.0, 'b': 1.80, 'c': 1.20, 'base_dressing': 0.52},
    'Jamnapari':    {'a': 78.0, 'b': 1.75, 'c': 1.15, 'base_dressing': 0.49},
    'Sirohi':       {'a': 72.0, 'b': 1.70, 'c': 1.12, 'base_dressing': 0.48},
    'Beetal':       {'a': 75.0, 'b': 1.72, 'c': 1.14, 'base_dressing': 0.50},
    'Barbari':      {'a': 68.0, 'b': 1.65, 'c': 1.08, 'base_dressing': 0.47},
    'Kiko':         {'a': 80.0, 'b': 1.75, 'c': 1.18, 'base_dressing': 0.50},
    'Kalahari Red': {'a': 75.0, 'b': 1.70, 'c': 1.15, 'base_dressing': 0.50},
    'Nubian':       {'a': 82.0, 'b': 1.77, 'c': 1.19, 'base_dressing': 0.46},
    'Local':        {'a': 50.0, 'b': 1.50, 'c': 0.95, 'base_dressing': 0.44}
}

BCS_MULTIPLIERS = {1: 0.80, 2: 0.90, 3: 1.00, 4: 1.10, 5: 1.20}

def calculate_mass(breed: str, length_m: float, height_m: float) -> float:
    """
    Calculate base mass using allometric scaling.
    Formula: M = a * L^b * H^c
    """
    coeffs = ALLOMETRIC_COEFFICIENTS.get(breed, ALLOMETRIC_COEFFICIENTS['Local'])
    return coeffs['a'] * (length_m ** coeffs['b']) * (height_m ** coeffs['c'])

def calculate_meat_yield(mass_kg: float, bcs: int, breed: str) -> dict:
    """
    Calculate full carcass breakdown.
    Returns: { 'hot_carcass': float, 'cold_carcass': float, 'boneless': float, 'dressing_pct': float }
    """
    coeffs = ALLOMETRIC_COEFFICIENTS.get(breed, ALLOMETRIC_COEFFICIENTS['Local'])
    base_dressing = coeffs['base_dressing']
    
    # Mass adjustment
    mass_adj = 0.0
    if mass_kg > 60: mass_adj = 0.03
    elif mass_kg > 45: mass_adj = 0.02
    elif mass_kg > 30: mass_adj = 0.01
    
    # BCS adjustment
    bcs_adj = (bcs - 3) * 0.02
    
    dressing_pct = min(base_dressing + mass_adj + bcs_adj, 0.56)
    
    hot_carcass = mass_kg * dressing_pct
    cold_carcass = hot_carcass * 0.98
    boneless = cold_carcass * 0.75
    
    return {
        'hot_carcass_kg': round(hot_carcass, 2),
        'cold_carcass_kg': round(cold_carcass, 2),
        'boneless_meat_kg': round(boneless, 2),
        'dressing_pct': dressing_pct
    }
