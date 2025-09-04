import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const insertBotData = async ({ botId, Data }) => {
    try {
        const response = await axios.post(`${process.env.VECTOR_DB_URL}/insert`, {
            user_id: botId,
            texts: [
                Data
            ]
        })
        return response.data;
    } catch (error) {
        console.error('Error inserting bot data:', error);
        throw error;

    }
}

export const queryVectorData = async ({ botId, query , limit }) => {
    try {
        const response = await axios.post(`${process.env.VECTOR_DB_URL}/search`, {
            user_id: botId,
            query: query,
            top_k: limit || 5
        });
        return response.data;
    } catch (error) {
        console.error('Error querying vector data:', error);
        throw error;
    }
}