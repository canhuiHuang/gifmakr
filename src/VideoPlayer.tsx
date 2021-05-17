import React,{useState, useEffect, useRef} from 'react'
import ReactPlayer from 'react-player';


function VideoPlayer({url,onSeekCallback,onReadyCallBack,onProgressCallBack,newVideoToggle}) {
    const [video, setVideo] = useState(url);
    const playerRef = useRef();

    const loadVideo = () => {
        console.log('asd');
        setVideo(url)
    }
    useEffect(()=>{
        loadVideo();
    },[])
    const toggleHack = (url) => {
        setVideo(url);
        return video;
    }

    return (
        <div className="player-wrapper">
            <ReactPlayer
                ref={playerRef}
                className="react-player"
                url={url}
                width='100%'
                height='100%'
                controls={true}
                onSeek={onSeekCallback}
                onReady={onReadyCallBack}
                onStart={()=>{console.log('started')}}
                onProgress={onProgressCallBack}
            />
        </div>
    )
}

export default VideoPlayer