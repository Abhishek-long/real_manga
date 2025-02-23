const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("manhwa");

// Fetch Manga Details
async function fetchMangaDetails() {
    try {
        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art&includes[]=author`);
        if (!response.ok) throw new Error("Failed to fetch manga details");

        const data = await response.json();
        const manga = data.data;
        
        document.getElementById("manga-title").innerText = manga.attributes.title.en;
        document.getElementById("manga-description").innerText = manga.attributes.description.en || "No description available.";

        // Get Alternative Titles
        const alternativeTitles = manga.attributes.altTitles.map(alt => Object.values(alt)[0]).join(", ");
        document.getElementById("manga-alternative").innerText = alternativeTitles || "N/A";

        // Get Authors
        const authors = manga.relationships
            .filter(rel => rel.type === "author")
            .map(author => author.attributes.name)
            .join(", ");
        document.getElementById("manga-authors").innerText = authors || "N/A";

        // Get Publication Year
        document.getElementById("manga-year").innerText = manga.attributes.year || "Unknown";

        // Get Manga Status (Ongoing/Completed)
        document.getElementById("manga-status").innerText = manga.attributes.status === "ongoing" ? "Ongoing" : "Completed";

        // Get Genres
        const genres = manga.attributes.tags.map(tag => tag.attributes.name.en).join(", ");
        document.getElementById("manga-genres").innerText = genres || "N/A";

        // Get Last Updated Date
        document.getElementById("manga-updated").innerText = new Date(manga.attributes.updatedAt).toLocaleDateString();

        // Get Manga Cover
        const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
        const coverFilename = coverRel?.attributes?.fileName;
        document.getElementById("manga-cover").src = coverFilename 
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFilename}.256.jpg`
            : "https://placehold.co/150x220?text=No+Cover";

        // Fetch Rating and Review Count
        fetchMangaStats(mangaId);

    } catch (error) {
        console.error("❌ Error fetching manga details:", error);
    }
}

// Fetch Rating & Reviews
async function fetchMangaStats(mangaId) {
    try {
        const response = await fetch(`https://api.mangadex.org/statistics/manga/${mangaId}`);
        if (!response.ok) throw new Error("Failed to fetch manga statistics");

        const data = await response.json();
        const stats = data.statistics[mangaId];

        document.getElementById("manga-rating").innerText = stats.rating.average ? stats.rating.average.toFixed(1) : "N/A";
        document.getElementById("manga-reviews").innerText = stats.rating.count ? stats.rating.count : "N/A";
    } catch (error) {
        console.error("❌ Error fetching manga statistics:", error);
        document.getElementById("manga-rating").innerText = "N/A";
        document.getElementById("manga-reviews").innerText = "N/A";
    }
}

// Fetch Chapters
async function fetchChapters() {
    try {
        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}/aggregate?translatedLanguage[]=en`);
        if (!response.ok) throw new Error("Failed to fetch chapters");

        const data = await response.json();
        const chapterList = document.getElementById("chapter-list");
        chapterList.innerHTML = "";

        let chapterNumbers = [];
        let totalChapters = 0;

        for (let volume in data.volumes) {
            for (let ch in data.volumes[volume].chapters) {
                let chapter = data.volumes[volume].chapters[ch];
                chapterNumbers.push({ id: chapter.id, number: chapter.chapter });
                totalChapters++;
            }
        }

        // Update total chapters count
        document.getElementById("manga-total-chapters").innerText = totalChapters;

        chapterNumbers.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        chapterNumbers.forEach(chapter => {
            let chapterItem = document.createElement("div");
            chapterItem.classList.add("p-2", "hover:bg-gray-700", "cursor-pointer", "rounded-lg");
            chapterItem.innerHTML = `<a href="reader.html?manhwa=${mangaId}&chapter=${chapter.id}">Chapter ${chapter.number}</a>`;
            chapterList.appendChild(chapterItem);
        });
    } catch (error) {
        console.error("❌ Error fetching chapters:", error);
    }
}

// Load data on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchMangaDetails();
    fetchChapters();
});
