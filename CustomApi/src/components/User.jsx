import React, { useState } from 'react';
import {Backend_url} from "../../config"

const User = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!username || !password) {
            setError('Please fill in all fields.');
            return;
        }

        const url = isRegistering
            ? `${Backend_url}auth/register`
            : `${Backend_url}auth/login`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();
                if (isRegistering) {
                    setMessage('Registration successful! You can now log in.');
                    setIsRegistering(false);
                } else {
                    localStorage.setItem('token', result.token);
                    alert('Login successful!');
                    // Redirect or perform other actions after login
                }
            } else {
                setError(isRegistering ? 'Registration failed.' : 'Invalid username or password.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    {isRegistering ? 'Register' : 'Login'}
                </h2>
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                {message && <div className="mb-4 text-sm text-green-600">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-600">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600">
                    {isRegistering ? (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => setIsRegistering(false)}
                                className="text-blue-500 hover:underline"
                            >
                                Login here
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account?{' '}
                            <button
                                onClick={() => setIsRegistering(true)}
                                className="text-blue-500 hover:underline"
                            >
                                Register here
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default User;
