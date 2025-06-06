console.log("pricing.js loaded");

/**
 * Calculates the Equated Monthly Installment (EMI).
 * @param {number} principal - The principal loan amount.
 * @param {number} annualInterestRate - The annual interest rate (in percentage).
 * @param {number} tenureMonths - The loan tenure in months.
 * @returns {number} The calculated EMI, or 0 if inputs are invalid.
 */
function calculateEMI(principal, annualInterestRate, tenureMonths) {
    if (principal <= 0 || tenureMonths <= 0 || annualInterestRate < 0) {
        return 0;
    }

    const monthlyRate = annualInterestRate / 12 / 100;

    if (monthlyRate === 0) { // Handle zero interest rate case to avoid division by zero in formula
        return parseFloat((principal / tenureMonths).toFixed(2));
    }

    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return parseFloat(emi.toFixed(2));
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the pricing page by looking for a unique element
    const pricingPageIdentifier = document.querySelector('.pricing-simulator-page');
    if (!pricingPageIdentifier) {
        // console.log("Not on pricing page, pricing.js will not run specific logic.");
        return;
    }
    console.log("On pricing page, initializing PricingWidget logic.");

    // Element Selectors
    const goldRateEl = document.getElementById('gold-rate');
    const goldWeightEl = document.getElementById('gold-weight');
    const goldPurityEl = document.getElementById('gold-purity');
    const stoneValueEl = document.getElementById('stone-type'); // HTML ID is 'stone-type' but holds value
    const makingChargesPercentageEl = document.getElementById('making-charges-percentage');
    const festiveOfferToggleEl = document.getElementById('festive-offer-toggle');
    const emiTenureEl = document.getElementById('emi-tenure');
    const interestRateEl = document.getElementById('interest-rate'); // Read-only, but used

    // Output Element Selectors
    const calcGoldValueEl = document.getElementById('calc-gold-value');
    const calcStoneValueEl = document.getElementById('calc-stone-value');
    const calcMakingChargesEl = document.getElementById('calc-making-charges');
    const calcSubtotalEl = document.getElementById('calc-subtotal');
    const calcGstEl = document.getElementById('calc-gst');
    const calcTotalEstimateEl = document.getElementById('calc-total-estimate');
    const loanAmountEl = document.getElementById('loan-amount');
    const calcMonthlyEmiEl = document.getElementById('calc-monthly-emi');
    const discountAppliedMessageEl = document.getElementById('discount-applied-message');


    // Button Selectors
    const calculatePriceBtnEl = document.getElementById('calculate-price-btn'); // Main calculate button
    const fetchGoldRateBtnEl = document.getElementById('fetch-gold-rate-btn');

    /**
     * Updates the EMI display based on current loan amount and tenure.
     */
    function updateEMIDisplay() {
        const principal = parseFloat(loanAmountEl.value) || 0;
        const annualRate = parseFloat(interestRateEl.value) || 0; // Fixed at 10% in HTML
        const tenure = parseInt(emiTenureEl.value) || 0;

        if (principal > 0 && tenure > 0) {
            const monthlyEmi = calculateEMI(principal, annualRate, tenure);
            calcMonthlyEmiEl.textContent = formatCurrency(monthlyEmi);
        } else {
            calcMonthlyEmiEl.textContent = '$----';
        }
    }

    /**
     * Formats a number as USD currency.
     * @param {number} amount - The amount to format.
     * @returns {string} - Formatted currency string.
     */
    function formatCurrency(amount) {
        if (isNaN(amount) || amount === null) return '$----';
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }


    /**
     * Calculates and updates all price components.
     */
    function calculateAndUpdatePrices() {
        const goldRatePerGram22K = parseFloat(goldRateEl.value) || 0;
        const goldWeightGrams = parseFloat(goldWeightEl.value) || 0;
        const selectedPurity = parseInt(goldPurityEl.value) || 22;
        const stonePrice = parseFloat(stoneValueEl.value) || 0;
        const makingChargesPercent = parseFloat(makingChargesPercentageEl.value) || 0;

        // Adjust gold rate based on purity (assuming goldRateEl is for 22K)
        // Standard purities: 22K = 91.6%, 18K = 75%, 14K = 58.3%
        // For simplicity, we'll scale the 22K rate. A more accurate model would use live rates for each purity.
        let purityFactor = 1;
        if (selectedPurity === 18) purityFactor = 18 / 22;
        else if (selectedPurity === 14) purityFactor = 14 / 22;

        const actualGoldRate = goldRatePerGram22K * purityFactor;
        const currentGoldValue = actualGoldRate * goldWeightGrams;
        let currentMakingCharges = currentGoldValue * (makingChargesPercent / 100);

        let subtotalBeforeGst = currentGoldValue + stonePrice + currentMakingCharges;
        let discountAmount = 0;

        if (festiveOfferToggleEl.checked) {
            discountAmount = currentMakingCharges * 0.10;
            subtotalBeforeGst -= discountAmount;
            discountAppliedMessageEl.textContent = `Festive Discount Applied: -${formatCurrency(discountAmount)} on Making Charges!`;
            discountAppliedMessageEl.style.display = 'block';
        } else {
            discountAppliedMessageEl.style.display = 'none';
        }

        const gstApplied = subtotalBeforeGst * 0.03;
        const finalTotalEstimate = subtotalBeforeGst + gstApplied;

        // Update UI
        calcGoldValueEl.textContent = formatCurrency(currentGoldValue);
        calcStoneValueEl.textContent = formatCurrency(stonePrice);
        calcMakingChargesEl.textContent = formatCurrency(currentMakingCharges);
        calcSubtotalEl.textContent = formatCurrency(subtotalBeforeGst);
        calcGstEl.textContent = formatCurrency(gstApplied);
        calcTotalEstimateEl.textContent = formatCurrency(finalTotalEstimate);

        loanAmountEl.value = finalTotalEstimate > 0 ? finalTotalEstimate.toFixed(2) : '0.00';
        updateEMIDisplay();
    }

    // Event Listeners
    const inputsToWatch = [goldRateEl, goldWeightEl, goldPurityEl, stoneValueEl, makingChargesPercentageEl];
    inputsToWatch.forEach(el => {
        if (el) el.addEventListener('input', calculateAndUpdatePrices);
    });

    if (festiveOfferToggleEl) {
        festiveOfferToggleEl.addEventListener('change', calculateAndUpdatePrices);
    }

    if (emiTenureEl) {
        emiTenureEl.addEventListener('change', updateEMIDisplay); // Only EMI changes, not the whole price
    }

    if (calculatePriceBtnEl) { // Main calculate button
        calculatePriceBtnEl.addEventListener('click', calculateAndUpdatePrices);
    }

    if (fetchGoldRateBtnEl) {
        fetchGoldRateBtnEl.addEventListener('click', () => {
            // Simulate fetching a new gold rate
            const randomRate = (Math.random() * (6200 - 5300) + 5300).toFixed(0); // Random rate between 5300 and 6200
            goldRateEl.value = randomRate;
            console.log(`Simulated new gold rate: ${randomRate}`);
            calculateAndUpdatePrices(); // Recalculate with the new rate
        });
    }

    // Initial calculation on page load
    calculateAndUpdatePrices();
});
