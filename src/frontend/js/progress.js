// Progress page: statistics, weekly chart and workout history.
const weeklyWorkoutCount = document.getElementById("weeklyWorkoutCount");
const monthlyWorkoutCount = document.getElementById("monthlyWorkoutCount");
const refreshProgressButton = document.getElementById("refreshProgress");
const progressMessage = document.getElementById("progressMessage");

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
        document.getElementById("totalWorkoutCount").textContent = result.totalCount;
        document.getElementById("workoutStreak").textContent = result.streakDays;
        const chart = document.getElementById("weeklyChart");
        chart.replaceChildren();
        const maxCount = Math.max(1, ...result.dailyCounts.map(d => d.count));
        for (const day of result.dailyCounts) {
            const column = document.createElement("div");
            column.className = "chart-column";
            const bar = document.createElement("div");
            bar.className = "chart-bar";
            bar.style.height = `${Math.max(3, day.count / maxCount * 100)}%`;
            bar.title = `${day.date}: ${day.count} workouts`;
            const label = document.createElement("span");
            label.textContent = `${day.date.slice(5)} (${day.count})`;
            column.append(bar, label);
            chart.appendChild(column);
        }

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

// List completed workouts without depending on history.html elements.
async function loadWorkoutHistory() {
    const list = document.getElementById("historyList");
    try {
        const response = await fetch(API.history);
        if (!response.ok) throw new Error("Unable to load workout history.");
        const history = await response.json();
        if (!Array.isArray(history)) throw new Error("Unexpected workout history format.");
        list.replaceChildren();
        if (!history.length) {
            list.textContent = "No workouts recorded yet.";
            return;
        }
        [...history].reverse().forEach(workout => {
            const card = document.createElement("article");
            card.className = "history-card";
            const title = document.createElement("h3");
            title.textContent = workout.date || "Unknown date";
            card.appendChild(title);
            for (const [label, value] of [
                ["Type", workout.type || workout.workout || "Not recorded"],
                ["Location", workout.location || "Not recorded"],
                ["Exercises", Array.isArray(workout.exercises)
                    ? workout.exercises.join(", ") : "Not recorded"],
            ]) {
                const p = document.createElement("p");
                p.textContent = `${label}: ${value}`;
                card.appendChild(p);
            }
            list.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        list.textContent = "Unable to load workout history.";
    }
}

// Load charts and workout history whenever the Progress page opens.
loadProgressSummary();
loadWorkoutHistory();
refreshProgressButton.addEventListener("click", loadWorkoutHistory);
