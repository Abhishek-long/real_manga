const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public")); // ✅ Ensure 'public' directory is served

// ✅ Serve solo.html as the homepage
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/solo.html"); // ✅ Make sure solo.html is in the root directory
});

// ✅ Fetch ALL Manga
app.get("/api/manga", async (req, res) => {
    try {
        console.log("📢 Fetching ALL manga from MangaDex...");

        const response = await fetch("https://api.mangadex.org/manga?limit=50&includes[]=cover_art&availableTranslatedLanguage[]=en");
        if (!response.ok) throw new Error(`MangaDex API Error: ${response.status} ${response.statusText}`);

        const data = await response.json();

        const mangaList = data.data.map(manga => {
            const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
            const coverFilename = coverRel?.attributes?.fileName;
            const coverURL = coverFilename
                ? `/proxy-cover/${manga.id}/${coverFilename}`
                : "https://placehold.co/150x220?text=No+Cover";

            return {
                id: manga.id,
                title: manga.attributes.title.en || "No Title",
                coverURL
            };
        });

        res.json(mangaList);
    } catch (error) {
        console.error("❌ Error fetching manga:", error.message);
        res.status(500).json({ error: "Failed to fetch manga" });
    }
});

// ✅ Fetch Single Manga Details
app.get("/api/manga/:mangaId", async (req, res) => {
    try {
        const { mangaId } = req.params;
        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author`);
        if (!response.ok) throw new Error("MangaDex API Error");

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching manga details:", error);
        res.status(500).json({ error: "Failed to fetch manga details" });
    }
});

// ✅ Fetch Manga Chapters
app.get("/api/manga/:mangaId/chapters", async (req, res) => {
    try {
        const { mangaId } = req.params;
        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}/aggregate?translatedLanguage[]=en`);
        if (!response.ok) throw new Error("MangaDex API Error");

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching manga chapters:", error);
        res.status(500).json({ error: "Failed to fetch manga chapters" });
    }
});

// ✅ Proxy Manga Covers (Fixes Hotlinking Issue)
app.get("/proxy-cover/:mangaId/:filename", async (req, res) => {
    try {
        const { mangaId, filename } = req.params;
        const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${filename}.256.jpg`;

        const response = await fetch(coverUrl, { headers: { "Referer": "https://mangadex.org/" } });
        if (!response.ok) throw new Error("Failed to fetch cover image");

        res.set("Content-Type", response.headers.get("content-type"));
        response.body.pipe(res);
    } catch (error) {
        console.error("❌ Error fetching cover image:", error);
        res.status(500).send("Error fetching cover image");
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
