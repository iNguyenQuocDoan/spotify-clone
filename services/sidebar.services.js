import { getAllPlaylists } from "../api/playlists.api.js";
import { getAllArtists } from "../api/artists.api.js";

function mapSidebarPlaylist(playlist) {
  return {
    id: playlist.id,
    name: playlist.name,
    imageUrl: playlist.image_url || "placeholder.svg",
    type: "Playlist",
    subtitle: `${playlist.total_tracks || 0} songs`,
    owner: playlist.user_display_name || playlist.user_username || "Unknown"
  };
}

function mapSidebarArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.image_url || artist.background_image_url || "placeholder.svg",
    type: "Artist",
    subtitle: "Artist"
  };
}

function sidebarItemHtml(item) {
  return `
    <div class="library-item" data-type="${item.type.toLowerCase()}" data-id="${item.id}">
      <img
        src="${item.imageUrl}"
        alt="${item.name}"
        class="item-image"
        onerror="this.src='placeholder.svg'"
      />
      <div class="item-info">
        <div class="item-title">${item.name}</div>
        <div class="item-subtitle">${item.subtitle}</div>
      </div>
    </div>`;
}

export async function renderSidebar() {
  const libraryContent = document.querySelector(".library-content");
  if (!libraryContent) return;

  // Tìm vị trí để chèn dynamic content (sau Liked Songs)
  const likedSongs = libraryContent.querySelector(".library-item.active");
  
  try {
    // Load cả playlists và artists
    const [playlistsResult, artistsResult] = await Promise.all([
      getAllPlaylists(10, 0), // Lấy 10 playlists
      getAllArtists(8, 0),    // Lấy 8 artists
    ]);

    const playlists = (playlistsResult?.playlists || []).map(mapSidebarPlaylist);
    const artists = (artistsResult?.artists || []).map(mapSidebarArtist);

    // Combine và render
    const allItems = [...playlists, ...artists];
    const itemsHtml = allItems.map(sidebarItemHtml).join("");

    // Xóa các items cũ (nếu có) trước khi thêm mới
    const existingDynamicItems = libraryContent.querySelectorAll('.library-item:not(.active)');
    existingDynamicItems.forEach(item => {
      if (!item.classList.contains('active')) {
        item.remove();
      }
    });

    // Chèn sau Liked Songs
    if (likedSongs && likedSongs.nextSibling) {
      likedSongs.insertAdjacentHTML('afterend', itemsHtml);
    } else if (likedSongs) {
      likedSongs.insertAdjacentHTML('afterend', itemsHtml);
    } else {
      libraryContent.innerHTML = itemsHtml;
    }

  } catch (error) {
    console.error("Error loading sidebar data:", error);
  }
}
