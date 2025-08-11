import React, { useState } from 'react';

interface SignInProps {
  onLoginSuccess: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('Example@123');
    const [error, setError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token } = await (window as any).auth.login(email, password);
            (window as any).auth.storeToken(token);
            onLoginSuccess();
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="signin-container">
            <h1>Sign In</h1>
            <form id="signin-form" onSubmit={handleSignIn}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Sign In</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default SignIn;
