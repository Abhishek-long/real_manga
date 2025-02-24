const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

// ✅ Enable CORS and serve static files
app.use(cors());
app.use(express.static("public")); // Ensure 'public' contains solo.html, details.html, reader.html, etc.

// ✅ Serve Homepage (solo.html)
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/solo.html");
});

// ✅ Fetch All Manga from MangaDex
app.get("/api/manga", async (req, res) => {
    try {
        console.log("📢 Fetching ALL manga from MangaDex...");

        const response = await fetch("https://api.mangadex.org/manga?limit=100&includes[]=cover_art&availableTranslatedLanguage[]=en");
        if (!response.ok) throw new Error(`MangaDex API Error: ${response.status}`);

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

// ✅ Fetch Manga Details via Proxy API
app.get("/api/manga/:mangaId", async (req, res) => {
    try {
        const { mangaId } = req.params;
        console.log(`📢 Fetching details for Manga ID: ${mangaId}`);

        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author`);
        if (!response.ok) throw new Error("Failed to fetch manga details");

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching manga details:", error);
        res.status(500).json({ error: "Failed to fetch manga details" });
    }
});

// ✅ Fetch Chapters of a Manga
app.get("/api/manga/:mangaId/chapters", async (req, res) => {
    try {
        const { mangaId } = req.params;
        console.log(`📢 Fetching chapters for Manga ID: ${mangaId}`);

        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}/aggregate?translatedLanguage[]=en`);
        if (!response.ok) throw new Error("Failed to fetch chapters");

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching chapters:", error);
        res.status(500).json({ error: "Failed to fetch chapters" });
    }
});

// ✅ Fetch Chapter Pages via Proxy API
app.get("/api/chapter/:chapterId", async (req, res) => {
    try {
        const { chapterId } = req.params;
        console.log(`📢 Fetching pages for Chapter ID: ${chapterId}`);

        const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
        if (!response.ok) throw new Error("Failed to fetch chapter pages");

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching chapter pages:", error);
        res.status(500).json({ error: "Failed to fetch chapter pages" });
    }
});

// ✅ Proxy Chapter Images to Prevent Hotlinking Issues
app.get("/proxy-image/:hash/:filename", async (req, res) => {
    try {
        const { hash, filename } = req.params;
        const imageUrl = `https://uploads.mangadex.org/data/${hash}/${filename}`;

        console.log(`📢 Proxying image: ${imageUrl}`);

        const response = await fetch(imageUrl, { headers: { "Referer": "https://mangadex.org/" } });
        if (!response.ok) throw new Error("Failed to fetch image");

        res.set("Content-Type", response.headers.get("content-type"));
        response.body.pipe(res);
    } catch (error) {
        console.error("❌ Error fetching image:", error);
        res.status(500).send("Error fetching image");
    }
});
app.get("/proxy-cover/:mangaId/:filename", async (req, res) => {
    try {
        const { mangaId, filename } = req.params;
        const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${filename}.256.jpg`;

        console.log(`📢 Proxying cover image: ${imageUrl}`);

        const response = await fetch(imageUrl, { headers: { "Referer": "https://mangadex.org/" } });
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
