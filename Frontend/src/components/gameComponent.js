import { useLocation, useRef, useEffect } from 'react'
import RowGameComponent from './rowGameComponent';

export default function GameComponent(props){
    const params = props;
    const divRef = useRef(null)

    console.log("GameComponent:" , params)

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                console.log('Enter key pressed');
            }
            
            var new_word = params.word
            
            if(event.key === 'Backspace'){
                new_word = new_word.substring(0, new_word.length - 1);
                params.setWord(new_word)
                return;
            }

            new_word += event.key
            new_word = new_word.toUpperCase()

            if(new_word.length <= 5){
                params.setWord(new_word)
                params.setLastWord(params.type)
            }
            
        };
    
        const divElement = divRef.current;
        divElement.addEventListener('keydown', handleKeyPress);
        console.log("div element", divElement)
    
        return () => {
          divElement.removeEventListener('keydown', handleKeyPress);
        };
      }); 

    const render = () => {

        var ret = []

        if(params.type == "my_word"){
            ret.push(
                <h1 style = {{color: 'aliceblue', marginLeft:'16.5%'}}> ID: {params.user} </h1>
            )
        }
        else{
            ret.push(
                <h1 style = {{color: 'aliceblue', marginLeft:'16.5%'}}> ID: {params.friend} </h1>
            )
        }

        const actions = params.turns.actions

        console.log("act", actions)

        for(var i = 0;i < 6;i++){
            if(actions.length - 1 >= i){
                ret.push(
                    <div>
                        <RowGameComponent action = {actions[i]}/>
                    </div>
                )
            }
            else if(i == actions.length){
                ret.push(
                    <div ref={divRef} tabIndex={0}>
                        <RowGameComponent word = {params.word}/>
                    </div>
                )
            }
            else{
                ret.push(
                    <div>
                        <RowGameComponent/>
                    </div>
                )
            }
        }

        return ret
    }

    return (
        <div>
            { render() }
        </div>
    )
}