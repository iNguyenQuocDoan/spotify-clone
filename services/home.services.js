import { getAllArtists } from "../api/artists.api.js";
import { getAllPlaylists } from "../api/playlists.api.js";
import { getPopularTracks } from "../api/tracks.api.js";

function mapTrack(t) {
  // ưu tiên thứ tự: hình từ track -> album -> artist -> placeholder
  let imageUrl = null;

  // sử dụng hình ảnh có sẵn theo thứ tự ưu tiên
  if (t.image_url) {
    imageUrl = t.image_url;
  } else if (t.album_cover_image_url) {
    imageUrl = t.album_cover_image_url;
  } else if (t.artist_image_url) {
    imageUrl = t.artist_image_url;
  }

  return {
    id: t.id,
    title: t.title || "không rõ tên bài",
    artist: t.artist_name || "không rõ nghệ sĩ",
    imageUrl: imageUrl, // sử dụng hình có sẵn hoặc null
    audioUrl: t.audio_url || null, // url âm thanh
    duration: t.duration || null,
    playCount: t.play_count || 0,
    albumTitle: t.album_title || null,
  };
}

function mapPlaylist(p) {
  return {
    id: p.id,
    title: p.name,
    imageUrl: p.image_url || null,
    owner: p.user_display_name || p.user_username || "",
  };
}

function mapArtist(a) {
  return {
    id: a.id,
    name: a.name,
    imageUrl: a.image_url || a.background_image_url || null,
  };
}

function trackCardHtml(track) {
  // Sử dụng server image nếu có, không thì dùng placeholder.svg
  const imageSrc = track.imageUrl || "placeholder.svg";

  return `
    <div class="hit-card" data-type="track" data-id="${track.id}">
      <div class="hit-card-cover">
        <img 
          src="${imageSrc}" 
          alt="${track.title}" 
          onerror="this.src='placeholder.svg'; this.onerror=null;" 
          loading="lazy"
        />
        <button class="hit-play-btn" data-tooltip="Play"><i class="fas fa-play"></i></button>
      </div>
      <div class="hit-card-info">
        <h3 class="hit-card-title">${track.title}</h3>
        <p class="hit-card-artist">${track.artist}</p>
      </div>
    </div>`;
}

function playlistCardHtml(pl) {
  return `
    <div class="hit-card" data-type="playlist" data-id="${pl.id}">
      <div class="hit-card-cover">
        <img src="${pl.imageUrl || "placeholder.svg"}" alt="${pl.title}" />
        <button class="hit-play-btn" data-tooltip="Play"><i class="fas fa-play"></i></button>
      </div>
      <div class="hit-card-info">
        <h3 class="hit-card-title">${pl.title}</h3>
        <p class="hit-card-artist">${pl.owner}</p>
      </div>
    </div>`;
}

function artistCardHtml(ar) {
  return `
    <div class="artist-card" data-type="artist" data-id="${ar.id}">
      <div class="artist-card-cover">
        <img src="${ar.imageUrl || "placeholder.svg"}" alt="${ar.name}" />
        <button class="artist-play-btn" data-tooltip="Play artist"><i class="fas fa-play"></i></button>
      </div>
      <div class="artist-card-info">
        <h3 class="artist-card-name">${ar.name}</h3>
        <p class="artist-card-type">Artist</p>
      </div>
    </div>`;
}

export async function renderHome() {
  const hitsGridEl = document.querySelector(".hits-grid"); // Today's biggest hits
  const artistsGridEl = document.querySelector(".artists-grid"); // Popular artists
  if (!hitsGridEl || !artistsGridEl) return;

  hitsGridEl.textContent = "Loading tracks…";
  artistsGridEl.textContent = "Loading artists…";

  try {
    const [tracksResult, artistsResult] = await Promise.all([
      getPopularTracks(10), // lấy 10 bài
      getAllArtists(5, 0), // Giới hạn chỉ 5 nghệ sĩ
    ]);

    const trackViews = (tracksResult?.tracks || []).map(mapTrack);
    const artistViews = (artistsResult?.artists || []).map(mapArtist);

    hitsGridEl.innerHTML =
      trackViews.map(trackCardHtml).join("") || "<p>No tracks</p>";
    artistsGridEl.innerHTML =
      artistViews.map(artistCardHtml).join("") || "<p>No artists</p>";

    // Thêm sự kiện click cho các artist cards
    setupArtistClickEvents();
    // thêm sự kiện click cho các track cards
    setupTrackClickEvents(trackViews);
  } catch (error) {
    console.error("renderhome error:", error);
    hitsGridEl.textContent = "Failed to load tracks";
    artistsGridEl.textContent = "Failed to load artists";
  }
}

