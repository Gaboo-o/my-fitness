document.addEventListener("DOMContentLoaded", async () => {
    const historyList = document.getElementById("historyList");
    const totalWorkouts = document.getElementById("totalWorkouts");
    const weeklyWorkouts = document.getElementById("weeklyWorkouts");
    const monthlyWorkouts = document.getElementById("monthlyWorkouts");

    try {
        const [historyResponse, progressResponse] = await Promise.all([
            fetch("/api/history"),
            fetch("/api/progress"),
        ]);
        if (!historyResponse.ok || !progressResponse.ok) {
            throw new Error("Failed to load workout data.");
        }
        const history = await historyResponse.json();
        const progress = await progressResponse.json();
        if (!Array.isArray(history)) throw new Error("Invalid workout history.");

        totalWorkouts.textContent = history.length;
        weeklyWorkouts.textContent = progress.weeklyCount;
        monthlyWorkouts.textContent = progress.monthlyCount;
        historyList.replaceChildren();
        if (history.length === 0) {
            historyList.textContent = "No workouts completed yet.";
            return;
        }
        [...history].reverse().forEach(workout => {
            const item = document.createElement("div");
            item.style.border = "1px solid #ccc";
            item.style.padding = "12px";
            item.style.marginTop = "12px";
            const heading = document.createElement("h3");
            heading.textContent = workout.date || "Unknown date";
            item.appendChild(heading);
            const details = [
                ["Type", workout.type || workout.workout || "Unknown"],
                ["Location", workout.location || "Unknown"],
                ["Exercises", Array.isArray(workout.exercises) ? workout.exercises.join(", ") : "Not recorded"],
            ];
            details.forEach(([label, value]) => {
                const paragraph = document.createElement("p");
                const strong = document.createElement("strong");
                strong.textContent = `${label}: `;
                paragraph.appendChild(strong);
                paragraph.appendChild(document.createTextNode(value));
                item.appendChild(paragraph);
            });
            historyList.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        historyList.textContent = "Unable to load workout history.";
    }
});
