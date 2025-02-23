const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));

// ✅ Serve solo.html when visiting "/"
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/solo.html");
});

// ✅ Fetch ALL Manga with Covers & Top Chapters
app.get("/api/manga", async (req, res) => {
    try {
        console.log("📢 Fetching ALL manga from MangaDex...");

        const response = await fetch("https://api.mangadex.org/manga?limit=50&includes[]=cover_art&availableTranslatedLanguage[]=en");
        if (!response.ok) {
            throw new Error(`MangaDex API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // ✅ Fetch Top Two Chapters for Each Manga
        const mangaList = await Promise.all(data.data.map(async (manga) => {
            const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
            const coverFilename = coverRel?.attributes?.fileName;
            const coverURL = coverFilename
                ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFilename}.256.jpg`
                : "https://placehold.co/150x220?text=No+Cover";

            // ✅ Fetch Top 2 Chapters for Each Manga
            const chapterRes = await fetch(`https://api.mangadex.org/manga/${manga.id}/aggregate?translatedLanguage[]=en`);
            const chapterData = await chapterRes.json();
            const chapters = Object.values(chapterData.volumes || {}).flatMap(volume =>
                Object.values(volume.chapters || {})
            ).sort((a, b) => parseFloat(b.chapter) - parseFloat(a.chapter)) // Sort Descending

            return {
                id: manga.id,
                title: manga.attributes.title.en || "No Title",
                coverURL,
                latestChapters: chapters.slice(0, 2).map(ch => `Chapter ${ch.chapter}`)
            };
        }));

        res.json(mangaList);

    } catch (error) {
        console.error("❌ Error fetching manga:", error.message);
        res.status(500).json({ error: "Failed to fetch manga" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
