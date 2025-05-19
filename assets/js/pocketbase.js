const pb = new PocketBase("https://pb.ellep.dev/");

const authStore = {
    userEmail: null,
    updateEmail: function () {
        this.userEmail = pb.authStore.isValid ? pb.authStore.model.email : null;
    },
    login: async function () {
        await pb.collection("users").authWithOAuth2({ provider: "google" });
        this.updateEmail();
        window.location.href = "/";
    },
    logout: function () {
        pb.authStore.clear();
        this.updateEmail();
        window.location.href = "/";
    }
}

const editorStore = {
    wordPacks: [],
    updateWordPacks: async function () {
        this.wordPacks = await pb.collection('wordpacks').getFullList({ expand: "words_via_pack", sort: "-name" });
    }
}

document.addEventListener("alpine:init", async () => {
    Alpine.store("auth", authStore);
    Alpine.store("auth").updateEmail();

    Alpine.store("editor", editorStore);
    await Alpine.store("editor").updateWordPacks();
});
