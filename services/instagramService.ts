import { InstagramUser } from '../types';

const API_URL = 'https://teazer-api.onrender.com/api/insta?username=';

export const fetchUserData = async (username: string): Promise<InstagramUser> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${username}`);
  } catch (error) {
     // This catches network-level errors, like DNS issues or no internet connection.
     console.error('Fetch failed:', error);
     throw new Error('A network error occurred. Please check your internet connection and try again.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User '${username}' not found.`);
    }
    if (response.status >= 500) {
      throw new Error(`The external API server failed (Status: ${response.status}). This is an issue with the remote service, not this application. Please try again later.`);
    }
    throw new Error(`API request failed with an unexpected status: ${response.status}.`);
  }
  
  try {
    const data = await response.json();
    if (!data || !data.username) {
      throw new Error(`User '${username}' not found or the API returned an invalid response.`);
    }
    return data as InstagramUser;
  } catch (error) {
      console.error('JSON parsing failed:', error);
      throw new Error('Failed to parse the response from the server. The API might be returning malformed data.');
  }
};