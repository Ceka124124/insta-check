import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HistoryItem, InstagramUser, LoginAttempt } from '../types';
import { fetchUserData } from '../services/instagramService';
import { generateLoginAttempts } from '../services/geminiService';

const UserProfile: React.FC<{ user: InstagramUser }> = ({ user }) => (
    <div className="flex items-start space-x-4 p-2 text-white">
        <img src={user.profile_pic_url} alt={user.username} className="w-24 h-24 rounded-full border-2 border-pink-500" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span className="text-cyan-400">Username:</span>
            <span className="font-bold">{user.username} {user.is_verified && <span className="text-blue-500">(Verified)</span>}</span>
            <span className="text-cyan-400">Full Name:</span>
            <span>{user.full_name}</span>
            <span className="text-cyan-400">Followers:</span>
            <span>{user.followers.toLocaleString()}</span>
            <span className="text-cyan-400">Following:</span>
            <span>{user.following.toLocaleString()}</span>
            <span className="text-cyan-400">Private:</span>
            <span>{user.is_private ? 'Yes' : 'No'}</span>
            <span className="text-cyan-400 col-span-2">Biography:</span>
            <p className="col-span-2 text-gray-300 whitespace-pre-wrap">{user.biography}</p>
        </div>
    </div>
);

const LoginHistory: React.FC<{ logins: LoginAttempt[] }> = ({ logins }) => (
    <div className="w-full mt-2 text-white">
        <table className="w-full text-left text-xs md:text-sm">
            <thead className="text-cyan-400">
                <tr>
                    <th className="p-2">Cihaz Türü</th>
                    <th className="p-2">Cihaz Modeli</th>
                    <th className="p-2">Giriş Türü</th>
                    <th className="p-2">Giriş Zamanı</th>
                    <th className="p-2">IP Adresi</th>
                    <th className="p-2">Giriş Konumu</th>
                    <th className="p-2">Giriş Yöntemi</th>
                </tr>
            </thead>
            <tbody>
                {logins.map((login, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-800">
                        <td className="p-2">{login.deviceType}</td>
                        <td className="p-2">{login.deviceModel}</td>
                        <td className="p-2">{login.loginType}</td>
                        <td className="p-2">{login.loginTime}</td>
                        <td className="p-2">{login.loginIp}</td>
                        <td className="p-2">{login.loginLocation}</td>
                        <td className="p-2">{login.loginMethod}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const Terminal = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const addHistory = useCallback((item: Omit<HistoryItem, 'id'>) => {
        setHistory(prev => [...prev, { ...item, id: prev.length }]);
    }, []);

    useEffect(() => {
        addHistory({ type: 'info', content: 'Welcome to Insta-Checker Console.' });
        addHistory({ type: 'info', content: "Type '/check @{username}' to begin. (e.g., /check @instagram)" });
        inputRef.current?.focus();
    }, [addHistory]);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    const handleCommand = async (command: string) => {
        addHistory({ type: 'command', content: command });
        setIsLoading(true);

        const parts = command.trim().split(' ');
        if (parts[0] === '/check' && parts[1]?.startsWith('@')) {
            const username = parts[1].substring(1);
            try {
                addHistory({ type: 'info', content: `Fetching data for @${username}...` });
                const userData = await fetchUserData(username);
                addHistory({ type: 'component', content: <UserProfile user={userData} /> });
                
                addHistory({ type: 'info', content: 'Generating simulated login history (this may take a moment)...' });
                const loginAttempts = await generateLoginAttempts(username);
                addHistory({ type: 'info', content: `Generated ${loginAttempts.length} login attempts:` });
                addHistory({ type: 'component', content: <LoginHistory logins={loginAttempts} /> });

            } catch (error) {
                if (error instanceof Error) {
                    addHistory({ type: 'error', content: `Error: ${error.message}` });
                } else {
                    addHistory({ type: 'error', content: 'An unknown error occurred.' });
                }
            }
        } else {
            addHistory({ type: 'error', content: `Command not found: ${command}. Use '/check @{username}'.` });
        }
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            if (input.trim()) {
                handleCommand(input);
                setInput('');
            }
        }
    };

    const renderHistoryItem = (item: HistoryItem) => {
        switch (item.type) {
            case 'command':
                return <><span className="text-blue-400">user@insta-checker:~$</span> <span className="text-white">{item.content}</span></>;
            case 'output':
                return <pre className="whitespace-pre-wrap">{item.content}</pre>;
            case 'error':
                return <span className="text-red-500">{item.content}</span>;
            case 'info':
                return <span className="text-yellow-500">{item.content}</span>;
            case 'component':
                return item.content;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 h-screen flex flex-col" onClick={() => inputRef.current?.focus()}>
            <div className="flex-grow overflow-y-auto pr-2">
                {history.map(item => (
                    <div key={item.id} className="mb-1">
                        {renderHistoryItem(item)}
                    </div>
                ))}
                {isLoading && <div className="text-yellow-500 animate-pulse">Processing...</div>}
                <div ref={endOfHistoryRef} />
            </div>
            <div className="flex items-center mt-2">
                <span className="text-blue-400 shrink-0">user@insta-checker:~$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent border-none outline-none text-green-400 pl-2"
                    disabled={isLoading}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default Terminal;