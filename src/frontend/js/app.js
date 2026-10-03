const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");

const pickWorkoutButton = document.getElementById("pickWorkout");
const workoutResults = document.getElementById("workoutResults");


// Load all exercises
loadButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/exercises");

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