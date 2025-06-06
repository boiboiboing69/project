console.log("ai-custom.js loaded");

// --- AIPromptParser ---
/**
 * Simulates parsing an AI prompt and generating design specifications.
 * @param {string} promptText - The user's textual prompt.
 * @returns {object} An object containing specJson, previewImageUrl, estimatedPrice, and approvalStatus.
 */
function parseAIPrompt(promptText) {
    const metals = ["gold", "silver", "platinum", "rose gold", "white gold", "22k gold", "18k gold"];
    const styles = ["minimalist", "vintage", "modern", "art deco", "classic", "bohemian"];
    const stones = ["diamond", "sapphire", "emerald", "ruby", "pearl", "amethyst", "opal"];
    const types = ["ring", "necklace", "earrings", "bracelet", "pendant"];

    const lowerPrompt = promptText.toLowerCase();
    const matchedKeywords = [];

    const findKeyword = (arr) => arr.find(k => lowerPrompt.includes(k));
    const findAllKeywords = (arr) => arr.filter(k => lowerPrompt.includes(k));

    const foundMetal = findKeyword(metals) || "Yellow Gold"; // Default if not found
    const foundStyle = findKeyword(styles) || "Elegant";
    const foundStone = findKeyword(stones) || "None";
    const foundType = findKeyword(types) || "Jewelry Piece";

    findAllKeywords(metals).forEach(k => matchedKeywords.push(k));
    findAllKeywords(styles).forEach(k => matchedKeywords.push(k));
    findAllKeywords(stones).forEach(k => matchedKeywords.push(k));
    findAllKeywords(types).forEach(k => matchedKeywords.push(k));

    const specJson = {
        type: foundType.charAt(0).toUpperCase() + foundType.slice(1),
        metal: foundMetal.charAt(0).toUpperCase() + foundMetal.slice(1),
        style: foundStyle.charAt(0).toUpperCase() + foundStyle.slice(1),
        stone: foundStone.charAt(0).toUpperCase() + foundStone.slice(1),
        originalPrompt: promptText,
        keywords: [...new Set(matchedKeywords)], // Unique keywords
        detail: `A ${foundStyle} ${foundMetal} ${foundType}` + (foundStone !== "None" ? ` with a ${foundStone}.` : '.')
    };

    const estimatedPrice = Math.floor(Math.random() * (5000 - 200) + 200); // Price between $200 and $5000
    const approvalStatuses = ["Pending Review", "AI Approved", "Needs Designer Input"];
    const approvalStatus = approvalStatuses[Math.floor(Math.random() * approvalStatuses.length)];

    const previewImageUrls = [
        "assets/images/placeholder-ai-design.jpg",
        "assets/images/placeholder-ring.jpg",
        "assets/images/placeholder-necklace.jpg",
        "assets/images/placeholder-earrings.jpg",
        "assets/images/placeholder-bracelet.jpg"
    ];
    const previewImageUrl = previewImageUrls[Math.floor(Math.random() * previewImageUrls.length)];

    return { specJson, previewImageUrl, estimatedPrice, approvalStatus, id: Date.now() }; // Added id here for consistency
}

// --- DesignQueue (localStorage wrapper) ---
const DESIGN_QUEUE_KEY = 'userLuxuryDesignsAI';

/**
 * Retrieves the design queue from localStorage.
 * @returns {Array<object>} An array of design objects.
 */
function getDesignQueue() {
    const designs = localStorage.getItem(DESIGN_QUEUE_KEY);
    return designs ? JSON.parse(designs) : [];
}

/**
 * Saves a design to the design queue in localStorage.
 * @param {object} designData - The design data to save.
 */
