const urlParams = new URLSearchParams(window.location.search);
let manhwaId = urlParams.get("manhwa");  // Get manga ID from URL
let chapterId = urlParams.get("chapter"); // Get chapter ID from URL

async function fetchChapters() {
    try {
        let response = await fetch(`https://api.mangadex.org/manga/${manhwaId}/aggregate?translatedLanguage[]=en`);
        let data = await response.json();

        let chapterSelect = document.getElementById("chapterSelect");
        chapterSelect.innerHTML = "";

        for (let volume in data.volumes) {
            for (let ch in data.volumes[volume].chapters) {
                let chapter = data.volumes[volume].chapters[ch];
                let option = document.createElement("option");
                option.value = ch;
                option.textContent = `Chapter ${ch}`;
                chapterSelect.appendChild(option);
            }
        }

        // Set default chapter if not provided in URL
        if (!chapterId) {
            chapterId = chapterSelect.options[0]?.value;
        }

        loadChapter(chapterId);
    } catch (error) {
        console.error("Error fetching chapters:", error);
    }
}

async function loadChapter(chapterId) {
    try {
        let response = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
        let data = await response.json();

        let readerContainer = document.getElementById("reader-container");
        readerContainer.innerHTML = "";

        data.chapter.data.forEach(page => {
            let img = document.createElement("img");
            img.src = `${data.baseUrl}/data/${data.chapter.hash}/${page}`;
            img.classList.add("w-full", "rounded");
            readerContainer.appendChild(img);
        });

        document.getElementById("chapterSelect").value = chapterId;
    } catch (error) {
        console.error("Error loading chapter:", error);
    }
}

// Navigation Functions
function prevChapter() {
    let chapterSelect = document.getElementById("chapterSelect");
    let prevIndex = chapterSelect.selectedIndex - 1;
    if (prevIndex >= 0) {
        let prevChapterId = chapterSelect.options[prevIndex].value;
        window.location.href = `reader.html?manhwa=${manhwaId}&chapter=${prevChapterId}`;
    }
}

function nextChapter() {
    let chapterSelect = document.getElementById("chapterSelect");
    let nextIndex = chapterSelect.selectedIndex + 1;
    if (nextIndex < chapterSelect.options.length) {
        let nextChapterId = chapterSelect.options[nextIndex].value;
        window.location.href = `reader.html?manhwa=${manhwaId}&chapter=${nextChapterId}`;
    }
}

function jumpToChapter() {
    let selectedChapter = document.getElementById("chapterSelect").value;
    window.location.href = `reader.html?manhwa=${manhwaId}&chapter=${selectedChapter}`;
}

fetchChapters();
