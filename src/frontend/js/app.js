const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");

const pickWorkoutButton = document.getElementById("pickWorkout");
const workoutResults = document.getElementById("workoutResults");

const timerDurationInput = document.getElementById("timerDuration");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resetTimerButton = document.getElementById("resetTimer");
const timerMessage = document.getElementById("timerMessage");

let timerInterval = null;
let remainingSeconds = Number(timerDurationInput.value);
let isPaused = false;


// Load all exercises
loadButton.addEventListener("click", async () => {
    try {
        // Build URL with filter parameters
        const url = new URL("/api/exercises", window.location.origin);
        const selectedType = document.getElementById("typeFilter")?.value;
        const selectedLoc = document.getElementById("locationFilter")?.value;

        if (selectedType) {
            url.searchParams.append("type", selectedType);
        }

        if (selectedLoc) {
            url.searchParams.append("location", selectedLoc);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to load exercises.");
        }

        const exercises = await response.json();

        exerciseList.innerHTML = "";

        exercises.forEach((exercise) => {
            const item = document.createElement("div");

            item.innerHTML = `
                <h3>${exercise.name}</h3>
                <p>Type: ${exercise.type}</p>
                <p>Location: ${exercise.location}</p>
                <p>Muscle Group: ${exercise.muscleGroup}</p>
            `;

            exerciseList.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        exerciseList.textContent = "Unable to load exercises.";
    }
});


// Pick a workout based on type and location
pickWorkoutButton.addEventListener("click", async () => {
    const selectedType = document.getElementById("workoutType").value;
    const selectedLocation = document.getElementById("workoutLocation").value;

    try {
        const response = await fetch("/api/exercises");

        if (!response.ok) {
            throw new Error("Failed to load exercises.");
        }

        const exercises = await response.json();

        // Filter exercises based on user selections
        const matchingExercises = exercises.filter((exercise) => {
            return (
                exercise.type.toLowerCase() === selectedType.toLowerCase() &&
                exercise.location.toLowerCase() === selectedLocation.toLowerCase()
            );
        });

        workoutResults.innerHTML = "<h3>Your Workout</h3>";

        // Handle no matches
        if (matchingExercises.length === 0) {
            workoutResults.innerHTML += `
                <p>No exercises match your selections.</p>
            `;
            return;
        }

        // Shuffle the matching exercises
        const shuffledExercises = [...matchingExercises].sort(
            () => Math.random() - 0.5
        );

        // Choose up to 3 exercises
        const workout = shuffledExercises.slice(0, 3);

        workout.forEach((exercise) => {
            const item = document.createElement("div");

            item.innerHTML = `
                <h4>${exercise.name}</h4>
                <p>Type: ${exercise.type}</p>
                <p>Location: ${exercise.location}</p>
                <p>Muscle Group: ${exercise.muscleGroup}</p>
            `;

            workoutResults.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        workoutResults.textContent = "Unable to generate a workout.";
    }
});


// Convert seconds into MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}


// Update the timer display
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
}


// Start or resume the workout timer
startTimerButton.addEventListener("click", () => {
    if (timerInterval !== null) {
        return;
    }

    // If starting a new timer, get the duration from the input
    if (!isPaused) {
        const selectedDuration = Number(timerDurationInput.value);

        if (
            !Number.isInteger(selectedDuration) ||
            selectedDuration <= 0
        ) {
            timerMessage.textContent = "Please enter a valid number of seconds.";
            return;
        }

        remainingSeconds = selectedDuration;
        updateTimerDisplay();
    }

    timerMessage.textContent = "Workout interval in progress...";
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
            timerMessage.textContent = "Interval complete!";
        }
    }, 1000);
});


// Pause the workout timer
pauseTimerButton.addEventListener("click", () => {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;

        timerMessage.textContent = "Timer paused.";
    }
});


// Reset the workout timer
resetTimerButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false;

    const selectedDuration = Number(timerDurationInput.value);

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


// Update display when the duration is changed
timerDurationInput.addEventListener("change", () => {
    if (timerInterval !== null || isPaused) {
        return;
    }

    const selectedDuration = Number(timerDurationInput.value);

    if (
        Number.isInteger(selectedDuration) &&
        selectedDuration > 0
    ) {
        remainingSeconds = selectedDuration;
        updateTimerDisplay();
        timerMessage.textContent = "";
    }
});


// Set the initial timer display
updateTimerDisplay();