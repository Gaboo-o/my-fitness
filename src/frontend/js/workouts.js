// Workouts page: generated exercises, completion tracking, and timer.
const pickWorkoutButton = document.getElementById("pickWorkout");
const workoutResults = document.getElementById("workoutResults");
const saveWorkoutButton = document.getElementById("saveWorkoutBtn");
const saveMessage = document.getElementById("saveMessage");
let selectedWorkout = null;
const loadCustomExercisesButton = document.getElementById("loadCustomExercises");
const customExerciseList =document.getElementById("customExerciseList");
const useCustomWorkoutButton = document.getElementById("useCustomWorkout");
const customWorkoutMessage = document.getElementById("customWorkoutMessage");
let customExercises = [];
const timerDurationInput = document.getElementById("timerDuration");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resetTimerButton = document.getElementById("resetTimer");
const timerMessage = document.getElementById("timerMessage");
let timerInterval = null;
let remainingSeconds = Number(timerDurationInput.value);
let isPaused = false;
let timerPhase = "work";
let timerDeadline = null;
const restDurationInput = document.getElementById("restDuration");
const timerPhaseLabel = document.getElementById("timerPhase");

// Read the saved goal instead of looking for the Profile form on this page.
let savedFitnessGoal = "";
fetch(API.profile)
    .then(response => {
        if (!response.ok) throw new Error("Could not load fitness preferences.");
        return response.json();
    })
    .then(profile => { savedFitnessGoal = String(profile.fitnessGoal || ""); })
    .catch(error => console.warn(error.message));

loadCustomExercisesButton.addEventListener("click", async () => {
    const type = document.getElementById("customWorkoutType").value;
    const location = document.getElementById("customWorkoutLocation").value;

    customWorkoutMessage.textContent = "Loading exercises...";
    customExerciseList.innerHTML = "";
    useCustomWorkoutButton.disabled = true;

    try {
        customExercises = await fetchExercises(type, location);

        if (customExercises.length === 0) {
            customWorkoutMessage.textContent =
                "No exercises match your selections.";
            return;
        }

        customExercises.forEach((exercise) => {
            const label = document.createElement("label");
            label.style.display = "block";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "custom-exercise";
            checkbox.value = exercise.id;

            checkbox.addEventListener("change", () => {
                useCustomWorkoutButton.disabled =
                    !customExerciseList.querySelector(
                        ".custom-exercise:checked"
                    );
            });

            label.append(
                checkbox,
                ` ${exercise.name}`
            );

            customExerciseList.appendChild(label);
        });

        customWorkoutMessage.textContent =
            "Select the exercises you want in your workout.";

    } catch (error) {
        customWorkoutMessage.textContent = error.message;
    }
});

//enter a custom workout

useCustomWorkoutButton.addEventListener("click", () => {
    const selectedIds = [
        ...customExerciseList.querySelectorAll(
            ".custom-exercise:checked"
        ),
    ].map((checkbox) => Number(checkbox.value));

    const selectedExercises = customExercises.filter(
        (exercise) => selectedIds.includes(exercise.id)
    );

    if (selectedExercises.length === 0) {
        customWorkoutMessage.textContent =
            "Select at least one exercise.";
        return;
    }

    selectedWorkout = {
        type: document.getElementById("customWorkoutType").value,
        location: document.getElementById("customWorkoutLocation").value,
        exercises: selectedExercises.map(
            (exercise) => exercise.name
        ),
    };

    workoutResults.innerHTML =
        "<h3>Your Custom Workout</h3>";

    selectedExercises.forEach((exercise) => {
        const row = document.createElement("div");
        renderExercise(row, exercise, "h4");

        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "workout-done";
        checkbox.addEventListener("change", updateCompleteButton);

        label.append(checkbox, " Completed");
        row.appendChild(label);
        workoutResults.appendChild(row);
    });

    saveWorkoutButton.style.display = "inline-block";
    saveWorkoutButton.disabled = true;
    saveMessage.textContent =
        "Complete every exercise before saving.";
});


    // Generate a workout using the selected filters.

