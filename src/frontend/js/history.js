document.addEventListener("DOMContentLoaded", async () => {
    const historyList = document.getElementById("historyList");
    const totalWorkouts = document.getElementById("totalWorkouts");
    const weeklyWorkouts = document.getElementById("weeklyWorkouts");
    const monthlyWorkouts = document.getElementById("monthlyWorkouts");

    try {
        const response = await fetch("/api/history");
        if (!response.ok) throw new Error("Failed to load history data.");
        
        const history = await response.json();
        
        // Calculate totals, weekly, and monthly counts
        totalWorkouts.textContent = history.length;
        
        const now = new Date();
        let weeklyCount = 0;
        let monthlyCount = 0;

        history.forEach(workout => {
            const workoutDate = new Date(workout.date);
            // Calculate difference in days
            const diffTime = Math.abs(now - workoutDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays <= 7) weeklyCount++;
            if (diffDays <= 30) monthlyCount++;
        });

        weeklyWorkouts.textContent = weeklyCount;
        monthlyWorkouts.textContent = monthlyCount;

        historyList.innerHTML = "";

        if (history.length === 0) {
            historyList.innerHTML = "<p>No workouts completed yet.</p>";
            return;
        }

        // Display newest workouts first
        history.reverse().forEach(workout => {
            const item = document.createElement("div");
            item.style.border = "1px solid #ccc";
            item.style.padding = "12px";
            item.style.marginTop = "12px";

            item.innerHTML = `
                <h3>${workout.date}</h3>
                <p><strong>Type:</strong> ${workout.type}</p>
                <p><strong>Location:</strong> ${workout.location}</p>
                <p><strong>Exercises:</strong> ${workout.exercises.join(", ")}</p>
            `;
            historyList.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        historyList.innerHTML = "<p>Unable to load workout history.</p>";
    }
});