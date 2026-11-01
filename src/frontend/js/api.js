// Shared API addresses and exercise rendering helpers used on multiple pages.
const API = {
    exercises: "/api/exercises",
    profile: "/api/profile",
    progress: "/api/progress",
    history: "/api/history",
    milestones: "/api/milestones",
};

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
    const heading = document.createElement(headingLevel);
    heading.textContent = exercise.name;
    item.appendChild(heading);
    for (const [label, value] of [
        ["Type", exercise.type],
        ["Location", exercise.location],
        ["Muscle Group", exercise.muscleGroup],
        ["Difficulty", exercise.difficulty || "All levels"],
        ["Instructions", exercise.instructions || "Follow proper form."],
    ]) {
        const line = document.createElement("p");
        line.textContent = `${label}: ${value}`;
        item.appendChild(line);
    }

    container.appendChild(item);
}
