const API = {
    exercises: "/api/exercises",
    profile: "/api/profile",
};

const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");
const pickWorkoutButton = document.getElementById("pickWorkout");
const workoutResults = document.getElementById("workoutResults");
const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");


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

        document.getElementById("profileName").value = profile.name ?? "";
        document.getElementById("profileAge").value = profile.age ?? "";
        document.getElementById("profileHeight").value = profile.height ?? "";
        document.getElementById("profileWeight").value = profile.weight ?? "";
        document.getElementById("fitnessGoal").value = profile.fitnessGoal ?? "";
    } catch (error) {
        console.error(error);
        profileMessage.textContent = "Unable to load profile.";
    }
}


profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    profileMessage.textContent = "";

    const profileData = {
        name: document.getElementById("profileName").value.trim(),
        age: document.getElementById("profileAge").value || null,
        height: document.getElementById("profileHeight").value || null,
        weight: document.getElementById("profileWeight").value || null,
        fitnessGoal: document.getElementById("fitnessGoal").value.trim(),
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
            throw new Error(result.error || "Failed to save profile.");
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
    const url = new URL(API.exercises, window.location.origin);

    if (type) {
        url.searchParams.set("type", type);
    }

    if (location) {
        url.searchParams.set("location", location);
    }

    const response = await fetch(url);

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Failed to load exercises.");
    }

    return response.json();
}


function renderExercise(container, exercise, headingLevel = "h3") {
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
    const selectedType = document.getElementById("typeFilter").value;
    const selectedLocation = document.getElementById("locationFilter").value;

    try {
        const exercises = await fetchExercises(selectedType, selectedLocation);

        exerciseList.innerHTML = "";

        if (exercises.length === 0) {
            exerciseList.textContent = "No exercises match your selections.";
            return;
        }

        exercises.forEach((exercise) => {
            renderExercise(exerciseList, exercise, "h3");
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
    const selectedType = document.getElementById("workoutType").value;
    const selectedLocation = document.getElementById("workoutLocation").value;

    try {
        // Let the Flask route perform the filtering.
        const matchingExercises = await fetchExercises(
            selectedType,
            selectedLocation,
        );

        workoutResults.innerHTML = "<h3>Your Workout</h3>";

        if (matchingExercises.length === 0) {
            workoutResults.innerHTML += "<p>No exercises match your selections.</p>";
            return;
        }

        const shuffledExercises = [...matchingExercises].sort(
            () => Math.random() - 0.5,
        );

        const workout = shuffledExercises.slice(0, 3);

        workout.forEach((exercise) => {
            renderExercise(workoutResults, exercise, "h4");
        });
    } catch (error) {
        console.error(error);
        workoutResults.textContent = error.message;
    }
});


// Load any previously saved profile when the page opens.
loadProfile();
