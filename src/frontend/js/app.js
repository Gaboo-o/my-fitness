const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");

loadButton.addEventListener("click", async () => {
    try {
        // Build URL with filter parameters
        const url = new URL("/api/exercises", window.location.origin);
        const selectedType = document.getElementById("typeFilter")?.value;
        const selectedLoc = document.getElementById("locationFilter")?.value;
        
        if (selectedType) url.searchParams.append("type", selectedType);
        if (selectedLoc) url.searchParams.append("location", selectedLoc);

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