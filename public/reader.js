const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("manhwa");
let currentChapter = urlParams.get("chapter");

// ✅ Fetch and Display Chapters
async function fetchChapters() {
    try {
        console.log(`📢 Fetching chapters for manga ID: ${mangaId}...`);
        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}/aggregate?translatedLanguage[]=en`);

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
        const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);

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
            img.src = `${data.baseUrl}/data/${data.chapter.hash}/${page}`;
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
        window.location.href = `reader.html?manhwa=${mangaId}&chapter=${nextChapterId}`;
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
