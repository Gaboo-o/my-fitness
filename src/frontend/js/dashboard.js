// Dashboard: show quick statistics and links to deeper pages.
async function loadDashboard() {
    const message = document.getElementById("dashboardMessage");
    try {
        const [progressResponse, profileResponse] = await Promise.all([
            fetch(API.progress), fetch(API.profile),
        ]);
        if (!progressResponse.ok || !profileResponse.ok) {
            throw new Error("Could not load dashboard information.");
        }
        const progress = await progressResponse.json();
        const profile = await profileResponse.json();
        document.getElementById("dashboardGreeting").textContent =
            profile.name ? `Welcome back, ${profile.name}` : "Welcome to myFitness";
        document.getElementById("dashWeekly").textContent = progress.weeklyCount ?? 0;
        document.getElementById("dashMonthly").textContent = progress.monthlyCount ?? 0;
        document.getElementById("dashTotal").textContent = progress.totalCount ?? 0;
        document.getElementById("dashStreak").textContent = progress.streakDays ?? 0;
        message.textContent = "";
        try {
            const milestoneResponse = await fetch(API.milestones);
            if (!milestoneResponse.ok) throw new Error("Milestones unavailable");
            const milestones = await milestoneResponse.json();
            if (!Array.isArray(milestones)) throw new Error("Invalid milestones");
            const active = milestones.filter(m => m.status !== "completed");
            document.getElementById("dashGoals").textContent = active.length
                ? `${active.length} milestone${active.length === 1 ? "" : "s"} in progress`
                : "No active milestones. Create one in Progress.";
        } catch (milestoneError) {
            document.getElementById("dashGoals").textContent =
                "Milestones temporarily unavailable. Your workout totals are still shown.";
        }
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to load dashboard. Check that the server is running.";
    }
}

loadDashboard();
