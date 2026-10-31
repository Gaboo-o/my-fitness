
const WEIGHT_API = "/api/weight";

// -------------------------
// DOM Elements
// -------------------------

const weightForm = document.getElementById("weightForm");
const weightInput = document.getElementById("weightInput");
const weightUnit = document.getElementById("weightUnit");
const weightDate = document.getElementById("weightDate");

const weightMessage =
    document.getElementById("weightMessage");

const latestWeight =
    document.getElementById("latestWeight");

const previousWeight =
    document.getElementById("previousWeight");

const weightChange =
    document.getElementById("weightChange");

// Date elements
const latestWeightDate =
    document.getElementById("latestWeightDate");

const previousWeightDate =
    document.getElementById("previousWeightDate");

const weightHistoryList =
    document.getElementById("weightHistoryList");

const displayWeightUnit =
    document.getElementById("displayWeightUnit");

const refreshWeightButton =
    document.getElementById("refreshWeight");

// -------------------------
// Application State
// -------------------------

const POUNDS_PER_KG = 2.2046226218;

let weightHistory = [];

// -------------------------
// Get Today's Local Date
// -------------------------

function getLocalToday() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

weightDate.value = getLocalToday();
weightDate.max = getLocalToday();

// -------------------------
// Format Date
// -------------------------

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const [year, month, day] =
        dateString.split("-").map(Number);

    const date = new Date(
        year,
        month - 1,
        day
    );

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// -------------------------
// Format Weight
// -------------------------

function formatWeight(weightKg) {
    const unit = displayWeightUnit.value;

    if (unit === "lb") {
        const weightLb = weightKg * POUNDS_PER_KG;

        return `${weightLb.toFixed(2)} lb`;
    }

    return `${Number(weightKg).toFixed(2)} kg`;
}

// -------------------------
// Format Weight Difference
// -------------------------

function formatWeightDifference(differenceKg) {
    const unit = displayWeightUnit.value;

    const difference =
        unit === "lb"
            ? differenceKg * POUNDS_PER_KG
            : differenceKg;

    const unitLabel =
        unit === "lb" ? "lb" : "kg";

    const sign =
        difference > 0 ? "+" : "";

    return `${sign}${difference.toFixed(2)} ${unitLabel}`;
}

// -------------------------
// Render Weight Summary
// -------------------------

function renderWeightSummary() {
    if (weightHistory.length === 0) {
        latestWeight.textContent = "--";
        previousWeight.textContent = "--";
        weightChange.textContent = "--";

        latestWeightDate.textContent = "";
        previousWeightDate.textContent = "";

        return;
    }

    const sortedHistory = [...weightHistory].sort(
        (a, b) => a.date.localeCompare(b.date)
    );

    const latest =
        sortedHistory[sortedHistory.length - 1];

    latestWeight.textContent =
        formatWeight(latest.weightKg);

    latestWeightDate.textContent =
        `(${formatDate(latest.date)})`;

    if (sortedHistory.length < 2) {
        previousWeight.textContent = "--";
        previousWeightDate.textContent = "";

        weightChange.textContent =
            "Not enough entries";

        return;
    }

    const previous =
        sortedHistory[sortedHistory.length - 2];

    previousWeight.textContent =
        formatWeight(previous.weightKg);

    previousWeightDate.textContent =
        `(${formatDate(previous.date)})`;

    const differenceKg =
        latest.weightKg - previous.weightKg;

    weightChange.textContent =
        formatWeightDifference(differenceKg);
}

// -------------------------
// Render Weight History
// -------------------------

function renderWeightHistory() {
    weightHistoryList.innerHTML = "";

    if (weightHistory.length === 0) {
        weightHistoryList.textContent =
            "No weight entries recorded yet.";

        return;
    }

    const sortedHistory = [...weightHistory].sort(
        (a, b) => b.date.localeCompare(a.date)
    );

    const table = document.createElement("table");

    const tableHead = document.createElement("thead");
    const headingRow = document.createElement("tr");

    ["Date", "Weight"].forEach((heading) => {
        const th = document.createElement("th");
        th.textContent = heading;
        headingRow.appendChild(th);
    });

    tableHead.appendChild(headingRow);
    table.appendChild(tableHead);

    const tableBody = document.createElement("tbody");

    sortedHistory.forEach((entry) => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = entry.date;

        const weightCell = document.createElement("td");
        weightCell.textContent =
            formatWeight(entry.weightKg);

        row.appendChild(dateCell);
        row.appendChild(weightCell);

        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    weightHistoryList.appendChild(table);
}

// -------------------------
// Load Weight History
// -------------------------

async function loadWeightHistory() {
    try {
        const response = await fetch(WEIGHT_API);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to load weight history."
            );
        }

        if (!Array.isArray(result)) {
            throw new Error(
                "Invalid weight history data."
            );
        }

        weightHistory = result;

        renderWeightHistory();
        renderWeightSummary();

    } catch (error) {
        console.error(error);

        weightMessage.textContent =
            error.message;

        weightHistoryList.textContent =
            "Unable to load weight history.";
    }
}

// -------------------------
// Save Weight Entry
// -------------------------

weightForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        weightMessage.textContent = "";

        const weightValue =
            Number(weightInput.value);

        const selectedUnit =
            weightUnit.value;

        const selectedDate =
            weightDate.value;

        if (
            !Number.isFinite(weightValue) ||
            weightValue <= 0
        ) {
            weightMessage.textContent =
                "Please enter a valid positive weight.";

            return;
        }

        if (!selectedDate) {
            weightMessage.textContent =
                "Please select a date.";

            return;
        }

        const entry = {
            weight: weightValue,
            unit: selectedUnit,
            date: selectedDate,
        };

        const saveButton =
            document.getElementById("saveWeight");

        saveButton.disabled = true;

        try {
            const response = await fetch(
                WEIGHT_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(entry),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to save weight."
                );
            }

            weightMessage.textContent =
                result.message ||
                "Weight saved successfully.";

            weightInput.value = "";

            await loadWeightHistory();

        } catch (error) {
            console.error(error);

            weightMessage.textContent =
                error.message;

        } finally {
            saveButton.disabled = false;
        }
    }
);

// -------------------------
// Refresh Weight History
// -------------------------

refreshWeightButton.addEventListener(
    "click",
    async () => {
        weightMessage.textContent = "";
        await loadWeightHistory();
    }
);

// -------------------------
// Change Display Unit
// -------------------------

displayWeightUnit.addEventListener(
    "change",
    () => {
        renderWeightHistory();
        renderWeightSummary();
    }
);

// -------------------------
// Initial Page Setup
// -------------------------

loadWeightHistory();
