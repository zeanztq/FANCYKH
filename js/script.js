// DOM Elements
const uploadBtn = document.getElementById('uploadBtn');
const uploadPcBtn = document.getElementById('uploadPcBtn');
const importYoutubeBtn = document.getElementById('importYoutubeBtn');
const uploadModal = document.getElementById('uploadModal');
const youtubeModal = document.getElementById('youtubeModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const banner = document.querySelector('.banner');
const bannerControls = document.querySelectorAll('.banner-btn');

const banners = [
    "assets/images/banner1.jpg",
    "assets/images/banner2.jpg",
    "assets/images/banner3.jpg"
];

let currentBanner = 0;
// Find the most recent video
function getLatestVideo() {
  return videos.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

function updateBanner() {
  const latest = getLatestVideo();
  if (!latest) return;

  const banner = document.getElementById("latestBanner");
  const title = document.getElementById("bannerTitle");
  const desc = document.getElementById("bannerDescription");
  const bannerLink = document.getElementById("latestBannerLink");

  // Update banner background
  banner.style.backgroundImage = `url('${latest.thumbnail}')`;

  // Update text
  title.textContent = latest.title;
  desc.textContent = latest.description;

  // Update link (for example, open video.html?id=INDEX)
  // Assuming each video has a unique index in the array
  const videoIndex = videos.indexOf(latest);
  bannerLink.href = `video.html?id=${videoIndex}`;
}

// Run on page load
window.addEventListener("load", updateBanner);

// Example: when importing a new video
function importYouTubeVideo(url, title, description, thumbnail) {
  videos.push({
    title: title,
    description: description,
    thumbnail: thumbnail,
    user: "Imported",
    date: new Date().toISOString()
  });

  updateBanner(); // refresh banner with the new latest video
}

// Open modals
if (uploadBtn) uploadBtn.addEventListener('click', () => uploadModal.style.display = 'flex');
if (uploadPcBtn) uploadPcBtn.addEventListener('click', () => uploadModal.style.display = 'flex');
if (importYoutubeBtn) importYoutubeBtn.addEventListener('click', () => youtubeModal.style.display = 'flex');

// Close modals
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        youtubeModal.style.display = 'none';
    });
});

// Banner rotation
function changeBanner(index) {
    banner.style.opacity = 0;
    setTimeout(() => {
        banner.style.backgroundImage = `url('${banners[index]}')`;
        banner.style.opacity = 1;
        bannerControls.forEach(control => control.classList.remove('active'));
        bannerControls[index].classList.add('active');
        currentBanner = index;
    }, 500);
}

setInterval(() => {
    let nextBanner = (currentBanner + 1) % banners.length;
    changeBanner(nextBanner);
}, 5000);

window.addEventListener('load', () => changeBanner(0));
// Load uploaded videos into grids
window.addEventListener("DOMContentLoaded", () => {
  renderVideos("dynamicGrid");
});


// Hamburger menu
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

// YouTube Metadata Import
const fetchBtn = document.getElementById("fetchBtn");
if (fetchBtn) {
  fetchBtn.addEventListener("click", async () => {
    const url = document.getElementById("youtubeUrl").value;
    const videoId = url.split("v=")[1]?.split("&")[0];

    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    // Use YouTube oEmbed (public, no API key required)
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await res.json();

      document.getElementById("title").value = data.title;
      document.getElementById("thumbnail").value = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      document.getElementById("previewThumb").src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      document.getElementById("previewThumb").style.display = "block";

      // oEmbed doesn’t return description → placeholder
      document.getElementById("description").value = "Imported from YouTube. Add your description here.";
    } catch (err) {
      alert("Failed to fetch video info. Try again.");
    }
  });
}

// Save new upload
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const thumbnail = document.getElementById("thumbnail").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || !thumbnail) {
      alert("Title and thumbnail are required.");
      return;
    }

    // Save video data
    let videos = JSON.parse(localStorage.getItem("videos")) || [];
    videos.push({
      title,
      thumbnail,
      description,
      user: "You", // default user
      date: new Date().toISOString()
    });
    localStorage.setItem("videos", JSON.stringify(videos));

    // Show success
    document.getElementById("uploadMessage").style.display = "block";
    uploadForm.reset();
    document.getElementById("previewThumb").style.display = "none";
  });
}

