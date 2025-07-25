import { createContext, useState, useEffect, useContext } from "react";
const ThemeContext=createContext();
export const ThemeProvider=({children})=>{
    const [darkMode, setDarkMode]=useState(()=>{
        return localStorage.getItem('theme')==='dark';
    });
    useEffect(()=>{
        if(darkMode){
            document.documentElement.classList.add("dark");
            localStorage.setItem('theme', 'dark');
        }else{
            document.documentElement.classList.add("light");
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);
    return(
        <ThemeContext.Provider value={{darkMode, setDarkMode}}>
            {children}
        </ThemeContext.Provider>
    );
};
export const useTheme=()=>useContext(ThemeContext);