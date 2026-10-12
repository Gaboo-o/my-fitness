document.addEventListener("DOMContentLoaded", async () => {
    const historyList = document.getElementById("historyList");
    const weeklyCountSpan = document.getElementById("weeklyCount");
    const monthlyCountSpan = document.getElementById("monthlyCount");

    try {
        const response = await fetch("/api/history");
        if (!response.ok) throw new Error("Failed to load history");
        
        const history = await response.json();
        
        // Calculate weekly and monthly workout counts
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let weeklyCount = 0;
        let monthlyCount = 0;

        historyList.innerHTML = "";

        history.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            if (workoutDate >= oneWeekAgo) weeklyCount++;
            if (workoutDate >= oneMonthAgo) monthlyCount++;

            // Display matching exercises
            const item = document.createElement("div");
            item.innerHTML = `
                <h3>${workout.date} - ${workout.type} at ${workout.location}</h3>
                <p>Exercises: ${workout.exercises.join(", ")}</p>
            `;
            historyList.appendChild(item);
        });

        // Display progress summary
        weeklyCountSpan.textContent = weeklyCount;
        monthlyCountSpan.textContent = monthlyCount;

    } catch (error) {
        console.error(error);
        historyList.innerHTML = "<p>Unable to load history.</p>";
    }
});