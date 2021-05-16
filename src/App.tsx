import React, { useState, useEffect, useRef } from 'react';
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import useKeyPress from './useKeyPress'; 
import './App.css';
//import VideoPlayer from './videoPlayer/VideoPlayer';
import VideoPlayer from './VideoPlayer';

const ffmpeg = createFFmpeg({log:true});

function App() {
  const [ready, setReady] = useState<boolean>(false);
  const [video, setVideo] = useState<any>();
  const [gif, setGif] = useState<any>();
  const [png, setPng] = useState<any>();
  const [mp4, setmp4] = useState<any>();
  const [timeLine_urls, setTimelineUrls] = useState<any[]>();

  const [duration, setDuration] = useState<any>(0);
  const [currentSeconds, setCurrentSeconds] = useState<any>(0);
  const [currentPercentage, setCurrentPercentage] = useState<any>(0);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.5);
  const [fps, setFps] = useState<number>(24);

  const [currentKey, setCurrentKey] = useState<string>('');
  const zKeyPress = useKeyPress('z');
  const cKeyPress = useKeyPress('c');

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  function downHandler({ key }) {
    if (key === 'z') {
      setCurrentKey('z');
    } else if (key === 'x' || key === 'space') {
      setCurrentKey('x');
    } else if (key === 'c') {
      setCurrentKey('c');
    } 
  }

  useEffect(()=>{
    load();
    window.addEventListener('keydown', downHandler);
  },[])
  const takeThumbnail = async () => {
    // Write the file to memory
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

    let offset = duration/14;
    await ffmpeg.run('-i', 'video.mp4', '-ss', '3.0', '-frames:v', '1', 'out.jpg');

    // Read the result
    const data = ffmpeg.FS('readFile','out.jpg');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer],{type: 'image/jpg'}));
    setPng(url)
  }

  const convertToGif = async () => {
    // Write the file to memory
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

    // Run the FFMpeg command
    await ffmpeg.run('-ss', start.toString(), '-t', (end - start).toString(), '-i', 'video.mp4', '-vf', `fps=${fps},scale=w=${scale}*iw:h=${scale}*ih:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, 'out.gif');
     
    // Read the result
    const data = ffmpeg.FS('readFile','out.gif');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer],{type: 'image/gif'}));
    setGif(url)
  }
  const quickConvertToGif = async () => {
    // Write the file to memory
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

    // Run the FFMpeg command
    await ffmpeg.run('-ss', start.toString(), '-t', (end - start).toString(), '-i', 'video.mp4', '-f', 'gif', 'out.gif');
     
    // Read the result
    const data = ffmpeg.FS('readFile','out.gif');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer],{type: 'image/gif'}));
    setGif(url)
  }
  const convertTomp4 = async () => {
    // Write the file to memory
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

    // Run the FFMpeg command
    await ffmpeg.run('-ss', start.toString(), '-t', (end - start).toString(), '-i', 'video.mp4', '-f', 'mp4', 'out.mp4');
     
    // Read the result
    const data = ffmpeg.FS('readFile','out.mp4');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer],{type: 'video/mp4'}));
    setmp4(url)
  }
  const onReadyCallBack = (e) => {
    console.log('onReady', e.getDuration());
    setDuration(e.getDuration());
    if(!png){
      takeThumbnail();
      setEnd(e.getDuration());
    }
  }
  const onProgressCallBack = (e) => {
    const {played, playedSeconds} = e;
    
    setCurrentSeconds(playedSeconds);
    setCurrentPercentage(played);
    console.log('percentage: ', currentPercentage, 'seconds played: ');
  }
  const onSeekCallback = e => {
    if(zKeyPress) setStart(e);
    else if(cKeyPress) setEnd(e);
    else setCurrentSeconds(e);
  }
  const handleSeekChange = e => {
    console.log('handling seek change: ' ,e.target.value, e.target, e);
    
    switch(currentKey){
      case 'z':
        if(e.target.value < end) setStart(parseFloat(e.target.value))
        break;
      case 'c':
        if(e.target.value > start) setEnd(parseFloat(e.target.value))
        break;
      case 'x':
        setCurrentSeconds(parseFloat(e.target.value))
        break;
      default:
        break;
    }
  }
  const handleStartChange = e => {
    setStart(parseFloat(e.target.value))
  }
  const handleEndChange = e => {
    setEnd(parseFloat(e.target.value))
  }
  const handleFpsChange = e => {
    setFps(parseFloat(e.target.value))
  }
  const handleScaleChange = e => {
    setScale(parseFloat(e.target.value))
  }

  return ready? (
    <div className="App">
      {video && <VideoPlayer url={URL.createObjectURL(video)} takeThumbnail={takeThumbnail} onReadyCallBack={onReadyCallBack} onSeekCallback={onSeekCallback} />}
      <div className="startEnd_inputs">
        <input className="numberStart" value={start} type="number" min="0" max={end - 0.0001} onChange={handleStartChange}/>
        <input className="numberEnd" value={end} type="number" min={start + 0.0001} max={duration} onChange={handleEndChange}/>
      </div>
      {video && <div className="timeline" >
        <input  className="onSeekBar" style={{
            height: '8vh',
            backgroundImage: `url(${png})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '16vh',
          }}
          type='range' min={0} max={duration} step='any'
          value={currentSeconds}
          onChange={handleSeekChange}
        />
        <div onClick={()=> setCurrentKey('z')} className={`start ${currentKey=== 'z'? 'selected' : ''}`} style={{
            transform: `translateY(-9vh) translateX(${(start/duration)*52}vw)`,
          }}></div>
        <div onClick={()=> setCurrentKey('c')} className={`end ${currentKey=== 'c'? 'selected' : ''}`} style={{
          transform: `translateY(-9vh) translateX(${(end/duration)*52}vw)`,
        }}></div>

        
      </div>}
      <input type="file" className="btn" onChange={e=> {
        setVideo(e.target.files?.item(0));
      }} />
      
      <h3>Result</h3>
      <label htmlFor="scale">Scale</label>
      <input type="range" id="scale" min={0.1} max={1} step='any' defaultValue={0.5} onChange={handleScaleChange}/>
      <label htmlFor="fps">Fps</label>
      <input className="fps_input" id='fps' defaultValue={24} type="number" min={10} max={144} onChange={handleFpsChange}/>
      <button className="btn" onClick={convertTomp4}>Convert</button>
      <button className="btn" onClick={quickConvertToGif}>Quick Convert</button>
      {gif && <div>
        <img src={gif} width="512"></img>
        <a href={gif} target='_blank' download='yourGif.gif'>download</a>
        </div>}
      {mp4 && <video
              controls
              width='250'
              src={mp4}
            >
            </video>}
      
    </div>
  ) : 
  (<p>Loading...</p>)
}

export default App;
