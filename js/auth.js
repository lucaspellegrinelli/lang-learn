document.addEventListener("alpine:init", () => {
    Alpine.store("auth", {
        userEmail: null,
        updateEmail: function() {
            if (pb.authStore.isValid) {
                this.userEmail = pb.authStore.model.email;
            } else {
                this.userEmail = null;
            }
        },
        login: async function() {
            await pb.collection("users").authWithOAuth2({ provider: "google" });
            this.updateEmail();
        },
        logout: function() {
            pb.authStore.clear();
            this.updateEmail();
        }
    });

    Alpine.store("auth").updateEmail();
});
