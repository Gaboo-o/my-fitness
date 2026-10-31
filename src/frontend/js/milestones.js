
"use strict";

// Personal Workout Milestones frontend

(() => {
    const API_URL = "/api/milestones";

    const milestoneForm = document.getElementById("milestoneForm");
    const milestoneTitle = document.getElementById("milestoneTitle");
    const milestoneTarget = document.getElementById("milestoneTarget");
    const milestoneUnit = document.getElementById("milestoneUnit");
    const milestoneList = document.getElementById("milestoneList");
    const milestoneMessage = document.getElementById("milestoneMessage");
    const createButton = document.getElementById("createMilestoneBtn");
    const refreshButton = document.getElementById("refreshMilestones");

    const totalCount = document.getElementById("totalMilestones");
    const activeCount = document.getElementById("activeMilestones");
    const completedCount = document.getElementById("completedMilestones");

    // Display an operation message.
    function showMessage(message, isError = false) {
        milestoneMessage.textContent = message;
        milestoneMessage.style.color = isError ? "#b91c1c" : "#166534";
    }

    // Handle HTTP requests and backend errors.
    async function apiRequest(url, options = {}) {
        const response = await fetch(url, options);

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.error || `Request failed (${response.status}).`
            );
        }

        return result;
    }

    // Update summary counts.
    function updateSummary(milestones) {
        const completed = milestones.filter(
            (milestone) => milestone.status === "completed"
        ).length;

        totalCount.textContent = milestones.length;
        completedCount.textContent = completed;
        activeCount.textContent = milestones.length - completed;
    }

    // Create text elements safely.
    function makeElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    // Generate one milestone card.
    function createMilestoneCard(milestone) {
        const isCompleted = milestone.status === "completed";

        const target = Number(milestone.target);
        const progress = Number(milestone.progress);

        const percentage = target > 0
            ? Math.min(100, Math.max(0, (progress / target) * 100))
            : 0;

        const card = makeElement(
            "div",
            `milestone-card${isCompleted ? " completed" : ""}`
        );

        const header = makeElement("div", "milestone-card-header");

        const title = makeElement("h4", "", milestone.title);

        const status = makeElement(
            "span",
            `milestone-status${isCompleted ? " achieved" : ""}`,
            isCompleted ? "Completed" : "In Progress"
        );

        header.append(title, status);
        card.appendChild(header);

        // Progress information
        const progressInfo = makeElement(
            "div",
            "milestone-progress-info"
        );

        const progressText = makeElement(
            "span",
            "",
            `${progress} / ${target} ${milestone.unit}`
        );

        const percentageText = makeElement(
            "span",
            "",
            `${Math.round(percentage)}%`
        );

        progressInfo.append(progressText, percentageText);
        card.appendChild(progressInfo);

        // Accessible progress bar
        const progressBar = makeElement(
            "div",
            "milestone-progress-bar"
        );

        progressBar.setAttribute("role", "progressbar");
        progressBar.setAttribute("aria-label", milestone.title);
        progressBar.setAttribute("aria-valuemin", "0");
        progressBar.setAttribute("aria-valuemax", "100");
        progressBar.setAttribute(
            "aria-valuenow",
            String(Math.round(percentage))
        );

        const progressFill = makeElement(
            "div",
            "milestone-progress-fill"
        );

        progressFill.style.width = `${percentage}%`;
        progressBar.appendChild(progressFill);
        card.appendChild(progressBar);

        // Actions
        const actions = makeElement("div", "milestone-actions");

        const inputLabel = makeElement(
            "label",
            "",
            "Current progress:"
        );

        const progressInput = document.createElement("input");
        progressInput.type = "number";
        progressInput.min = "0";
        progressInput.step = "1";
        progressInput.required = true;
        progressInput.value = progress;
        progressInput.id = `progress-${milestone.id}`;

        inputLabel.htmlFor = progressInput.id;

        const updateButton = makeElement(
            "button",
            "",
            "Update Progress"
        );

        updateButton.type = "button";

        updateButton.addEventListener("click", async () => {
            const value = Number(progressInput.value);

            if (
                progressInput.value.trim() === "" ||
                !Number.isSafeInteger(value) ||
                value < 0
            ) {
                showMessage(
                    "Progress must be a non-negative whole number.",
                    true
                );
                return;
            }

            updateButton.disabled = true;

            try {
                const updated = await apiRequest(
                    `${API_URL}/${encodeURIComponent(milestone.id)}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ progress: value })
                    }
                );

                await loadMilestones();

                showMessage(
                    updated.status === "completed"
                        ? `Congratulations! "${updated.title}" is completed!`
                        : `Progress updated for "${updated.title}".`
                );
            } catch (error) {
                showMessage(error.message, true);
            } finally {
                updateButton.disabled = false;
            }
        });

        const deleteButton = makeElement(
            "button",
            "milestone-delete-btn",
            "Delete"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", async () => {
            const confirmed = window.confirm(
                `Delete milestone "${milestone.title}"?`
            );

            if (!confirmed) {
                return;
            }

            deleteButton.disabled = true;

            try {
                await apiRequest(
                    `${API_URL}/${encodeURIComponent(milestone.id)}`,
                    { method: "DELETE" }
                );

                await loadMilestones();
                showMessage("Milestone deleted successfully.");
            } catch (error) {
                showMessage(error.message, true);
                deleteButton.disabled = false;
            }
        });

        actions.append(
            inputLabel,
            progressInput,
            updateButton,
            deleteButton
        );

        card.appendChild(actions);

        if (isCompleted && milestone.completed_at) {
            const date = new Date(milestone.completed_at);

            if (!Number.isNaN(date.getTime())) {
                const completionText = makeElement(
                    "p",
                    "milestone-completion-date",
                    `Achieved on ${date.toLocaleDateString()}`
                );

                card.appendChild(completionText);
            }
        }

        return card;
    }

    // Retrieve and render all milestones.
    async function loadMilestones() {
        const milestones = await apiRequest(API_URL);

        if (!Array.isArray(milestones)) {
            throw new Error("Invalid milestone data received.");
        }

        updateSummary(milestones);

        milestoneList.replaceChildren();

        if (milestones.length === 0) {
            const emptyMessage = makeElement(
                "p",
                "milestone-empty",
                "No milestones yet. Create your first fitness goal!"
            );

            milestoneList.appendChild(emptyMessage);
            return;
        }

        milestones.forEach((milestone) => {
            milestoneList.appendChild(
                createMilestoneCard(milestone)
            );
        });
    }

    // Create a new milestone.
    milestoneForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = milestoneTitle.value.trim();
        const target = Number(milestoneTarget.value);
        const unit = milestoneUnit.value;

        if (!title) {
            showMessage("Please enter a milestone title.", true);
            return;
        }

        if (
            milestoneTarget.value.trim() === "" ||
            !Number.isSafeInteger(target) ||
            target <= 0
        ) {
            showMessage(
                "Target must be a positive whole number.",
                true
            );
            return;
        }

        createButton.disabled = true;

        try {
            await apiRequest(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    target,
                    unit
                })
            });

            milestoneForm.reset();
            await loadMilestones();

            showMessage("Milestone created successfully!");
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            createButton.disabled = false;
        }
    });

    // Refresh milestone data.
    refreshButton.addEventListener("click", async () => {
        refreshButton.disabled = true;

        try {
            await loadMilestones();
            showMessage("Milestones refreshed.");
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            refreshButton.disabled = false;
        }
    });

    // Load milestones when the page opens.
    loadMilestones().catch((error) => {
        milestoneList.replaceChildren();
        milestoneList.appendChild(
            makeElement("p", "milestone-empty", "Unable to load milestones.")
        );
        showMessage(error.message, true);
    });
})();
