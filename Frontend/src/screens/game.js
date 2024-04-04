import io, { Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useEffect, useContext, useState, useRef } from 'react';
import { AppContext } from "../App";
import { useNavigate } from 'react-router-dom';
import GameComponent from "../components/gameComponent"
import '../styles.css'

const socket = io("http://192.168.15.8:5000", {rejectUnauthorized: false })

export default function Game(){
    const params = useLocation().state
    const { user, setUser } = useContext(AppContext);
    const [ myWord, setMyWord ] = useState("");
    const [ otherWord, setOtherWord ] = useState("");
    const [ endGame, setEndGame ] = useState(null);
    const [ playersTurns, setPlayersTurns ] = useState({
        [params.user]: {"actions": []}, 
        [params.friend]: {"actions": []}, 
    })
    const [friend, setFriend] = useState(params.friend)
    const [ lastWord, setLastWord ] = useState('my_word')
    const divRef = useRef(null)

    const navigate = useNavigate();
    
    
    useEffect(() => {
        if(user == null) return
        
        if(params.user == user){
            setFriend(params.friend)
        }
        else{
            setFriend(params.user)
        }
        socket.emit("handleConnection", user)
    }, [ user ])

    useEffect(() => {
        socket.emit("getStatus",{user: user, game: [params.user, params.friend]}) 
    })
    
    useEffect(() => {
        socket.on('responseStatus', (msg) => {
            console.log("response", msg)

            if(msg != undefined)
                setPlayersTurns(msg)
        })
        
        return () => {
            setPlayersTurns({
                [params.user]: {"actions": []}, 
                [params.friend]: {"actions": []}, 
            })
            socket.off('responseStatus')
        }
    }, [])
    
    useEffect(() => {
        socket.on('action', (msg) => {
            console.log("msg",msg)
            
            
            if(msg.ret){
                divRef.current = null
                console.log(msg)
                setEndGame(msg)
            }
            else{
                setPlayersTurns(msg.turns)
            }
        })
        
        return () => {
            socket.off('action')
        }
    }, [])
    
    useEffect(() => {
        if(divRef.current == null){
            return;
        }
        
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                sendAction()
            }
        };
        
        const divElement = divRef.current;
        divElement.addEventListener('keydown', handleKeyPress);
        
        return () => {
            divElement.removeEventListener('keydown', handleKeyPress);
        };
    })
    
    const sendAction = () => {
        const value = lastWord
        if(value == "my_word"){
            var data = {user: user, type: value, word: myWord, game: [params.user, params.friend]}
            console.log("send", data)
            socket.emit("action",data)
        }
        else{
            var data = {user: user, type: value, word: otherWord, game: [params.user, params.friend]}
            socket.emit("action",{user: user, type: value, word: otherWord, game: [params.user, params.friend]})
        }
    }
    
    if(user == null){
        return (
            <div>
                <h1>Carregando</h1>
            </div>
        )
    }
    if(endGame){
        return (
            <div style = {{justifyContent: 'center', alignItems: 'center'}}>
                <div style = {{display: 'flex', filter: 'blur(3px)'}}>
                    <div class = "gameComponent">
                        <GameComponent
                            user = {user}
                            friend = {friend}
                            word = {myWord}
                            setWord = {setMyWord}
                            turns = {playersTurns[user]}
                            type = {'my_word'}
                            setLastWord = {setLastWord}
                            />
                    </div>
                    <div class = "gameComponent" style = {{backgroundColor: '#4f0408'}}>
                        <GameComponent
                            user = {user}
                            friend = {friend}
                            word = {otherWord}
                            setWord = {setOtherWord}
                            turns = {playersTurns[friend]}
                            type = {'other_word'}
                            setLastWord = {setLastWord}
                            />
                    </div>
                </div>
                <div class = "endGame">
                    <h1> Terminou o jogo! </h1>
                    <h1> user de ID: {endGame.ret.result} ganhou!</h1>
                    <h1> Palavras: {endGame.words[0]} e {endGame.words[1]}</h1>
                    <button onClick = {() => {navigate("/Home")}}> Voltar para a Home </button>
                </div>
            </div>
        )
    }
            
    console.log("turnos:", user, playersTurns[friend])
            
    return (
        <div ref = {divRef} style = {{display: 'flex'}}>
            <div class = "gameComponent">
                <GameComponent
                    user = {user}
                    friend = {friend}
                    word = {myWord}
                    setWord = {setMyWord}
                    turns = {playersTurns[user]}
                    type = {'my_word'}
                    setLastWord = {setLastWord}
                    />
            </div>
            <div class = "gameComponent" style = {{backgroundColor: '#4f0408'}}>
                <GameComponent
                    user = {user}
                    friend = {friend}
                    word = {otherWord}
                    setWord = {setOtherWord}
                    turns = {playersTurns[friend]}
                    type = {'other_word'}
                    setLastWord = {setLastWord}
                    />
            </div>
        </div>
    )
}