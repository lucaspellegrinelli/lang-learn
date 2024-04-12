const pb = new PocketBase("https://pb.ellep.dev/");

const authStore = {
    userEmail: null,
    updateEmail: function() {
        this.userEmail = pb.authStore.isValid ? pb.authStore.model.email : null;
    },
    login: async function() {
        await pb.collection("users").authWithOAuth2({ provider: "google" });
        this.updateEmail();
    },
    logout: function() {
        pb.authStore.clear();
        this.updateEmail();
    }
}

const editorStore = {
    wordPacks: [],
    updateWordPacks: async function() {
        this.wordPacks = await pb.collection('wordpacks').getFullList({ expand: "words_via_pack", sort: "-name" });
    },
}

document.addEventListener("alpine:init", () => {
    Alpine.store("auth", authStore);
    Alpine.store("auth").updateEmail();

    Alpine.store("editor", editorStore);
    Alpine.store("editor").updateWordPacks();
});
