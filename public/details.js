const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("manhwa");

// ✅ Fetch Manga Details
async function fetchMangaDetails() {
    try {
        console.log(`📢 Fetching details for Manga ID: ${mangaId}`);
        const response = await fetch(`/api/manga/${mangaId}`);


        if (!response.ok) throw new Error("Failed to fetch manga details");

        const data = await response.json();
        console.log("📖 Manga Details Loaded:", data);

        if (!data.data) {
            throw new Error("No manga details found.");
        }

        const manga = data.data;

        document.getElementById("manga-title").innerText = manga.attributes.title.en || "No Title Available";

        // ✅ Ensure description is always available
        document.getElementById("manga-description").innerText = manga.attributes.description?.en 
            ? manga.attributes.description.en 
            : "No description available.";

        // ✅ Get Alternative Titles
        const alternativeTitles = manga.attributes.altTitles.map(alt => Object.values(alt)[0]).join(", ");
        document.getElementById("manga-alternative").innerText = alternativeTitles || "N/A";

        // ✅ Get Authors
        const authors = manga.relationships
            .filter(rel => rel.type === "author" && rel.attributes?.name)
            .map(author => author.attributes.name)
            .join(", ");
        document.getElementById("manga-authors").innerText = authors || "N/A";

        // ✅ Get Publication Year
        document.getElementById("manga-year").innerText = manga.attributes.year || "Unknown";

        // ✅ Get Manga Status (Ongoing/Completed)
        document.getElementById("manga-status").innerText = manga.attributes.status === "ongoing" ? "Ongoing" : "Completed";

        // ✅ Get Genres
        const genres = manga.attributes.tags.map(tag => tag.attributes.name.en).join(", ");
        document.getElementById("manga-genres").innerText = genres || "N/A";

        // ✅ Get Last Updated Date
        document.getElementById("manga-updated").innerText = new Date(manga.attributes.updatedAt).toLocaleDateString();

        // ✅ Fix Cover Image Using Proxy
        const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
        const coverFilename = coverRel?.attributes?.fileName;
        document.getElementById("manga-cover").src = `/proxy-cover/${manga.id}/${coverFilename}`;


        // ✅ Fetch Rating and Review Count
        fetchMangaStats(mangaId);

        // ✅ Fetch Chapters
        fetchChapters();

    } catch (error) {
        console.error("❌ Error fetching manga details:", error);
        document.getElementById("manga-description").innerText = "❌ Failed to load description.";
    }
}

// ✅ Fetch Rating & Reviews
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

// ✅ Fetch Chapters
async function fetchChapters() {
    try {
        console.log(`📢 Fetching chapters for Manga ID: ${mangaId}...`);
        const response = await fetch(`/api/manga/${mangaId}/chapters`);

        if (!response.ok) throw new Error("Failed to fetch chapters");

        const data = await response.json();
        console.log("📚 Chapter Data:", data);

        const chapterList = document.getElementById("chapter-list");
        chapterList.innerHTML = ""; // ✅ Clear previous chapters

        let chapterNumbers = [];
        let totalChapters = 0;

        // ✅ Ensure correct chapter data extraction
        for (let volume in data.volumes) {
            for (let ch in data.volumes[volume].chapters) {
                let chapter = data.volumes[volume].chapters[ch];
                chapterNumbers.push({ id: chapter.id, number: chapter.chapter });
                totalChapters++;
            }
        }

        // ✅ Update total chapters count
        document.getElementById("manga-total-chapters").innerText = totalChapters || "0";

        // ✅ Sort chapters properly
        chapterNumbers.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        // ✅ Populate chapter list
        chapterNumbers.forEach(chapter => {
            let chapterItem = document.createElement("div");
            chapterItem.classList.add("p-2", "hover:bg-gray-700", "cursor-pointer", "rounded-lg");
            chapterItem.innerHTML = `<a href="reader.html?manhwa=${mangaId}&chapter=${chapter.id}">Chapter ${chapter.number}</a>`;
            chapterList.appendChild(chapterItem);
        });

        if (chapterNumbers.length === 0) {
            chapterList.innerHTML = `<p class="text-gray-400">No chapters available.</p>`;
        }

    } catch (error) {
        console.error("❌ Error fetching chapters:", error);
        document.getElementById("chapter-list").innerHTML = `<p class="text-red-500">Failed to load chapters.</p>`;
    }
}

// ✅ Load Data on Page Load
document.addEventListener("DOMContentLoaded", fetchMangaDetails);