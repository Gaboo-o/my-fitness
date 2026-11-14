// Exercise Library page: filter and display exercises.
const loadButton = document.getElementById("loadExercises");
const exerciseList = document.getElementById("exerciseList");

loadButton.addEventListener("click", async () => {
    const selectedType =
        document.getElementById("typeFilter").value;

    const selectedLocation =
        document.getElementById("locationFilter").value;

    loadButton.disabled = true;
    exerciseList.textContent = "Loading exercises...";
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
    } finally {
        loadButton.disabled = false;
    }
});

loadButton.click(); // Show all exercises when this page opens.
