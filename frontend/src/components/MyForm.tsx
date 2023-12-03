import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios, { CancelTokenSource } from 'axios';
import InputMask from 'react-input-mask';

const Form: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [number, setNumber] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [numberError, setNumberError] = useState<string>('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [cancelToken, setCancelToken] = useState<CancelTokenSource | null>(null);
    const [receivingData, setReceivingData] = useState<boolean>(false);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailError('');
    };

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNumber(e.target.value);
        setNumberError('');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }

        if (number && !validateNumber(number)) {
            setNumberError('Please enter a valid number (XX-XX-XX)');
            return;
        }

        // Cancel the previous request if there is one
        if (cancelToken) {
            cancelToken.cancel('Request canceled due to new submission.');
        }

        setLoading(true);
        const source = axios.CancelToken.source();
        setCancelToken(source);
        setReceivingData(true); // Set to receiving data

        try {
            const response = await axios.post('http://localhost:3001/search', { email, number }, { cancelToken: source.token });
            setData(response.data);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error('Error:', error);
            }
        } finally {
            setLoading(false);
            setCancelToken(null);
            setReceivingData(false); // Set back to not receiving data
        }
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateNumber = (number: string) => {
        return /^\d{2}-\d{2}-\d{2}$/.test(number);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-center text-2xl font-bold mb-6">Test task for 3205team</h2>
                <input
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`border border-gray-300 rounded-md py-2 px-3 mb-3 focus:outline-none focus:border-blue-500 block w-full ${emailError ? 'border-red-500' : ''}`}
                    required
                />
                {emailError && <p className="text-red-500 text-sm mb-2 ml-1">{emailError}</p>}
                <InputMask
                    mask="99-99-99"
                    maskChar=""
                    placeholder="Number"
                    value={number}
                    onChange={handleNumberChange}
                    className={`border border-gray-300 rounded-md py-2 px-3 mb-3 focus:outline-none focus:border-blue-500 block w-full ${numberError ? 'border-red-500' : ''}`}
                />
                {numberError && <p className="text-red-500 text-sm mb-2 ml-1">{numberError}</p>}
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline block w-full"
                >
                    Submit
                </button>
                <div className="text-center mt-5">
                    {data.length === 0 && !loading && <p>{receivingData ? 'Receiving Data....' : 'No data found'}</p>}
                    {data.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-3">{receivingData ? 'Receiving Data....' : 'Received Data'}</h3>
                            {data.map((item, index) => (
                                <div key={index} className="bg-gray-200 rounded-lg p-3 mb-3">
                                    <p><span className="font-semibold">Email:</span> {item.email}</p>
                                    {item.number && <p><span className="font-semibold">Number:</span> {item.number}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Form;
