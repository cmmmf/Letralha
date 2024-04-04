import { useContext, useState, useEffect } from "react"
import { AppContext } from "../App"
import io, { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io("http://192.168.15.8:5000", {rejectUnauthorized: false })

export default function Home(){
    const { user, setUser } = useContext(AppContext);
    const [ friendSearch, setFriendSearch ] = useState("")
    const [ pendingFriends, setPendingFriends ] = useState([])
    const [ friends, setFriends ] = useState([])
    const [ waitGame, setWaitGame] = useState(null)
    const [ acceptGame, setAcceptGame] = useState(null)  

    const navigate = useNavigate();

    // send session ID to server
    useEffect(() => {
        socket.emit("handleConnection", user)      
    }, [ user ])

    // listen to invites from friends
    useEffect(() => {
        socket.on('handleInvite', (msg) => {
            console.log(msg)
            setAcceptGame(msg)
        })

        return () => {
            socket.off('handleInvite')
        }
    }, [])
    
    // listen to refuse invites from friends
    useEffect(() => {
        socket.on('handleRefuse', (msg) => {
            setWaitGame(null)
        })
        
        return () => {
            socket.off('handleRefuse')
        } 
    }, [])
    
    // listen to cancelled invites from friends
    useEffect(() => {
        socket.on('cancelInvite', (msg) => {
            setAcceptGame(null)
        })
        
        return () => {
            socket.off('cancelInvite')
        }
    }, [])

    // listen if friend accepted the invite
    useEffect(() => {
        console.log("USER", user)
        socket.on('acceptedInvite', (msg) => {
            navigate("/Game",{state: {user: user, friend: msg}})
            setAcceptGame(null)
            setWaitGame(null)
        })
        
        return () => {
            socket.off('acceptedInvite')
        }
    }, [ user ])
    
    function acceptInvite(f){
        console.log("Aceitou")
        const data = {user: user, data: acceptGame}
        socket.emit('acceptedInvite', data);
        socket.emit('createGame', {user: acceptGame, friend: user})
        navigate("/Game", {state: {user: acceptGame, friend: user}})
        setAcceptGame(null)
        setWaitGame(null)
    }

    function sendInvite(f){
        const data = {user: user, data: f}
        console.log("data",data)
        socket.emit('handleInvite', data);
        setWaitGame(f)
    }

    function cancelInvite(){
        console.log("EEEEEEE")
        const f = waitGame
        const data = {user: user, data: f}
        console.log("dataaa",data)
        socket.emit('cancelInvite', data);
        setWaitGame(null)
        // socket.emit('handleInvite', data)
    }

    function refuseInvite(){
        const f = acceptGame
        const data = {user: user, data: f}
        console.log("data2",data)
        socket.emit('handleRefuse', data);
        setAcceptGame(null)
    }

    const addFriend = (input) => {
        const value = input.target.value
        setFriendSearch(value);
    }

    //Friends
    useEffect(() => {
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
            body: JSON.stringify({user: user}) 
        };

        fetch("/getFriends", data)
        .then((response) => {
            if(!response.ok){
                throw new Error("Network reponse was not ok!")
            }
            return response.text()
        })
        .then((text) => {
            text = JSON.parse(text);
            setFriends(text.friends)
        })
        .catch((err) => {
            console.log(err)
        })

        console.log("friends", friends)
        console.log("pending", pendingFriends)
    }, [user])

    // Pending Friends
    useEffect(() => {
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
            body: JSON.stringify({user: user}) 
        };

        fetch("/getPendingFriends", data)
        .then((response) => {
            if(!response.ok){
                throw new Error("Network reponse was not ok!")
            }
            return response.text()
        })
        .then((text) => {
            text = JSON.parse(text);
            setPendingFriends(text.pendingFriends)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [ user ]);
    
    const submitAddFriend = (event) => {
        event.preventDefault();

        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
            body: JSON.stringify({id_user: user, id_friend: friendSearch}) // Convert data to JSON string
        };
        
        console.log("body", data.body)
        
        fetch("/addFriend",data)
        .then((response) => {
            if(!response.ok){
                throw new Error("Network reponse was not ok!")
            }
            return response.text()
        }).catch((err) => {
            console.log(err)
        })
        
    }

    const acceptPendingFriend = (f) => {

        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
            body: JSON.stringify({user: user, friend: f}) 
        };

        fetch("/acceptPendingFriends", data)
        .then((response) => {
            if(!response.ok){
                throw new Error("Network reponse was not ok!")
            }
            return response.text()
        })
        .then((text) => {
            setFriends([...friends, f])
        })
        .catch((err) => {
            console.log(err)
        })
    }

    if(!user){
        return ( 
            <div> Usuario precisa estar logado </div>
            )
        }
        
    if(waitGame){
        return (
            <div>
                <h1> Esperando jogador {waitGame} aceitar a partida </h1>
                <button onClick = {cancelInvite}> cancelar </button>
            </div>
        )
    }

    if(acceptGame){
        return (
            <div>
                <h1> Aceitar partida com jogador {acceptGame} </h1>
                <button onClick = {acceptInvite}> Aceitar </button>
                <button onClick = {refuseInvite}> Cancelar </button>
            </div>
        )
    }
    
    return(
        <div>
            <p> Home </p>

            <form onSubmit={submitAddFriend}>
                <input onChange = {addFriend}/>
                <button type="submit"> Clicar </button>
            </form>
            <div>
                <div className="Friends">
                    <h1> Friends </h1>
                    {
                        friends.map((val, index) => {
                            return (
                                <div key = {val}>
                                    <p> Amigo {val} </p>
                                    <button onClick = {() => sendInvite(val)}> Clicar </button>
                                </div>
                            )
                        })
                        
                    }
                </div>
                <div>
                    <h1> Friend requests </h1>
                    {
                        pendingFriends.map((val, index) => {
                            return (
                                <div key = {index}>
                                    <p> Amigo pendente {val} </p>
                                    <button onClick = {() => acceptPendingFriend(val)}> Clicar </button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}