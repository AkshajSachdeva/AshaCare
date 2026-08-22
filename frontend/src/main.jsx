import React from 'react';import{createRoot}from'react-dom/client';import{BrowserRouter}from'react-router-dom';import'./index.css';import App from'./App';import{AuthProvider}from'./context/AuthContext';import{I18nProvider}from'./i18n/I18nContext';import{registerSW}from'virtual:pwa-register';registerSW({immediate:true});
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><I18nProvider><AuthProvider><App/></AuthProvider></I18nProvider></BrowserRouter></React.StrictMode>);

