import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Use environment variables or fallbacks for development
    const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-placeholder.auth0.com";
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "placeholder-client-id";
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE || "https://coverbots.api";
    const redirectUri = window.location.origin;

    const onRedirectCallback = (appState) => {
        navigate(appState?.returnTo || window.location.pathname);
    };


    return (
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://coverbots.api',
                scope: 'openid profile email',
            }}
            cacheLocation="memory"
            useRefreshTokens={true}
            useRefreshTokensFallback={true}
        >
            {children}
        </Auth0Provider>
    );
};

export default AuthProvider;
