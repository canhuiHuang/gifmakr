import React, {useState} from 'react'

function Help({video}) {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <div className={`help-button-wrapper ${expanded? 'expanded' : ''}`} style={video?{alignSelf: 'flex-end'} : {alignSelf: 'center',marginTop: '-2rem'}}>
            <ul className="help-list">
                <li><img id="instructionGif" width='420' src="https://media.giphy.com/media/KmNvcE5x6gFbf3CUZx/giphy.gif" alt="" style={{pointerEvents: 'none'}} />
                </li>
                <li className="instructions">Use the bars to select part of the video to cut.</li>
                <li className="instructions" >You can also use the Keys 'Z' & 'C'.</li>
            </ul>

            <button className="help-button" onClick={()=>setExpanded(!expanded)}>
                <span><i className="fas fa-question"></i></span>
            </button>
        </div>
    )
}

export default Help
