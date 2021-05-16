import React,{useState, useEffect} from 'react'
import ReactPlayer from 'react-player';


function VideoPlayer({url,onSeekCallback,onReadyCallBack,takeThumbnail}) {
    const [video, setVideo] = useState(url);

    const loadVideo = () => {
        console.log('asd');
        setVideo(url)
    }
    useEffect(()=>{
        loadVideo();
    },[])

    return (
        <div className="player-wrapper">
            <ReactPlayer 
                className="react-player"
                url={video}
                width="100%"
                height="100%"
                controls={true}
                onSeek={onSeekCallback}
                onReady={onReadyCallBack}
                onStart={()=>{console.log('started')}}
            />
        </div>
    )
}

export default VideoPlayer
