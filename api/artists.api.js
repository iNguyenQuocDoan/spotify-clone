import httpRequest from "../utils/httpRequest.js";

export const getAllArtists = async (limit = 10, offset = 0) => {
  return httpRequest.get(`artists?limit=${limit}&offset=${offset}`);
};

export const getArtistById = async (id) => {
  return httpRequest.get(`artists/${id}`);
};
