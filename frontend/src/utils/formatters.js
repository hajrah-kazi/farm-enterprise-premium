/**
 * Institutional Currency Utility for Indian Market.
 * Formats values to ₹ with Indian grouping system (Lakhs, Crores).
 */
export const formatINR = (value) => {
    if (value === undefined || value === null) return "₹0.00";

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Standardizes mass measurements to Metric Tons for large-scale operations.
 */
export const formatWeight = (kg) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(2)}t`;
    return `${kg.toFixed(2)}kg`;
};

/**
 * Higher-order productivity index formatter.
 */
export const formatProductivity = (val) => `${(val * 100).toFixed(1)}%`;