// Render uploaded videos dynamically
function renderVideos(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let videos = JSON.parse(localStorage.getItem("videos")) || [];
  if (videos.length === 0) return;

  videos.reverse().forEach(video => {
    const div = document.createElement("div");
    div.className = "video-card";
    div.innerHTML = `
      <img src="${video.thumbnail}" alt="Thumbnail">
      <h3>${video.title}</h3>
      <p><i class="fas fa-user"></i> ${video.user}</p>
    `;
    container.prepend(div);
  });
}

// --- Save upload (same as before) ---
// [keep your uploadForm and renderVideos code from earlier]

// Make video cards clickable
function createVideoCard(video, index) {
  const div = document.createElement("div");
  div.className = "video-card";
  div.innerHTML = `
    <a href="watch.html?vid=${index}">
      <img src="${video.thumbnail}" alt="Thumbnail">
      <h3>${video.title}</h3>
      <p><i class="fas fa-user"></i> ${video.user}</p>
    </a>
  `;
  return div;
}

function renderVideos(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let videos = JSON.parse(localStorage.getItem("videos")) || [];
  if (videos.length === 0) return;

  videos.reverse().forEach((video, index) => {
    const card = createVideoCard(video, index);
    container.prepend(card);
  });
}

// --- Watch page loader ---
function loadWatchPage() {
  const watchContainer = document.getElementById("watchContainer");
  if (!watchContainer) return;

  const params = new URLSearchParams(window.location.search);
  const vidIndex = params.get("vid");

  let videos = JSON.parse(localStorage.getItem("videos")) || [];
  const video = videos[vidIndex];

  if (!video) {
    watchContainer.innerHTML = "<p>Video not found.</p>";
    return;
  }

  // Extract YouTube ID if possible
  let embedUrl = video.thumbnail.includes("img.youtube.com")
    ? `https://www.youtube.com/embed/${video.thumbnail.split("/vi/")[1].split("/")[0]}`
    : video.thumbnail; // fallback

  watchContainer.innerHTML = `
    <div class="watch-video">
      <iframe width="100%" height="480" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
      <h2>${video.title}</h2>
      <p><strong>By:</strong> ${video.user} | <em>${new Date(video.date).toLocaleDateString()}</em></p>
      <p>${video.description}</p>
    </div>
    <div class="comments-section">
      <h3><i class="fas fa-comments"></i> Comments</h3>
      <div id="commentList"></div>
      <form id="commentForm">
        <input type="text" id="commentInput" placeholder="Add a comment..." required>
        <button type="submit" class="btn">Post</button>
      </form>
    </div>
  `;

  // Load comments
  let comments = JSON.parse(localStorage.getItem(`comments_${vidIndex}`)) || [];
  const commentList = document.getElementById("commentList");
  comments.forEach(c => {
    let p = document.createElement("p");
    p.textContent = c;
    commentList.appendChild(p);
  });

  // Comment form
  document.getElementById("commentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("commentInput");
    const text = input.value.trim();
    if (!text) return;

    comments.push(text);
    localStorage.setItem(`comments_${vidIndex}`, JSON.stringify(comments));

    let p = document.createElement("p");
    p.textContent = text;
    commentList.appendChild(p);

    input.value = "";
  });
}

// Run watch page
window.addEventListener("DOMContentLoaded", () => {
  loadWatchPage();
});

function importYouTubeVideo(url, title, description, thumbnail) {
  videos.push({
    title: title,
    description: description,
    thumbnail: thumbnail,
    user: "Imported",
    date: new Date().toISOString()
  });

  updateBanner(); // refresh banner with the new latest video
}

// Elements
const bannerTitle = document.getElementById("bannerTitle");
const bannerDescription = document.getElementById("bannerDescription");
const latestBannerLink = document.getElementById("latestBannerLink");

// Example function: Update banner dynamically after importing/uploading a YouTube video
function updateBanner(youtubeUrl, title, description, thumbnailUrl) {
    const banner = document.getElementById("latestBanner");
    const bannerTitle = document.getElementById("bannerTitle");
    const bannerDescription = document.getElementById("bannerDescription");
    const latestBannerLink = document.getElementById("latestBannerLink");

    banner.style.backgroundImage = `url('${thumbnailUrl}')`;
    bannerTitle.textContent = title;
    bannerDescription.textContent = description;
    latestBannerLink.href = youtubeUrl;
};