function setupArtistClickEvents() {
  console.log("đang setup artist click events");
  const artistCards = document.querySelectorAll(".artist-card");
  const artistNames = document.querySelectorAll(".artist-card-name");

  console.log("tìm thấy artist cards:", artistCards.length);
  console.log("tìm thấy artist names:", artistNames.length);

  // thêm sự kiện click cho toàn bộ artist card
  artistCards.forEach((cardEl, index) => {
    cardEl.style.cursor = "pointer";
    const nameEl = cardEl.querySelector(".artist-card-name");
    console.log(
      `đang setup click event cho artist card ${index}:`,
      nameEl ? nameEl.textContent : "Unknown"
    );

    cardEl.addEventListener("click", (e) => {
      console.log(
        "artist card được click!",
        nameEl ? nameEl.textContent : "Unknown"
      );
      e.preventDefault();
      e.stopPropagation();

      const artistId = cardEl.getAttribute("data-id");
      console.log("artist id:", artistId);

      if (artistId) {
        // import và gọi renderartistdetail
        console.log("đang load artist detail cho id:", artistId);
        import("./artist.services.js")
          .then(({ renderArtistDetail }) => {
            renderArtistDetail(artistId);
          })
          .catch((error) => {
            console.error("lỗi khi load artist detail:", error);
          });
      }
    });
  });

  // thêm hiệu ứng hover cho artist cards
  artistCards.forEach((cardEl) => {
    cardEl.addEventListener("mouseenter", () => {
      cardEl.style.transform = "scale(1.05)";
      cardEl.style.transition = "transform 0.2s ease";
    });
    cardEl.addEventListener("mouseleave", () => {
      cardEl.style.transform = "scale(1)";
    });
  });
}

function setupTrackClickEvents(tracks) {
  console.log("đang setup track click events");
  const trackCards = document.querySelectorAll(".hit-card[data-type='track']");

  console.log("tìm thấy track cards:", trackCards.length);

  trackCards.forEach((cardEl, index) => {
    const track = tracks[index];
    if (!track) return;

    console.log(`đang setup click event cho track ${index}:`, track.title);

    // thêm sự kiện click cho nút play
    const playBtn = cardEl.querySelector(".hit-play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("track play button được click:", track.title);

        try {
          // import music player service
          const { musicPlayer } = await import("./music.services.js");

          // convert track format để match music player
          const formattedTrack = {
            id: track.id,
            title: track.title,
            artist_name: track.artist,
            audio_url:
              track.audioUrl ||
              "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // demo url để test
            image_url: track.imageUrl || "placeholder.svg",
            duration: track.duration || 0,
          };

          // play track với full playlist
          const formattedPlaylist = tracks.map((t) => ({
            id: t.id,
            title: t.title,
            artist_name: t.artist,
            audio_url:
              t.audioUrl ||
              "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // demo url để test
            image_url: t.imageUrl || "placeholder.svg",
            duration: t.duration || 0,
          }));

          await musicPlayer.playTrack(formattedTrack, formattedPlaylist);
        } catch (error) {
          console.error("lỗi khi play track:", error);
        }
      });
    }

    // thêm hover effect cho track cards
    cardEl.addEventListener("mouseenter", () => {
      const playBtn = cardEl.querySelector(".hit-play-btn");
      if (playBtn) {
        playBtn.style.opacity = "1";
        playBtn.style.transform = "scale(1)";
      }
    });

    cardEl.addEventListener("mouseleave", () => {
      const playBtn = cardEl.querySelector(".hit-play-btn");
      if (playBtn) {
        playBtn.style.opacity = "0";
        playBtn.style.transform = "scale(0.8)";
      }
    });
  });
}
