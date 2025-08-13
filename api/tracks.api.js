import httpRequest from "../utils/httpRequest.js";

export const getAllTracks = async (limit = 10, offset = 0) => {
  return httpRequest.get(`tracks?limit=${limit}&offset=${offset}`);
};

export const getPopularTracks = async (limit = 10) => {
  return httpRequest.get(`tracks/popular?limit=${limit}`);
};

export const getTrackById = async (id) => {
  return httpRequest.get(`tracks/${id}`);
};
