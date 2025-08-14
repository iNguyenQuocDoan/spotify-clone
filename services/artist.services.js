import { getArtistById } from "../api/artists.api.js";

let currentArtist = null;

export async function renderArtistDetail(artistId) {
  console.log("renderArtistDetail called with ID:", artistId);

  const mainContent = document.querySelector(".main-content");
  if (!mainContent) {
    console.error("Main content element not found");
    return;
  }

  try {
    // Lấy thông tin chi tiết ca sĩ
    const artistData = await getArtistById(artistId);
    console.log("Artist data:", artistData);
    currentArtist = artistData;

    // Tạo HTML cho trang chi tiết ca sĩ
    const artistDetailHtml = `
      <div class="artist-detail-page">
        <!-- Artist Hero Section -->
        <section class="artist-hero">
          <div class="hero-background">
            <img
              src="${
                artistData.image_url ||
                artistData.background_image_url ||
                "placeholder.svg"
              }"
              alt="${artistData.name} artist background"
              class="hero-image"
            />
            <div class="hero-overlay"></div>
          </div>
          <div class="hero-content">
            <div class="verified-badge">
              <i class="fas fa-check-circle"></i>
              <span>Verified Artist</span>
            </div>
            <h1 class="artist-name">${artistData.name}</h1>
            <p class="monthly-listeners">${formatListeners(
              artistData.total_plays || 0
            )} monthly listeners</p>
          </div>
        </section>

        <!-- Artist Controls -->
        <section class="artist-controls">
          <button class="play-btn-large">
            <i class="fas fa-play"></i>
          </button>
          <button class="follow-btn">Following</button>
          <button class="more-btn">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </section>

        <!-- Popular Tracks -->
        <section class="popular-section">
          <h2 class="section-title">Popular</h2>
          <div class="track-list" id="artistTracks">
            <div class="loading-message">Loading tracks...</div>
          </div>
        </section>

        <!-- Artist Albums -->
        <section class="albums-section">
          <div class="section-header">
            <h2 class="section-heading">Albums</h2>
            <button class="show-all-btn">Show all</button>
          </div>
          <div class="albums-grid" id="artistAlbums">
            <div class="loading-message">Loading albums...</div>
          </div>
        </section>

        <!-- Back to Home Button -->
        <div class="back-to-home">
          <button class="back-btn" id="backToHome">
            <i class="fas fa-arrow-left"></i>
            Back to Home
          </button>
        </div>
      </div>
    `;

    mainContent.innerHTML = artistDetailHtml;

    // Thêm sự kiện cho nút back
    const backBtn = document.getElementById("backToHome");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        showHomePage();
      });
    }

    // Load tracks của artist (nếu có API)
    loadArtistTracks(artistId);
  } catch (error) {
    console.error("Error loading artist detail:", error);
    mainContent.innerHTML = `
      <div class="error-message">
        <h2>Error loading artist</h2>
        <p>Could not load artist information.</p>
        <button class="back-btn" onclick="showHomePage()">
          <i class="fas fa-arrow-left"></i>
          Back to Home
        </button>
      </div>
    `;
  }
}

async function loadArtistTracks(artistId) {
  const tracksContainer = document.getElementById("artistTracks");
  if (!tracksContainer) return;

  try {
    // Giả sử có API để lấy tracks của artist
    // const tracks = await getTracksByArtist(artistId);

    // Tạm thời hiển thị tracks demo
    const demoTracks = [
      {
        id: 1,
        name: "Cho Tôi Lang Thang",
        plays: "27,498,341",
        duration: "4:18",
      },
      {
        id: 2,
        name: "Anh Đếch Cần Gì Nhiều Ngoài Em",
        plays: "15,234,567",
        duration: "3:45",
      },
      { id: 3, name: "Trốn Tìm", plays: "12,876,543", duration: "4:02" },
      {
        id: 4,
        name: "Bài Này Chill Phết",
        plays: "9,654,321",
        duration: "3:28",
      },
      {
        id: 5,
        name: "Mang Tiền Về Cho Mẹ",
        plays: "8,123,456",
        duration: "4:15",
      },
    ];

    const tracksHtml = demoTracks
      .map(
        (track, index) => `
      <div class="track-item">
        <div class="track-number">${index + 1}</div>
        <div class="track-image">
          <img
            src="placeholder.svg?height=40&width=40"
            alt="${track.name}"
          />
        </div>
        <div class="track-info">
          <div class="track-name">${track.name}</div>
        </div>
        <div class="track-plays">${track.plays}</div>
        <div class="track-duration">${track.duration}</div>
        <button class="track-menu-btn">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    `
      )
      .join("");

    tracksContainer.innerHTML = tracksHtml;
  } catch (error) {
    console.error("Error loading artist tracks:", error);
    tracksContainer.innerHTML =
      '<div class="error-message">Could not load tracks</div>';
  }
}

function formatListeners(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

export function showHomePage() {
  // Import và gọi lại renderHome
  import("./home.services.js").then(({ renderHome }) => {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      // Khôi phục nội dung home ban đầu
      mainContent.innerHTML = `
        <header class="main-header">
          <div class="search-container">
            <div class="search-box">
              <button class="home-btn">
                <i class="fas fa-home"></i>
              </button>
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="What do you want to play?"
                  class="search-input"
                />
              </div>
            </div>
          </div>
          <div class="header-actions">
            <div class="auth-buttons">
              <button class="auth-btn signup-btn">Sign up</button>
              <button class="auth-btn login-btn">Log in</button>
            </div>
            <div class="user-menu">
              <span class="user-name" id="userName">User Name</span>
              <button class="user-avatar" id="userAvatar">
                <img
                  src="placeholder.svg?height=32&width=32"
                  alt="User Avatar"
                />
              </button>
              <div class="user-dropdown" id="userDropdown">
                <button class="dropdown-item" id="logoutBtn">
                  <i class="fas fa-sign-out-alt"></i>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div class="main-container">
          <section class="hits-section">
            <div class="section-header">
              <h2 class="section-heading">Today's biggest hits</h2>
            </div>
            <div class="hits-grid">
              <div class="loading-message">Loading...</div>
            </div>
          </section>

          <section class="artists-section">
            <div class="section-header">
              <h2 class="section-heading">Popular artists</h2>
            </div>
            <div class="artists-grid">
              <div class="loading-message">Loading...</div>
            </div>
          </section>
        </div>
      `;

      // Render lại home content
      renderHome();

      // Khôi phục lại event listeners cho auth và user menu
      window.location.reload();
    }
  });
}
