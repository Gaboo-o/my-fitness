// Profile page: load existing preferences and save form changes.
const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

async function loadProfile() {
    try {
        const response = await fetch(API.profile);

        if (!response.ok) {
            throw new Error("Failed to load profile.");
        }

        const profile = await response.json();

        document.getElementById("profileName").value =
            profile.name ?? "";

        document.getElementById("profileAge").value =
            profile.age ?? "";

        document.getElementById("profileHeight").value =
            profile.height ?? "";

        document.getElementById("profileWeight").value =
            profile.weight ?? "";

        document.getElementById("fitnessGoal").value =
            profile.fitnessGoal ?? "";

    } catch (error) {
        console.error(error);
        profileMessage.textContent = "Unable to load profile.";
    }
}


profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    profileMessage.textContent = "";

    const profileData = {
        name: document
            .getElementById("profileName")
            .value
            .trim(),

        age:
            document.getElementById("profileAge").value ||
            null,

        height:
            document.getElementById("profileHeight").value ||
            null,

        weight:
            document.getElementById("profileWeight").value ||
            null,

        fitnessGoal: document
            .getElementById("fitnessGoal")
            .value
            .trim(),
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
            throw new Error(
                result.error || "Failed to save profile."
            );
        }

        profileMessage.textContent = result.message;

    } catch (error) {
        console.error(error);
        profileMessage.textContent = error.message;
    }
});

loadProfile();
