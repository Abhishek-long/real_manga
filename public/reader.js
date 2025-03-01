const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("manhwa");
let currentChapter = urlParams.get("chapter");

// ✅ Fetch and Display Chapters
async function fetchChapters() {
    try {
        console.log(`📢 Fetching chapters for manga ID: ${mangaId}...`);
        const response = await fetch(`/api/manga/${mangaId}/chapters`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📜 Full Chapter Data:", data);

        const chapterSelect = document.getElementById("chapterSelect");
        chapterSelect.innerHTML = ""; // Clear previous options

        let chapterNumbers = [];

        // ✅ Fix: Ensure correct chapter data extraction
        for (let volume in data.volumes) {
            for (let ch in data.volumes[volume].chapters) {
                let chapter = data.volumes[volume].chapters[ch];
                chapterNumbers.push({ id: chapter.id, number: chapter.chapter });
            }
        }

        // ✅ Sort chapters properly
        chapterNumbers.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        // ✅ Populate chapter dropdown
        chapterNumbers.forEach(chapter => {
            let option = document.createElement("option");
            option.value = chapter.id;
            option.text = `Chapter ${chapter.number}`;
            chapterSelect.appendChild(option);
        });

        // ✅ Select the first chapter if none is specified
        if (!currentChapter) {
            currentChapter = chapterNumbers[0]?.id;
        }
        chapterSelect.value = currentChapter;
        loadChapter(currentChapter);

    } catch (error) {
        console.error("❌ Error fetching chapters:", error);
    }
}

// ✅ Load Selected Chapter Pages
async function loadChapter(chapterId) {
    currentChapter = chapterId;

    try {
        console.log(`📖 Loading Chapter ${chapterId}...`);
        const response = await fetch(`/api/chapter/${chapterId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📄 Page Data:", data);

        const readerContainer = document.getElementById("reader-container");
        readerContainer.innerHTML = ""; // Clear previous pages

        // ✅ Load pages dynamically
        data.chapter.data.forEach(page => {
            let img = document.createElement("img");
            img.src = `/proxy-image/${data.chapter.hash}/${page}`;
            img.classList.add("w-full", "rounded-lg", "mb-4");
            readerContainer.appendChild(img);
        });

        // ✅ Update dropdown selection
        document.getElementById("chapterSelect").value = chapterId;

    } catch (error) {
        console.error("❌ Error loading chapter:", error);
    }
}

// ✅ Load Next Chapter
function nextChapter() {
    let chapterSelect = document.getElementById("chapterSelect");
    let nextIndex = chapterSelect.selectedIndex + 1;

    if (nextIndex < chapterSelect.options.length) {
        let nextChapterId = chapterSelect.options[nextIndex].value;

        // Open the ad link in a new tab
        window.open("https://www.effectiveratecpm.com/se7wve16?key=3df6575c23595c02eaee5f6f8d99f476", "_blank");

        // Redirect to the next chapter after a delay (e.g., 3 seconds)
        setTimeout(() => {
            window.location.href = `reader.html?manhwa=${mangaId}&chapter=${nextChapterId}`;
        }, 3000);
    } else {
        alert("No more chapters available!");
    }
}


// ✅ Load Previous Chapter
function prevChapter() {
    let chapterSelect = document.getElementById("chapterSelect");
    let prevIndex = chapterSelect.selectedIndex - 1;

    if (prevIndex >= 0) {
        let prevChapterId = chapterSelect.options[prevIndex].value;
        window.location.href = `reader.html?manhwa=${mangaId}&chapter=${prevChapterId}`;
    }
}

// ✅ Jump to Selected Chapter
function jumpToChapter() {
    let selectedChapter = document.getElementById("chapterSelect").value;
    window.location.href = `reader.html?manhwa=${mangaId}&chapter=${selectedChapter}`;
}

// ✅ Fetch chapters on page load
fetchChapters();
let mangaList = [];

async function preloadManga() {
    try {
        console.log("📢 Fetching manga list...");
        const response = await fetch('/api/manga');
        if (!response.ok) throw new Error('Failed to fetch manga list');
        mangaList = await response.json();
        console.log("✅ Manga list loaded:", mangaList);
    } catch (error) {
        console.error("❌ Error fetching manga:", error);
    }
}

// Ensure manga data is loaded when the page loads
document.addEventListener("DOMContentLoaded", preloadManga);



async function showSuggestions() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const suggestionBox = document.getElementById('suggestionBox');
    suggestionBox.innerHTML = '';

    if (query.length < 3) {
        suggestionBox.classList.add('hidden');
        return;
    }

    if (mangaList.length === 0) {
        console.warn("⚠ Manga list not loaded yet.");
        return;
    }

    const results = mangaList.filter(manga => manga.title.toLowerCase().includes(query));

    if (results.length > 0) {
        suggestionBox.classList.remove('hidden');
        results.forEach(manga => {
            let item = document.createElement('div');
            item.classList.add('p-2', 'hover:bg-gray-700', 'cursor-pointer', 'flex', 'items-center');
            item.innerHTML = `
                <img src="${manga.coverURL}" alt="${manga.title}" class="w-10 h-10 mr-2 rounded">
                <span>${manga.title}</span>
            `;
            item.onclick = () => {
                window.location.href = `reader.html?manhwa=${manga.id}`;
            };
            suggestionBox.appendChild(item);
        });
    } else {
        suggestionBox.classList.add('hidden');
    }
}




// Handle search when pressing "Enter" or clicking search button
function searchManga() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!query) {
        alert("❌ Please enter a search query!");
        return;
    }

    if (mangaList.length === 0) {
        alert("❌ Manga list is not loaded yet. Please try again in a few seconds.");
        return;
    }

    const foundManga = mangaList.find(manga => manga.title.toLowerCase().includes(query));

    if (foundManga) {
        window.location.href = `reader.html?manhwa=${foundManga.id}`;
    } else {
        alert("❌ No matching manga found!");
    }
}


// Listen for Enter key press in search bar
document.getElementById("searchInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchManga();
    }
});


// Load manga data when the page loads
document.addEventListener("DOMContentLoaded", preloadManga);