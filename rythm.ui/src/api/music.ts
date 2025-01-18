const API_BASE_URL = 'http://localhost:7000';

export interface Music {
    id: string;
    uploadedBy: string;
    uploadedAt: string;
    title: string;
    album: string;
    musicPath: string;
    filePath: string;
}

export interface UploadMusicResponse {
    message: string;
    uploadedBy: string;
    title: string;
    album: string;
    musicPath: string;
    filePath: string;
    music: Music;
}

export const musicApi = {
    uploadMusic: async (formData: FormData): Promise<UploadMusicResponse> => {
        const response = await fetch(`${API_BASE_URL}/music/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Upload failed');
        }

        return response.json();
    },

    getAllMusic: async (): Promise<Music[]> => {
        const response = await fetch(`${API_BASE_URL}/music/all`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch music');
        }

        return response.json();
    }
};