const urlParams = new URLSearchParams(window.location.search);
const mangaId = urlParams.get("manhwa");
let currentChapter = urlParams.get("chapter");

// ✅ Fetch and Display Chapters Using Proxy API
async function fetchChapters() {
    try {
        console.log(`📢 Fetching chapters for manga ID: ${mangaId}...`);
        const response = await fetch(`/api/manga/${mangaId}/chapters`); // ✅ Uses proxy API

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📜 Full Chapter Data:", data);

        if (!data.volumes || Object.keys(data.volumes).length === 0) {
            console.error("❌ No chapters found.");
            document.getElementById("chapter-list").innerHTML = `<p class="text-red-500">No chapters available.</p>`;
            return;
        }

        const chapterSelect = document.getElementById("chapterSelect");
        chapterSelect.innerHTML = ""; // Clear previous options

        let chapterNumbers = [];
        for (let volume in data.volumes) {
            for (let ch in data.volumes[volume].chapters) {
                let chapter = data.volumes[volume].chapters[ch];
                chapterNumbers.push({ id: chapter.id, number: chapter.chapter });
            }
        }

        chapterNumbers.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        chapterNumbers.forEach(chapter => {
            let option = document.createElement("option");
            option.value = chapter.id;
            option.text = `Chapter ${chapter.number}`;
            chapterSelect.appendChild(option);
        });

        if (!currentChapter && chapterNumbers.length > 0) {
            currentChapter = chapterNumbers[0].id;
        }
        chapterSelect.value = currentChapter;
        loadChapter(currentChapter);

    } catch (error) {
        console.error("❌ Error fetching chapters:", error);
        document.getElementById("chapter-list").innerHTML = `<p class="text-red-500">Error loading chapters.</p>`;
    }
}

// ✅ Load Selected Chapter Pages Using Proxy
async function loadChapter(chapterId) {
    currentChapter = chapterId;

    try {
        console.log(`📖 Loading Chapter ${chapterId}...`);
        const response = await fetch(`/api/chapter/${chapterId}`); // ✅ Uses proxy API

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📄 Page Data:", data);

        const readerContainer = document.getElementById("reader-container");
        readerContainer.innerHTML = ""; // Clear previous pages

        data.chapter.data.forEach(page => {
            let img = document.createElement("img");
            img.src = `/proxy-image/${data.chapter.hash}/${page}`; // ✅ Uses proxy image route
            img.classList.add("w-full", "rounded-lg", "mb-4");
            readerContainer.appendChild(img);
        });

        document.getElementById("chapterSelect").value = chapterId;

    } catch (error) {
        console.error("❌ Error loading chapter:", error);
    }
}

// ✅ Navigation Functions
function nextChapter() {
    let chapterSelect = document.getElementById("chapterSelect");
    let nextIndex = chapterSelect.selectedIndex + 1;
    if (nextIndex < chapterSelect.options.length) {
        let nextChapterId = chapterSelect.options[nextIndex].value;
        window.location.href = `reader.html?manhwa=${mangaId}&chapter=${nextChapterId}`;
    }
}

function prevChapter() {
    let chapterSelect = document.getElementById("chapterSelect");
    let prevIndex = chapterSelect.selectedIndex - 1;
    if (prevIndex >= 0) {
        let prevChapterId = chapterSelect.options[prevIndex].value;
        window.location.href = `reader.html?manhwa=${mangaId}&chapter=${prevChapterId}`;
    }
}

function jumpToChapter() {
    let selectedChapter = document.getElementById("chapterSelect").value;
    window.location.href = `reader.html?manhwa=${mangaId}&chapter=${selectedChapter}`;
}

// ✅ Fetch chapters on page load
fetchChapters();
