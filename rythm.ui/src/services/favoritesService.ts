import axios from 'axios';

const API_URL = 'http://localhost:7000/favorites';

export const favoritesService = {
    async getFavorites(userId: string): Promise<string[]> {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    },

    async addToFavorites(userId: string, musicId: string): Promise<void> {
        try {
            await axios.post(`${API_URL}/${userId}`, JSON.stringify(musicId), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    },

    async removeFromFavorites(userId: string, musicId: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${userId}`, {
                data: JSON.stringify(musicId),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    }
};
