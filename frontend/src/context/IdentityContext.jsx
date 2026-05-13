import React, { createContext, useContext, useState, useEffect } from 'react';

const IdentityContext = createContext();

export const IdentityProvider = ({ children }) => {
    const [identity, setIdentity] = useState(null);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    const generateKeyPairs = async () => {
        try {
            const [aliceRes, bobRes, charlieRes, danielRes] = await Promise.all([
                fetch('http://localhost:3001/api/assets/keys'),
                fetch('http://localhost:3001/api/assets/keys'),
                fetch('http://localhost:3001/api/assets/keys'),
                fetch('http://localhost:3001/api/assets/keys')
            ]);
            const aliceKeys = await aliceRes.json();
            const bobKeys = await bobRes.json();
            const charlieKeys = await charlieRes.json();
            const danielKeys = await danielRes.json();

            const newUsers = {
                Alice: { ...aliceKeys, name: 'Alice', role: 'System Admin' },
                Bob: { ...bobKeys, name: 'Bob', role: 'Regular User' },
                Charlie: { ...charlieKeys, name: 'Charlie', role: 'Compliance Auditor' },
                Daniel: { ...danielKeys, name: 'Daniel', role: 'Smart Contract Dev' }
            };
            
            localStorage.setItem('sawtooth_users', JSON.stringify(newUsers));
            localStorage.setItem('sawtooth_active_user', 'Alice');
            
            setUsers(newUsers);
            setIdentity(newUsers['Alice']);
            return newUsers;
        } catch (err) {
            console.error('Failed to generate identity:', err);
        }
    };

    useEffect(() => {
        const savedUsers = localStorage.getItem('sawtooth_users');
        const activeUser = localStorage.getItem('sawtooth_active_user');

        if (savedUsers && activeUser) {
            const parsedUsers = JSON.parse(savedUsers);
            // Force update if new users (Charlie/Daniel) are missing
            if (!parsedUsers.Charlie) {
                console.log("New users missing, regenerating keys...");
                generateKeyPairs().finally(() => setLoading(false));
            } else {
                setUsers(parsedUsers);
                setIdentity(parsedUsers[activeUser]);
                setLoading(false);
            }
        } else {
            generateKeyPairs().finally(() => setLoading(false));
        }
    }, []);

    const switchIdentity = (name) => {
        if (users[name]) {
            setIdentity(users[name]);
            localStorage.setItem('sawtooth_active_user', name);
        }
    };

    const logout = () => {
        localStorage.removeItem('sawtooth_users');
        localStorage.removeItem('sawtooth_active_user');
        setIdentity(null);
        generateKeyPairs();
    };

    return (
        <IdentityContext.Provider value={{ identity, users, loading, switchIdentity, logout }}>
            {children}
        </IdentityContext.Provider>
    );
};

export const useIdentity = () => useContext(IdentityContext);
