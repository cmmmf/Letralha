import "../styles.css"

export default function RowGameComponent(props){

    const render = () => {
        var ret = []

        if(props.action != undefined){
            Object.entries(props.action).forEach(([key, value]) => {

                if(value[1] == 'correct'){
                    ret.push(
                        <div class = "letterBox" style = {{backgroundColor: '#37841A'}}>
                            {value[0]}
                        </div>
                    );
                }
                else if(value[1] == 'partial'){
                    ret.push(
                        <div class = "letterBox" style = {{backgroundColor: '#EF8D09'}}>
                            {value[0]}
                        </div>
                    );
                }
                else{
                    ret.push(
                        <div class = "letterBox" style = {{backgroundColor: '#D62017'}}>
                            {value[0]}
                        </div>
                    );
                }
            });

            return ret;
        }
        
        if(props.word != undefined){
            console.log(props.word)
            for(var i = 0;i < 5;i++){
                ret.push(
                    <div class = "letterBox">
                        {props.word[i]}
                    </div>
                );
            }
            return ret
        }
        
        for(var i = 0;i < 5;i++){
            ret.push(
                <div class = "letterBox"/>
            );
        }
        return ret
        
    }

    return (
        <div class = "rowGameContainer">
            {render()}
        </div>
    )

}