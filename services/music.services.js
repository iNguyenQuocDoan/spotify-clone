// dịch vụ phát nhạc
class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.7;
    this.isShuffled = false;
    this.isRepeated = false;
    this.playlist = [];
    this.currentIndex = 0;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // sự kiện của audio
    this.audio.addEventListener("loadedmetadata", () => {
      this.duration = this.audio.duration;
      this.updatePlayerUI();
    });

    this.audio.addEventListener("timeupdate", () => {
      this.currentTime = this.audio.currentTime;
      this.updateProgressBar();
    });

    this.audio.addEventListener("ended", () => {
      if (this.isRepeated) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.next();
      }
    });

    this.audio.addEventListener("error", (e) => {
      console.error("lỗi audio:", e);
      this.showError("không thể tải bài hát");
    });
  }

  async playTrack(track, playlist = []) {
    try {
      console.log("đang phát bài:", track);

      // thiết lập bài hát và playlist hiện tại
      this.currentTrack = track;
      this.playlist = playlist;
      this.currentIndex = playlist.findIndex((t) => t.id === track.id);

      // tải audio
      this.audio.src = track.audio_url;
      this.audio.volume = this.volume;

      // cập nhật giao diện ngay lập tức
      this.updatePlayerUI();

      // phát audio
      await this.audio.play();
      this.isPlaying = true;
      this.updatePlayButtonState();
    } catch (error) {
      console.error("lỗi khi phát bài:", error);
      this.showError("không thể phát bài hát");
    }
  }

  play() {
    if (this.audio.src) {
      this.audio.play();
      this.isPlaying = true;
      this.updatePlayButtonState();
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayButtonState();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    if (this.playlist.length === 0) return;

    let nextIndex;
    if (this.isShuffled) {
      nextIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      nextIndex = (this.currentIndex + 1) % this.playlist.length;
    }

    this.playTrack(this.playlist[nextIndex], this.playlist);
  }

  previous() {
    if (this.playlist.length === 0) return;

    let prevIndex;
    if (this.isShuffled) {
      prevIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      prevIndex =
        this.currentIndex === 0
          ? this.playlist.length - 1
          : this.currentIndex - 1;
    }

    this.playTrack(this.playlist[prevIndex], this.playlist);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.volume;
    this.updateVolumeUI();
  }

  seekTo(percentage) {
    if (this.duration) {
      this.audio.currentTime = (percentage / 100) * this.duration;
    }
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    this.updateShuffleButton();
  }

  toggleRepeat() {
    this.isRepeated = !this.isRepeated;
    this.updateRepeatButton();
  }

  updatePlayerUI() {
    if (!this.currentTrack) return;

    // hiển thị player khi có bài hát
    const player = document.querySelector(".player");
    if (player) {
      player.classList.add("active");
    }

    // cập nhật thông tin bài hát
    const playerImage = document.querySelector(".player-image");
    const playerTitle = document.querySelector(".player-title");
    const playerArtist = document.querySelector(".player-artist");

    if (playerImage) {
      playerImage.src =
        this.currentTrack.image_url || "placeholder.svg?height=56&width=56";
      playerImage.alt = this.currentTrack.title;
    }

    if (playerTitle) {
      playerTitle.textContent = this.currentTrack.title;
    }

    if (playerArtist) {
      playerArtist.textContent = this.currentTrack.artist_name;
    }

    // cập nhật thời lượng
    const durationElement = document.querySelector(".time:last-child");
    if (durationElement) {
      durationElement.textContent = this.formatTime(this.duration);
    }
  }

  updateProgressBar() {
    const progressFill = document.querySelector(".progress-fill");
    const currentTimeElement = document.querySelector(".time:first-child");

    if (progressFill && this.duration > 0) {
      const percentage = (this.currentTime / this.duration) * 100;
      progressFill.style.width = `${percentage}%`;
    }

    if (currentTimeElement) {
      currentTimeElement.textContent = this.formatTime(this.currentTime);
    }
  }

  updatePlayButtonState() {
    const playBtn = document.querySelector(".player-center .play-btn");
    const playBtnIcon = playBtn?.querySelector("i");

    if (playBtnIcon) {
      if (this.isPlaying) {
        playBtnIcon.className = "fas fa-pause";
      } else {
        playBtnIcon.className = "fas fa-play";
      }
    }
  }

  updateVolumeUI() {
    const volumeFill = document.querySelector(".volume-fill");
    if (volumeFill) {
      volumeFill.style.width = `${this.volume * 100}%`;
    }
  }

  updateShuffleButton() {
    const shuffleBtn = document.querySelector(".control-btn:first-child");
    if (shuffleBtn) {
      shuffleBtn.classList.toggle("active", this.isShuffled);
    }
  }

  updateRepeatButton() {
    const repeatBtn = document.querySelector(".control-btn:last-child");
    if (repeatBtn) {
      repeatBtn.classList.toggle("active", this.isRepeated);
    }
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  showError(message) {
    console.error("lỗi trình phát nhạc:", message);

    // ẩn player khi có lỗi
    const player = document.querySelector(".player");
    if (player) {
      player.classList.remove("active");
    }
  }
}

// tạo instance trình phát nhạc toàn cục
const musicPlayer = new MusicPlayer();

// thiết lập điều khiển trình phát
export function setupMusicPlayer() {
  // nút play/pause
  const playBtn = document.querySelector(".player-center .play-btn");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      musicPlayer.togglePlayPause();
    });
  }

  // nút previous
  const prevBtn = document.querySelector(".control-btn:nth-child(2)");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      musicPlayer.previous();
    });
  }

  // nút next
  const nextBtn = document.querySelector(".control-btn:nth-child(4)");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      musicPlayer.next();
    });
  }

  // nút shuffle
  const shuffleBtn = document.querySelector(".control-btn:first-child");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      musicPlayer.toggleShuffle();
    });
  }

  // nút repeat
  const repeatBtn = document.querySelector(".control-btn:last-child");
  if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
      musicPlayer.toggleRepeat();
    });
  }

  // thanh tiến trình
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      musicPlayer.seekTo(percentage);
    });
  }

  // điều khiển âm lượng
  const volumeBar = document.querySelector(".volume-bar");
  if (volumeBar) {
    volumeBar.addEventListener("click", (e) => {
      const rect = volumeBar.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      musicPlayer.setVolume(percentage);
    });
  }
}

// xuất instance trình phát nhạc
export { musicPlayer };
