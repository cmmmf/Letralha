import { BrowserRouter as Router,
         Route, Routes, 
         createBrowserRouter as createRouter,
         RouterProvider
        } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';

import Login from './screens/login'
import Home from './screens/home'
import Game from "./screens/game"

import { createContext, useState, useEffect, useLayoutEffect } from 'react'

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        var userData = localStorage.getItem('userData');
        
        if(userData){
            userData = JSON.parse(userData).user
            console.log("olaa", userData)
            setUser(userData)
        }
    }, []);

    return (
        <AppContext.Provider value = {{user, setUser}}>
            {children}
        </AppContext.Provider>
    );
};

const router = createRouter([
    {
        path: '/',
        element: <Login/>,
        errorElement: <div> Error 404! </div>
    },
    {
        path:'/home',
        element: <Home/>,
    },
    {
        path:'/game',
        element: <Game/>,
    }
]);

function App() {
    return (
        <AppProvider>
            <RouterProvider router = {router}/>
        </AppProvider>
    )
}

export default App;
