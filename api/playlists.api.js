import httpRequest from "../utils/httpRequest.js";

export const getAllPlaylists = async () => {
  return httpRequest.get("playlists");
};

export const getPlaylistById = async (id) => {
  return httpRequest.get(`playlists/${id}`);
};
