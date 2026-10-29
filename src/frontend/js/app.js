
const API = {
    exercises: "/api/exercises",
    profile: "/api/profile",
};

// -------------------------
// DOM Elements
// -------------------------

const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");

const pickWorkoutButton = document.getElementById("pickWorkout");
const workoutResults = document.getElementById("workoutResults");

const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

const timerDurationInput = document.getElementById("timerDuration");
const timerDisplay = document.getElementById("timerDisplay");

const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resetTimerButton = document.getElementById("resetTimer");

const timerMessage = document.getElementById("timerMessage");

// Workout History elements, if available
const saveWorkoutButton = document.getElementById("saveWorkoutBtn");
const saveMessage = document.getElementById("saveMessage");

// -------------------------
// Application State
// -------------------------

let timerInterval = null;
let remainingSeconds = Number(timerDurationInput.value);
let isPaused = false;

let currentWorkout = [];
let currentWorkoutType = "";
let currentWorkoutLocation = "";

// -------------------------
// Personal Profile
// -------------------------

async function loadProfile() {
    try {
        const response = await fetch(API.profile);

        if (!response.ok) {
            throw new Error("Failed to load profile.");
        }

        const profile = await response.json();

        document.getElementById("profileName").value =
            profile.name ?? "";

        document.getElementById("profileAge").value =
            profile.age ?? "";

        document.getElementById("profileHeight").value =
            profile.height ?? "";

        document.getElementById("profileWeight").value =
            profile.weight ?? "";

        document.getElementById("fitnessGoal").value =
            profile.fitnessGoal ?? "";

    } catch (error) {
        console.error(error);

        profileMessage.textContent =
            "Unable to load profile.";
    }
}

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    profileMessage.textContent = "";

    const profileData = {
        name: document.getElementById("profileName").value.trim(),

        age:
            document.getElementById("profileAge").value || null,

        height:
            document.getElementById("profileHeight").value || null,

        weight:
            document.getElementById("profileWeight").value || null,

        fitnessGoal:
            document.getElementById("fitnessGoal").value.trim(),
    };

    try {
        const response = await fetch(API.profile, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(profileData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Failed to save profile."
            );
        }

        profileMessage.textContent =
            result.message || "Profile saved successfully.";

    } catch (error) {
        console.error(error);

        profileMessage.textContent = error.message;
    }
});

// -------------------------
// Exercise Library API
// -------------------------

async function fetchExercises(type = "", location = "") {
    const url = new URL(
        API.exercises,
        window.location.origin
    );

    if (type) {
        url.searchParams.set("type", type);
    }

    if (location) {
        url.searchParams.set("location", location);
    }

    const response = await fetch(url);

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
            result.error || "Failed to load exercises."
        );
    }

    return response.json();
}

// -------------------------
// Render Exercise
// -------------------------

function renderExercise(
    container,
    exercise,
    headingLevel = "h3"
) {
    const item = document.createElement("div");

    const heading = document.createElement(headingLevel);
    heading.textContent = exercise.name ?? "Unknown Exercise";

    const type = document.createElement("p");
    type.textContent = `Type: ${exercise.type ?? "Unknown"}`;

    const location = document.createElement("p");
    location.textContent =
        `Location: ${exercise.location ?? "Unknown"}`;

    const muscleGroup = document.createElement("p");
    muscleGroup.textContent =
        `Muscle Group: ${exercise.muscleGroup ?? "Unknown"}`;

    item.appendChild(heading);
    item.appendChild(type);
    item.appendChild(location);
    item.appendChild(muscleGroup);

    container.appendChild(item);
}

// -------------------------
// Load Exercise Library
// -------------------------

loadButton.addEventListener("click", async () => {
    const selectedType =
        document.getElementById("typeFilter").value;

    const selectedLocation =
        document.getElementById("locationFilter").value;

    try {
        const exercises = await fetchExercises(
            selectedType,
            selectedLocation
        );

        exerciseList.innerHTML = "";

        if (exercises.length === 0) {
            exerciseList.textContent =
                "No exercises match your selections.";

            return;
        }

        exercises.forEach((exercise) => {
            renderExercise(
                exerciseList,
                exercise,
                "h3"
            );
        });

    } catch (error) {
        console.error(error);
        exerciseList.textContent = error.message;
    }
});

// -------------------------
// Workout Picker
// -------------------------