pickWorkoutButton.addEventListener(
    "click",
    async () => {
        const selectedType =
            document.getElementById(
                "workoutType"
            ).value;

        const selectedLocation =
            document.getElementById(
                "workoutLocation"
            ).value;

        selectedWorkout = null;
        saveWorkoutButton.disabled = true;
        saveWorkoutButton.style.display = "none";
        saveMessage.textContent = "";

        try {
            const matchingExercises =
                await fetchExercises(
                    selectedType,
                    selectedLocation
                );

            workoutResults.innerHTML =
                "<h3>Your Workout</h3>";

            if (matchingExercises.length === 0) {
                workoutResults.innerHTML +=
                    "<p>No exercises match your selections.</p>";

                return;
            }

            const experience = document.getElementById("experienceLevel").value;
            const minutes = Number(document.getElementById("workoutDuration").value);
            const experienceOrder = ["beginner", "intermediate", "advanced"];
            const level = experienceOrder.indexOf(experience);
            const eligible = matchingExercises.filter(exercise => {
                const difficulty = (exercise.difficulty || "beginner").toLowerCase();
                return experienceOrder.indexOf(difficulty) <= level;
            });
            const goal = savedFitnessGoal.toLowerCase();
            const scoredExercises = eligible.map(exercise => {
                let preference = Math.random();
                if (/strength|muscle/.test(goal) &&
                    ["Chest", "Back", "Legs"].includes(exercise.muscleGroup)) preference += 2;
                if (/cardio|endurance/.test(goal) &&
                    ["Full Body", "Legs"].includes(exercise.muscleGroup)) preference += 2;
                return { exercise, preference };
            });
            const shuffledExercises = scoredExercises
                .sort((a, b) => b.preference - a.preference)
                .map(item => item.exercise);
            let plannedMinutes = 0;
            const workout = shuffledExercises.filter(exercise => {
                const duration = Number(exercise.estimatedMinutes || 8);
                if (plannedMinutes + duration > minutes || plannedMinutes >= minutes) return false;
                plannedMinutes += duration;
                return true;
            }).slice(0, 5);

            if (!workout.length) {
                workoutResults.textContent = "No exercises fit your time and experience settings.";
                return;
            }
            selectedWorkout = {
                type: selectedType,
                location: selectedLocation,
                exercises: workout.map(exercise => exercise.name),
            };
            saveWorkoutButton.style.display = "inline-block";
            workout.forEach(exercise => {
                const row = document.createElement("div");
                renderExercise(row, exercise, "h4");
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "workout-done";
                checkbox.addEventListener("change", updateCompleteButton);
                label.append(checkbox, " Completed");
                row.appendChild(label);
                workoutResults.appendChild(row);
            });

        } catch (error) {
            console.error(error);

            workoutResults.textContent =
                error.message;
        }
    }
);


function updateCompleteButton() {
    const checks = [...workoutResults.querySelectorAll(".workout-done")];
    saveWorkoutButton.disabled = !selectedWorkout || checks.length === 0 ||
        !checks.every(checkbox => checkbox.checked);
}

// Save a workout after the user completes it.

saveWorkoutButton.addEventListener("click", async () => {
    if (!selectedWorkout || saveWorkoutButton.disabled) {
        saveMessage.textContent = "Complete every exercise before saving.";
        return;
    }

    saveWorkoutButton.disabled = true;
    saveMessage.textContent = "Saving workout...";

    try {
        const response = await fetch(API.history, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedWorkout),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to save workout.");
        }

        saveMessage.textContent = result.message || "Workout saved successfully.";
        selectedWorkout = null;
        saveWorkoutButton.style.display = "none";
        // Progress updates when the Progress page is opened.
        window.dispatchEvent(new Event("workout-completed"));
    } catch (error) {
        console.error(error);
        saveMessage.textContent = error.message;
    } finally {
        updateCompleteButton();
    }
});

// Control the work/rest interval timer.

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
    timerPhaseLabel.textContent = timerPhase === "work" ? "Work" : "Rest";
}

function validDuration(input) {
    const value = Number(input.value);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function tick() {
    remainingSeconds = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    if (remainingSeconds === 0) {
        if (timerPhase === "work") {
            timerPhase = "rest";
            remainingSeconds = validDuration(restDurationInput);
            if (remainingSeconds === null) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerMessage.textContent = "Enter a valid rest duration.";
                return;
            }
            timerDeadline = Date.now() + remainingSeconds * 1000;
            timerMessage.textContent = "Rest interval in progress...";
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            timerPhase = "work";
            remainingSeconds = validDuration(timerDurationInput) || 30;
            timerMessage.textContent = "Work and rest intervals complete!";
        }
    }
    updateTimerDisplay();
}

startTimerButton.addEventListener("click", () => {
    if (timerInterval !== null) return;
    if (!isPaused) {
        timerPhase = "work";
        remainingSeconds = validDuration(timerDurationInput);
        if (remainingSeconds === null || validDuration(restDurationInput) === null) {
            timerMessage.textContent = "Enter valid work and rest durations.";
            return;
        }
    }
    isPaused = false;
    timerDeadline = Date.now() + remainingSeconds * 1000;
    timerInterval = setInterval(tick, 250);
    timerMessage.textContent = "Interval in progress...";
    updateTimerDisplay();
});

pauseTimerButton.addEventListener("click", () => {
    if (timerInterval === null) return;
    tick();
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = true;
    timerMessage.textContent = "Timer paused.";
});

resetTimerButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false;
    timerPhase = "work";
    remainingSeconds = validDuration(timerDurationInput) || 30;
    updateTimerDisplay();
    timerMessage.textContent = "Timer reset.";
});

for (const input of [timerDurationInput, restDurationInput]) {
    input.addEventListener("change", () => {
        if (timerInterval === null && !isPaused) {
            remainingSeconds = validDuration(timerDurationInput) || 30;
            timerPhase = "work";
            updateTimerDisplay();
        }
    });
}

updateTimerDisplay();
