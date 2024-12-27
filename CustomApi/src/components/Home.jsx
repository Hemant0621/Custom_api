import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MainWebsite() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMessage();
    }, []);

    const fetchMessage = async () => {
        try {
            const res = await axios.get('http://localhost:5000/your-endpoint');
            setMessage(res.data.message);
        } catch (error) {
            setMessage('API not found.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Main Website</h1>
                <p>Message: {message}</p>
            </div>
        </div>
    );
}

export default MainWebsite;