pickWorkoutButton.addEventListener("click", async () => {
    const selectedType =
        document.getElementById("workoutType").value;

    const selectedLocation =
        document.getElementById("workoutLocation").value;

    currentWorkout = [];
    currentWorkoutType = "";
    currentWorkoutLocation = "";

    workoutResults.innerHTML = "";

    if (saveWorkoutButton) {
        saveWorkoutButton.style.display = "none";
    }

    if (saveMessage) {
        saveMessage.textContent = "";
    }

    try {
        const matchingExercises = await fetchExercises(
            selectedType,
            selectedLocation
        );

        const heading = document.createElement("h3");
        heading.textContent = "Your Workout";
        workoutResults.appendChild(heading);

        if (matchingExercises.length === 0) {
            const message = document.createElement("p");

            message.textContent =
                "No exercises match your selections.";

            workoutResults.appendChild(message);
            return;
        }

        const shuffledExercises = [...matchingExercises];

        // Shuffle exercise list using Fisher-Yates.
        for (let i = shuffledExercises.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [
                shuffledExercises[i],
                shuffledExercises[j]
            ] = [
                shuffledExercises[j],
                shuffledExercises[i]
            ];
        }

        currentWorkout = shuffledExercises.slice(0, 3);

        currentWorkoutType = selectedType;
        currentWorkoutLocation = selectedLocation;

        currentWorkout.forEach((exercise) => {
            renderExercise(
                workoutResults,
                exercise,
                "h4"
            );
        });

        if (saveWorkoutButton) {
            saveWorkoutButton.style.display = "inline-block";
        }

    } catch (error) {
        console.error(error);
        workoutResults.textContent = error.message;
    }
});

// -------------------------
// Save Completed Workout
// -------------------------

if (saveWorkoutButton) {
    saveWorkoutButton.addEventListener("click", async () => {
        if (currentWorkout.length === 0) {
            if (saveMessage) {
                saveMessage.textContent =
                    "Please generate a workout first.";
            }

            return;
        }

        const today = new Date();

        const year = today.getFullYear();
        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        const workoutDate = `${year}-${month}-${day}`;

        const workoutData = {
            date: workoutDate,
            type: currentWorkoutType,
            location: currentWorkoutLocation,
            exercises: currentWorkout.map(
                (exercise) => exercise.name
            ),
        };

        saveWorkoutButton.disabled = true;

        try {
            const response = await fetch("/api/history", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(workoutData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to save workout."
                );
            }

            if (saveMessage) {
                saveMessage.textContent =
                    result.message || "Workout saved successfully.";
            }

            // Prevent saving the same generated workout twice.
            currentWorkout = [];
            saveWorkoutButton.style.display = "none";

        } catch (error) {
            console.error(error);

            if (saveMessage) {
                saveMessage.textContent = error.message;
            }

        } finally {
            saveWorkoutButton.disabled = false;
        }
    });
}

// -------------------------
// Workout Timer
// -------------------------

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return (
        `${String(minutes).padStart(2, "0")}:` +
        `${String(remaining).padStart(2, "0")}`
    );
}

// -------------------------
// Update Timer Display
// -------------------------

function updateTimerDisplay() {
    timerDisplay.textContent =
        formatTime(remainingSeconds);
}

// -------------------------
// Start or Resume Timer
// -------------------------

startTimerButton.addEventListener("click", () => {
    if (timerInterval !== null) {
        return;
    }

    if (!isPaused) {
        const selectedDuration =
            Number(timerDurationInput.value);

        if (
            !Number.isInteger(selectedDuration) ||
            selectedDuration <= 0
        ) {
            timerMessage.textContent =
                "Please enter a valid number of seconds.";

            return;
        }

        remainingSeconds = selectedDuration;

        updateTimerDisplay();
    }

    timerMessage.textContent =
        "Workout interval in progress...";

    isPaused = false;

    timerInterval = setInterval(() => {
        remainingSeconds -= 1;

        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);

            timerInterval = null;
            remainingSeconds = 0;
            isPaused = false;

            updateTimerDisplay();

            timerMessage.textContent =
                "Interval complete!";
        }
    }, 1000);
});

// -------------------------
// Pause Timer
// -------------------------

pauseTimerButton.addEventListener("click", () => {
    if (timerInterval !== null) {
        clearInterval(timerInterval);

        timerInterval = null;
        isPaused = true;

        timerMessage.textContent = "Timer paused.";
    }
});

// -------------------------
// Reset Timer
// -------------------------

resetTimerButton.addEventListener("click", () => {
    clearInterval(timerInterval);

    timerInterval = null;
    isPaused = false;

    const selectedDuration =
        Number(timerDurationInput.value);

    if (
        Number.isInteger(selectedDuration) &&
        selectedDuration > 0
    ) {
        remainingSeconds = selectedDuration;

    } else {
        remainingSeconds = 30;
        timerDurationInput.value = 30;
    }

    updateTimerDisplay();

    timerMessage.textContent = "Timer reset.";
});

// -------------------------
// Timer Duration Changed
// -------------------------

timerDurationInput.addEventListener("change", () => {
    if (timerInterval !== null || isPaused) {
        return;
    }

    const selectedDuration =
        Number(timerDurationInput.value);

    if (
        Number.isInteger(selectedDuration) &&
        selectedDuration > 0
    ) {
        remainingSeconds = selectedDuration;

        updateTimerDisplay();

        timerMessage.textContent = "";
    }
});

// -------------------------
// Initial Page Setup
// -------------------------

updateTimerDisplay();
loadProfile();
