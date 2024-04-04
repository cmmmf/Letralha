import { useEffect, useState, useContext } from "react"
import { GoogleLogin, googleLogout} from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'
import { AppContext } from "../App";
import { Link } from 'react-router-dom';

export default function Login(){
    const { user, setUser } = useContext(AppContext);
    const [ email, setEmail ] = useState(null);

    
    const logOut = () => {
        localStorage.removeItem('userData')
        setUser(null);
    };
    
    const logIn = () => {
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
            body: JSON.stringify(email) // Convert data to JSON string
        };
        
        console.log("JSON ", JSON.stringify(email))
        
        fetch("/login", data)
        .then(response => {
            if(!response.ok){
                throw new Error("Network reponse was not ok!")
            }
            else{
                console.log("Network reponse was ok!")
                console.log("Logged Successfully!")
            }
            return response.text()
        }).then((text) => {
            text = JSON.parse(text)
            
            console.log("response",text.id)
            localStorage.setItem('userData', JSON.stringify({user: text.id}));
            setUser(text.id)
            
        }).catch((err) => {
            throw new Error("Error retrieving text")
        })
        
    }
    
    return (
        <div>
            <h2>Letralha</h2>
            <br />
            <br />
            {user ? (
                <div>
                    <h3>User Logged in</h3>
                    <p>Id do usuario: {user}</p>
                    <br />
                    <br />
                    <Link to = "/home"> Home </Link>
                    <br />
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <div>
                    <input onChange={(e) => {setEmail(e.target.value)}} placeholder="Email"/>
                    <button onClick={logIn}> Login </button>
                </div>
            )}
        </div>
    );
    
    // log out function to log the user out of google and set the profile array to null
    // const logOut = () => {
    //     googleLogout();
    //     localStorage.removeItem('userData')
    //     setUser(null);
    // };

    // const logIn = (response) => {
        //     const decode = jwtDecode(response?.credential)
        //     console.log(decode)
        
        //     const data = {
            //         method: 'POST',
            //         headers: {
                //             'Content-Type': 'application/json' // Specify content type as JSON
                //         },
                //         body: JSON.stringify(decode.email) // Convert data to JSON string
                //     };
                
                //     console.log("JSON ", JSON.stringify(decode.email))
                
    //     fetch("/login", data)
    //     .then(response => {
    //         if(!response.ok){
    //             throw new Error("Network reponse was not ok!")
    //         }
    //         else{
    //             console.log("Network reponse was ok!")
    //             console.log("Logged Successfully!")
    //         }
    //         return response.text()
    //     }).then((text) => {
    //         text = JSON.parse(text)

    //         console.log("response",text.id)
    //         localStorage.setItem('userData', JSON.stringify({user: text.id}));
    //         setUser(text.id)

    //     }).catch((err) => {
    //         throw new Error("Error retrieving text")
    //     })
        
    // }


    // return (
    //     <div>
    //         <h2>Letralha</h2>
    //         <br />
    //         <br />
    //         {user ? (
    //             <div>
    //                 <h3>User Logged in</h3>
    //                 <p>Id do usuario: {user}</p>
    //                 <br />
    //                 <br />
    //                 <Link to = "/home"> Home </Link>
    //                 <br />
    //                 <button onClick={logOut}>Log out</button>
    //             </div>
    //         ) : (
    //             <GoogleLogin
    //                 onSuccess={logIn} 
    //                 onError={() => {
    //                     console.log("Login Failed!")
    //                 }}
    //             />
    //         )}
    //     </div>
    // );
}