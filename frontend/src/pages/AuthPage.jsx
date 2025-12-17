import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './AuthPage.css'; // We'll create this specifically for auth styles

const AuthPage = () => {
    const { login, register, googleLogin, currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine initial state based on URL path
    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');

    // Update state if URL changes (e.g. back button)
    useEffect(() => {
        setIsSignUp(location.pathname === '/register');
    }, [location.pathname]);

    // Form States
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser && !loading) {
            navigate('/profile');
        }
    }, [currentUser, loading, navigate]);

    // Handle Switch
    const toggleMode = () => {
        const newMode = !isSignUp;
        setIsSignUp(newMode);
        // Clean errors when switching
        setError('');
        // Update URL without refreshing
        window.history.pushState(null, '', newMode ? '/register' : '/login');
    };

    // Handlers
    const handleLoginChange = (e) => {
        if (e.target.name === 'email') setLoginEmail(e.target.value);
        if (e.target.name === 'password') setLoginPassword(e.target.value);
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(loginEmail, loginPassword);
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (registerData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setIsSubmitting(true);
        try {
            const userCredential = await register(registerData.email, registerData.password);
            const user = userCredential.user;
            const age = registerData.dateOfBirth ? calculateAge(registerData.dateOfBirth) : null;

            await setDoc(doc(db, 'users', user.uid), {
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                dateOfBirth: registerData.dateOfBirth,
                age: age,
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            navigate('/profile');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already in use.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await googleLogin();
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError('Failed to sign in with Google.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="auth-body">
            <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`} id="container">

                {/* Sign Up Form Container */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegisterSubmit} className="auth-form">
                        <h1 className="auth-title">Create Account</h1>
                        <div className="social-container">
                            <button type="button" onClick={handleGoogleLogin} className="social">
                                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill-rule="evenodd" fill-opacity="1" fill="#4285f4" stroke="none"></path>
                                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill-rule="evenodd" fill-opacity="1" fill="#34a853" stroke="none"></path>
                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill-rule="evenodd" fill-opacity="1" fill="#fbbc05" stroke="none"></path>
                                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.96l3.007 2.332c.708-2.127 2.692-3.71 5.036-3.71z" fill-rule="evenodd" fill-opacity="1" fill="#ea4335" stroke="none"></path>
                                </svg>
                            </button>
                        </div>
                        <span className="auth-span">or use your email for registration</span>

                        {error && isSignUp && <div className="auth-error">{error}</div>}

                        <div className="input-group-row">
                            <input type="text" name="firstName" placeholder="First Name" value={registerData.firstName} onChange={handleRegisterChange} required className="auth-input" />
                            <input type="text" name="lastName" placeholder="Last Name" value={registerData.lastName} onChange={handleRegisterChange} required className="auth-input" />
                        </div>
                        <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required className="auth-input" />
                        <input type="date" name="dateOfBirth" placeholder="Date of Birth" value={registerData.dateOfBirth} onChange={handleRegisterChange} required className="auth-input" />
                        <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} required className="auth-input" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={registerData.confirmPassword} onChange={handleRegisterChange} required className="auth-input" />

                        <button disabled={isSubmitting} className="auth-button">
                            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                {/* Sign In Form Container */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                        <h1 className="auth-title">Sign in</h1>
                        <div className="social-container">
                            <button type="button" onClick={handleGoogleLogin} className="social">
                                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill-rule="evenodd" fill-opacity="1" fill="#4285f4" stroke="none"></path>
                                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill-rule="evenodd" fill-opacity="1" fill="#34a853" stroke="none"></path>
                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill-rule="evenodd" fill-opacity="1" fill="#fbbc05" stroke="none"></path>
                                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.96l3.007 2.332c.708-2.127 2.692-3.71 5.036-3.71z" fill-rule="evenodd" fill-opacity="1" fill="#ea4335" stroke="none"></path>
                                </svg>
                            </button>
                        </div>
                        <span className="auth-span">or use your account</span>

                        {error && !isSignUp && <div className="auth-error">{error}</div>}

                        <input type="email" name="email" placeholder="Email" value={loginEmail} onChange={handleLoginChange} required className="auth-input" />
                        <input type="password" name="password" placeholder="Password" value={loginPassword} onChange={handleLoginChange} required className="auth-input" />

                        <Link to="#" className="auth-link">Forgot your password?</Link>
                        <button disabled={isSubmitting} className="auth-button">
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>

                    </form>
                </div>

                {/* Overlay Container */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="auth-title text-white">Welcome Back!</h1>
                            <p className="auth-p">To keep connected with us please login with your personal info</p>
                            <button className="ghost auth-button" onClick={toggleMode}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="auth-title text-white">Hello, Friend!</h1>
                            <p className="auth-p">Enter your personal details and start journey with us</p>
                            <button className="ghost auth-button" onClick={toggleMode}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
