async function fetchManhwa() {
    try {
        console.log("📢 Fetching Manga List...");
        const response = await fetch("/api/manga");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("🔍 Full Manga Data:", JSON.stringify(data, null, 2)); // ✅ Print full API response

        const mangaList = document.getElementById("manga-list");
        mangaList.innerHTML = ""; // Clear previous data

        data.data.forEach(manga => {
            const title = manga.attributes.title.en || "No Title";
            const id = manga.id;

            // ✅ Find the correct cover relationship
            const coverRel = manga.relationships.find(rel => rel.type === "cover_art");
            const coverId = coverRel?.id;
            const coverFilename = coverRel?.attributes?.fileName;

            console.log(`🖼️ Cover ID for "${title}": ${coverId}`);
            console.log(`🖼️ Cover Filename for "${title}": ${coverFilename}`);

            // ✅ Construct the correct cover URL if available
            let coverURL;
            if (coverFilename) {
                coverURL = `https://uploads.mangadex.org/covers/${id}/${coverFilename}.256.jpg`;
            } else {
                coverURL = "https://placehold.co/150x220?text=No+Cover"; // ✅ Fallback image
            }

            console.log(`🖼️ Cover URL for "${title}": ${coverURL}`);

            // Create separate div block for each manhwa
            const mangaItem = document.createElement("div");
            mangaItem.classList.add(
                "bg-gray-800", "p-4", "rounded-lg", "shadow-lg",
                "text-center", "cursor-pointer", "transition", "hover:scale-105"
            );
            mangaItem.innerHTML = `
                <img src="${coverURL}" alt="${title}" class="w-full h-52 object-cover rounded-lg mb-2">
                <h2 class="text-lg font-semibold">${title}</h2>
                <button onclick="openReader('${id}')" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Read Now
                </button>
            `;
            mangaList.appendChild(mangaItem);
        });

    } catch (error) {
        console.error("❌ Error fetching manhwa:", error);
    }
}

// Function to open the reader page with selected manga
function openReader(manhwaId) {
    window.location.href = `reader.html?manhwa=${manhwaId}`;
}

// Load manga list on page load
fetchManhwa();
