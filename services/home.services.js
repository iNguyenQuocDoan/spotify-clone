import { getAllArtists } from "../api/artists.api.js";
import { getAllPlaylists } from "../api/playlists.api.js";
import { getPopularTracks } from "../api/tracks.api.js";

function mapTrack(t) {
  // Ưu tiên thứ tự: real images từ server -> album/artist images -> local placeholder
  let imageUrl = null;

  // Chỉ dùng real images từ spotify.f8team.dev server, bỏ qua via.placeholder.com
  if (t.image_url && t.image_url.includes("spotify.f8team.dev")) {
    imageUrl = t.image_url;
  } else if (
    t.album_cover_image_url &&
    t.album_cover_image_url.includes("spotify.f8team.dev")
  ) {
    imageUrl = t.album_cover_image_url;
  } else if (
    t.artist_image_url &&
    t.artist_image_url.includes("spotify.f8team.dev")
  ) {
    imageUrl = t.artist_image_url;
  }

  // Fix URL formatting nếu bị lỗi
  if (imageUrl && typeof imageUrl === "string") {
    // Fix missing slash issues
    imageUrl = imageUrl.replace(
      "spotify.f8team.devimages",
      "spotify.f8team.dev/uploads/images"
    );
    imageUrl = imageUrl.replace(
      "spotify.f8team.devaudio",
      "spotify.f8team.dev/uploads/audio"
    );
  }

  return {
    id: t.id,
    title: t.title || "Unknown Title",
    artist: t.artist_name || "Unknown Artist",
    imageUrl: imageUrl, // null if no valid server image found
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
  } catch (error) {
    console.error("renderHome error:", error);
    hitsGridEl.textContent = "Failed to load tracks";
    artistsGridEl.textContent = "Failed to load artists";
  }
}