function saveDesignToQueue(designData) {
    let queue = getDesignQueue();
    // Ensure designData has an ID; if parseAIPrompt doesn't add it, add it here.
    if (!designData.id) {
        designData.id = Date.now();
    }
    queue.unshift(designData); // Add to the beginning
    queue = queue.slice(0, 5); // Keep the last 5 designs
    localStorage.setItem(DESIGN_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Removes a design from the queue in localStorage.
 * @param {number} designId - The ID of the design to remove.
 * @returns {Array<object>} The updated queue.
 */
function removeDesignFromQueue(designId) {
    let queue = getDesignQueue();
    queue = queue.filter(design => design.id !== designId);
    localStorage.setItem(DESIGN_QUEUE_KEY, JSON.stringify(queue));
    return queue;
}


// --- DOM Interaction Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const aiCustomizePage = document.querySelector('.ai-customize-page');
    if (!aiCustomizePage) {
        // console.log("Not on AI Customize page, ai-custom.js will not run specific logic.");
        return;
    }
    console.log("On AI Customize page, initializing logic.");

    // Element Selectors
    const promptTextEl = document.getElementById('ai-prompt-text');
    const generateBtnEl = document.getElementById('generate-ai-design-btn');
    const loaderEl = document.getElementById('ai-loader');
    const resultEl = document.getElementById('ai-result');
    const previewImageEl = document.getElementById('ai-preview-image');
    const specJsonEl = document.getElementById('ai-spec-json');
    const estimatedPriceEl = document.getElementById('ai-estimated-price');
    const approvalStatusEl = document.getElementById('ai-approval-status');
    const saveDesignBtnEl = document.getElementById('save-ai-design-btn');
    const designQueueListEl = document.getElementById('design-queue-list');
    const submitForApprovalBtnEl = document.getElementById('submit-for-approval-btn');
    const useAsBaseBtnOutputEl = document.getElementById('use-as-base-btn'); // From AI output section
    const aiErrorMessageEl = document.getElementById('ai-error-message');

    let currentAiResult = null;

    /**
     * Renders the design queue in the DOM.
     */
    function renderDesignQueue() {
        const queue = getDesignQueue();
        designQueueListEl.innerHTML = ''; // Clear current list

        if (queue.length === 0) {
            designQueueListEl.innerHTML = '<p class="empty-queue-message">Your saved designs will appear here. Start by generating a new design with AI!</p>';
            return;
        }

        queue.forEach(design => {
            const itemHtml = `
                <div class="design-queue-item" data-id="${design.id}">
                    <img src="${design.previewImageUrl || 'assets/images/placeholder-ai-design.jpg'}" alt="Saved Design Thumbnail">
                    <div class="design-item-info">
                        <h4>${design.specJson.type || 'Design'} - ${design.specJson.metal || 'Unknown Metal'}</h4>
                        <p>Stone: ${design.specJson.stone || 'None'}, Style: ${design.specJson.style || 'Generic'}</p>
                        <p>Price: $${design.estimatedPrice.toLocaleString()}</p>
                        <p>Status: <span class="status-${String(design.approvalStatus).toLowerCase().replace(/\s+/g, '-')}">${design.approvalStatus}</span></p>
                    </div>
                    <div class="design-item-actions">
                        <button class="cta-button tertiary-cta small-button use-this-base-btn">Use as Base</button>
                        <button class="cta-button danger-cta small-button remove-design-btn">Remove</button>
                    </div>
                </div>
            `;
            designQueueListEl.innerHTML += itemHtml;
        });
    }

    function displayErrorMessage(message) {
        if (aiErrorMessageEl) {
            aiErrorMessageEl.querySelector('p').textContent = message || "Oops! Something went wrong.";
            aiErrorMessageEl.style.display = 'block';
        }
        if (resultEl) resultEl.style.display = 'none';
        if (loaderEl) loaderEl.style.display = 'none';
    }

    function clearErrorMessage() {
        if (aiErrorMessageEl) aiErrorMessageEl.style.display = 'none';
    }


    // Event Listener for "Generate Design" Button
    if (generateBtnEl) {
        generateBtnEl.addEventListener('click', () => {
            const prompt = promptTextEl.value.trim();
            if (!prompt) {
                displayErrorMessage("Please enter a description for your jewelry design.");
                promptTextEl.focus();
                return;
            }
            clearErrorMessage();

            loaderEl.style.display = 'block';
            resultEl.style.display = 'none';
            currentAiResult = null; // Reset current result

            // Simulate AI processing time
            setTimeout(() => {
                try {
                    const result = parseAIPrompt(prompt);
                    currentAiResult = result; // Store the generated result

                    previewImageEl.src = result.previewImageUrl;
                    previewImageEl.alt = `AI Generated: ${result.specJson.type || 'Jewelry'}`;
                    specJsonEl.textContent = JSON.stringify(result.specJson, null, 2);
                    estimatedPriceEl.textContent = `$${result.estimatedPrice.toLocaleString()}`;
                    approvalStatusEl.textContent = result.approvalStatus;
                    approvalStatusEl.className = 'status-' + result.approvalStatus.toLowerCase().replace(/\s+/g, '-');


                    loaderEl.style.display = 'none';
                    resultEl.style.display = 'block';
                } catch (error) {
                    console.error("Error parsing AI prompt or updating DOM:", error);
                    displayErrorMessage("Failed to generate design. Please try again.");
                }
            }, 1500);
        });
    }

    // Event Listener for "Save to My Designs" Button
    if (saveDesignBtnEl) {
        saveDesignBtnEl.addEventListener('click', () => {
            if (currentAiResult) {
                saveDesignToQueue(currentAiResult);
                renderDesignQueue();
                // Provide feedback e.g. a temporary message or button text change
                const originalText = saveDesignBtnEl.textContent;
                saveDesignBtnEl.textContent = 'Saved!';
                saveDesignBtnEl.disabled = true;
                setTimeout(() => {
                    saveDesignBtnEl.textContent = originalText;
                    saveDesignBtnEl.disabled = false;
                }, 1500);
                currentAiResult = null; // Clear after saving to prevent duplicate saves of the same displayed result
            } else {
                displayErrorMessage("No AI design to save. Please generate a design first.");
            }
        });
    }

    // Event Delegation for "Remove" and "Use as Base" in Design Queue
    if (designQueueListEl) {
        designQueueListEl.addEventListener('click', (event) => {
            const target = event.target;
            const queueItem = target.closest('.design-queue-item');
            if (!queueItem) return;

            const designId = parseInt(queueItem.dataset.id);

            if (target.classList.contains('remove-design-btn')) {
                removeDesignFromQueue(designId);
                renderDesignQueue();
            } else if (target.classList.contains('use-this-base-btn')) {
                const queue = getDesignQueue();
                const designToUse = queue.find(d => d.id === designId);
                if (designToUse) {
                    promptTextEl.value = designToUse.specJson.originalPrompt || `A ${designToUse.specJson.style} ${designToUse.specJson.metal} ${designToUse.specJson.type} with ${designToUse.specJson.stone}.`;
                    // Optionally, also display this design in the AI output section
                    currentAiResult = designToUse; // Set as current to allow immediate saving/submitting
                    previewImageEl.src = designToUse.previewImageUrl;
                    specJsonEl.textContent = JSON.stringify(designToUse.specJson, null, 2);
                    estimatedPriceEl.textContent = `$${designToUse.estimatedPrice.toLocaleString()}`;
                    approvalStatusEl.textContent = designToUse.approvalStatus;
                    approvalStatusEl.className = 'status-' + designToUse.approvalStatus.toLowerCase().replace(/\s+/g, '-');
                    resultEl.style.display = 'block';
                    loaderEl.style.display = 'none';
                    clearErrorMessage();
                    promptTextEl.focus(); // Focus on prompt for further edits
                }
            }
        });
    }

    // Event Listener for "Submit for Approval" Button (from AI output)
    if (submitForApprovalBtnEl) {
        submitForApprovalBtnEl.addEventListener('click', () => {
            if (currentAiResult) {
                // In a real app, this would send data to a backend.
                // For now, simulate and update status.
                currentAiResult.approvalStatus = "Submitted for Review"; // Update status
                approvalStatusEl.textContent = currentAiResult.approvalStatus;
                approvalStatusEl.className = 'status-' + currentAiResult.approvalStatus.toLowerCase().replace(/\s+/g, '-');

                // If the item was saved, update it in the queue too.
                let queue = getDesignQueue();
                const existingIndex = queue.findIndex(d => d.id === currentAiResult.id);
                if (existingIndex > -1) {
                    queue[existingIndex] = currentAiResult;
                    localStorage.setItem(DESIGN_QUEUE_KEY, JSON.stringify(queue));
                    renderDesignQueue(); // Re-render to reflect status change if it was saved
                }

                displayErrorMessage("Design submitted for review! (Simulated)"); // Use error message styling for general feedback
                setTimeout(clearErrorMessage, 3000);

            } else {
                displayErrorMessage("No active AI design to submit. Please generate or 'Use as Base' first.");
            }
        });
    }

    // Event Listener for "Use as Base" Button (from AI output section)
    if (useAsBaseBtnOutputEl) {
        useAsBaseBtnOutputEl.addEventListener('click', () => {
            if (currentAiResult && currentAiResult.specJson) {
                promptTextEl.value = currentAiResult.specJson.originalPrompt || `A ${currentAiResult.specJson.style} ${currentAiResult.specJson.metal} ${currentAiResult.specJson.type} with ${currentAiResult.specJson.stone}.`;
                promptTextEl.focus();
            } else {
                 displayErrorMessage("No active AI design to use as a base. Please generate a design first.");
            }
        });
    }

    // Initial render of the design queue
    renderDesignQueue();
});
