const API = {
    exercises: "/api/exercises",
    profile: "/api/profile",
    progress: "/api/progress",
    history: "/api/history",
};


const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");

const pickWorkoutButton = document.getElementById("pickWorkout");
const workoutResults = document.getElementById("workoutResults");
const saveWorkoutButton = document.getElementById("saveWorkoutBtn");
const saveMessage = document.getElementById("saveMessage");
let selectedWorkout = null;

const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

const timerDurationInput = document.getElementById("timerDuration");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resetTimerButton = document.getElementById("resetTimer");
const timerMessage = document.getElementById("timerMessage");

const weeklyWorkoutCount =
    document.getElementById("weeklyWorkoutCount");

const monthlyWorkoutCount =
    document.getElementById("monthlyWorkoutCount");

const refreshProgressButton =
    document.getElementById("refreshProgress");

const progressMessage =
    document.getElementById("progressMessage");


let timerInterval = null;
let remainingSeconds = Number(timerDurationInput.value);
let isPaused = false;


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
        profileMessage.textContent = "Unable to load profile.";
    }
}


profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    profileMessage.textContent = "";

    const profileData = {
        name: document
            .getElementById("profileName")
            .value
            .trim(),

        age:
            document.getElementById("profileAge").value ||
            null,

        height:
            document.getElementById("profileHeight").value ||
            null,

        weight:
            document.getElementById("profileWeight").value ||
            null,

        fitnessGoal: document
            .getElementById("fitnessGoal")
            .value
            .trim(),
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

        profileMessage.textContent = result.message;

    } catch (error) {
        console.error(error);
        profileMessage.textContent = error.message;
    }
});


// -------------------------
// Exercises
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
        const result =
            await response.json().catch(() => ({}));

        throw new Error(
            result.error || "Failed to load exercises."
        );
    }

    return response.json();
}


function renderExercise(
    container,
    exercise,
    headingLevel = "h3"
) {
    const item = document.createElement("div");

    item.innerHTML = `
        <${headingLevel}>${exercise.name}</${headingLevel}>
        <p>Type: ${exercise.type}</p>
        <p>Location: ${exercise.location}</p>
        <p>Muscle Group: ${exercise.muscleGroup}</p>
    `;

    container.appendChild(item);
}


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

            const shuffledExercises = [
                ...matchingExercises
            ].sort(
                () => Math.random() - 0.5
            );

            const workout =
                shuffledExercises.slice(0, 3);

            selectedWorkout = {
                type: selectedType,
                location: selectedLocation,
                exercises: workout.map((exercise) => exercise.name),
            };
            saveWorkoutButton.style.display = "inline-block";

            workout.forEach((exercise) => {
                renderExercise(
                    workoutResults,
                    exercise,
                    "h4"
                );
            });

        } catch (error) {
            console.error(error);

            workoutResults.textContent =
                error.message;
        }
    }
);


// -------------------------
// Save completed workout
// -------------------------
saveWorkoutButton.addEventListener("click", async () => {
    if (!selectedWorkout) {
        saveMessage.textContent = "Pick a workout first.";
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
        await loadProgressSummary();
    } catch (error) {
        console.error(error);
        saveMessage.textContent = error.message;
    } finally {
        saveWorkoutButton.disabled = false;
    }
});


// -------------------------
// Workout Timer
// -------------------------

function formatTime(seconds) {
    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        seconds % 60;

    return `${String(minutes).padStart(
        2,
        "0"
    )}:${String(remaining).padStart(
        2,
        "0"
    )}`;
}


function updateTimerDisplay() {
    timerDisplay.textContent =
        formatTime(remainingSeconds);
}


startTimerButton.addEventListener(
    "click",
    () => {
        if (timerInterval !== null) {
            return;
        }

        if (!isPaused) {
            const selectedDuration =
                Number(timerDurationInput.value);

            if (
                !Number.isInteger(
                    selectedDuration
                ) ||
                selectedDuration <= 0
            ) {
                timerMessage.textContent =
                    "Please enter a valid number of seconds.";

                return;
            }

            remainingSeconds =
                selectedDuration;

            updateTimerDisplay();
        }

        timerMessage.textContent =
            "Workout interval in progress...";

        isPaused = false;

        timerInterval = setInterval(
            () => {
                remainingSeconds -= 1;

                updateTimerDisplay();

                if (remainingSeconds <= 0) {
                    clearInterval(
                        timerInterval
                    );

                    timerInterval = null;
                    remainingSeconds = 0;
                    isPaused = false;

                    updateTimerDisplay();

                    timerMessage.textContent =
                        "Interval complete!";
                }
            },
            1000
        );
    }
);


pauseTimerButton.addEventListener(
    "click",
    () => {
        if (timerInterval !== null) {
            clearInterval(timerInterval);

            timerInterval = null;
            isPaused = true;

            timerMessage.textContent =
                "Timer paused.";
        }
    }
);


resetTimerButton.addEventListener(
    "click",
    () => {
        clearInterval(timerInterval);

        timerInterval = null;
        isPaused = false;

        const selectedDuration =
            Number(timerDurationInput.value);

        if (
            Number.isInteger(
                selectedDuration
            ) &&
            selectedDuration > 0
        ) {
            remainingSeconds =
                selectedDuration;
        } else {
            remainingSeconds = 30;

            timerDurationInput.value =
                30;
        }

        updateTimerDisplay();

        timerMessage.textContent =
            "Timer reset.";
    }
);


timerDurationInput.addEventListener(
    "change",
    () => {
        if (
            timerInterval !== null ||
            isPaused
        ) {
            return;
        }

        const selectedDuration =
            Number(timerDurationInput.value);

        if (
            Number.isInteger(
                selectedDuration
            ) &&
            selectedDuration > 0
        ) {
            remainingSeconds =
                selectedDuration;

            updateTimerDisplay();

            timerMessage.textContent = "";
        }
    }
);


// -------------------------
// Progress Summary
// -------------------------

async function loadProgressSummary() {
    progressMessage.textContent = "";

    try {
        const response =
            await fetch(API.progress);

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Failed to load progress."
            );
        }

        weeklyWorkoutCount.textContent =
            result.weeklyCount;

        monthlyWorkoutCount.textContent =
            result.monthlyCount;

    } catch (error) {
        console.error(error);

        progressMessage.textContent =
            error.message;
    }
}


refreshProgressButton.addEventListener(
    "click",
    loadProgressSummary
);


// -------------------------
// Initial Page Setup
// -------------------------

updateTimerDisplay();
loadProfile();
loadProgressSummary();
