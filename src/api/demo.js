import axios from "axios";

export const getUser = async (id) => {
  const response = await axios.get(`https://api.example.com/api/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await axios.post("https://api.example.com/api/users", data);
  return response.data;
};
