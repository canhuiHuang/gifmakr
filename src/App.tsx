import React, { useState, useEffect, useRef } from 'react';
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import useKeyPress from './useKeyPress'; 
import './App.css';
//import VideoPlayer from './videoPlayer/VideoPlayer';
import VideoPlayer from './VideoPlayer';
import Help from './Help';

const ffmpeg = createFFmpeg({log:true});

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [url, setUrl] = useState<any>();
  const [video, setVideo] = useState<any>();
  const [prevVideo, setPrevVideo] = useState<any>();
  const [fileInput_mode, setFileInput_mode] = useState<boolean>(true);
  const [gif, setGif] = useState<any>();
  const [png, setPng] = useState<any>();
  const [mp4, setmp4] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [issue, setIssue] = useState<boolean>(false);
  const [newVideoToggle, setNewVideoToggle] = useState<boolean>(false);

  const [duration, setDuration] = useState<any>(0);
  const [currentSeconds, setCurrentSeconds] = useState<any>(0);
  const [currentPercentage, setCurrentPercentage] = useState<any>(0);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.5);
  const [video_name, setVideo_name] = useState<string>('your');
  // const [fps, setFps] = useState<number>(24);
  // const [useCustomFps, setUseCustomFps] = useState<boolean>(false);

  const [currentKey, setCurrentKey] = useState<string>('x');
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
    if (typeof(Storage) !== "undefined") {
      if (localStorage.getItem("darkMode")){
        if (localStorage.getItem("darkMode") === 'true')
          setDarkMode(true);
        else setDarkMode(false);
      }
    }

    load();
    window.addEventListener('keydown', downHandler);
  },[])

  const takeThumbnail = async (duration) => {
    // Write the file to memory
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

    console.log('thumbnail ss: ', duration*0.1);
    await ffmpeg.run('-i', 'video.mp4', '-ss', (duration*0.05).toString(), '-frames:v', '1', 'out.jpg');

    // Read the result
    const data = ffmpeg.FS('readFile','out.jpg');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer],{type: 'image/jpg'}));
    setPng(url)
  }

  const convertToGif = async () => {
    try {
      // Write the file to memory
      setLoading(true);
      ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

      // Run the FFMpeg command
      // if (useCustomFps){
      //   console.log('custom fps', fps);
      //   await ffmpeg.run('-ss', start.toString(), '-t', (end - start).toString(), '-i', 'video.mp4', '-vf', `fps=${fps},scale=w=${scale}*iw:h=${scale}*ih:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, 'out.gif');
      // }
      // else {
        await ffmpeg.run('-ss', start.toString(), '-t', (end - start).toString(), '-i', 'video.mp4', '-vf', `fps=30,scale=w=${scale}*iw:h=${scale}*ih:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, 'out.gif');
      
      // Read the result
      const data = ffmpeg.FS('readFile','out.gif');

      // Create a URL
      const url = URL.createObjectURL(new Blob([data.buffer],{type: 'image/gif'}));
      setGif(url);
      setmp4(undefined);
      setLoading(false);
    } catch (error) {
      console.error('Report this. Error: ',error);
      setIssue(true);
      setTimeout(()=>{
        setIssue(false);
      },3200)
      setLoading(false);
    }
  }
  const quickConvertToGif = async () => {
    try {
      setLoading(true);
      // Write the file to memory
      ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

      // Run the FFMpeg command
      await ffmpeg.run('-ss', start.toString(), '-i', 'video.mp4', '-t', (end - start).toString(), '-vf', `fps=30`, '-f', 'gif', 'out.gif');
      
      // Read the result
      const data = ffmpeg.FS('readFile','out.gif');

      // Create a URL
      const url = URL.createObjectURL(new Blob([data.buffer],{type: 'image/gif'}));
      setGif(url)
      setmp4(undefined);
      setLoading(false);
    } catch (error) {
      console.error('Report this. Error: ',error);
      setIssue(true);
      setTimeout(()=>{
        setIssue(false);
      },3200)
      setLoading(false);
    }
  }
  const convertTomp4 = async () => {
    try {
      setLoading(true);
      // Write the file to memory
      ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));

      // Run the FFMpeg command
      await ffmpeg.run('-ss', start.toString(), '-i', 'video.mp4', '-t', (end - start).toString(),  '-c', 'copy', 'out.mp4');
      
      // Read the result
      const data = ffmpeg.FS('readFile','out.mp4');

      // Create a URL
      const url = URL.createObjectURL(new Blob([data.buffer],{type: 'video/mp4'}));
      setmp4(url)
      setGif(undefined);
      setLoading(false);
    } catch (error) {
      console.error('Report this. Error: ',error);
      setIssue(true);
      setTimeout(()=>{
        setIssue(false);
      },3200)
      setLoading(false);
    }
  }
  const onReadyCallBack = (e) => {
    console.log('onReady', e.getDuration());

    setDuration(e.getDuration());
    if(prevVideo !== video){
      takeThumbnail(e.getDuration());
      setStart(0.15*e.getDuration())
      setEnd(0.2*e.getDuration());
      setPrevVideo(video);
    }
  }
  const onProgressCallBack = (e) => {
    const {played, playedSeconds} = e;
    
    setCurrentSeconds(playedSeconds);
    setCurrentPercentage(played);
  }
  const onSeekCallback = e => {
    if(zKeyPress && e < end) setStart(e);
    else if(cKeyPress && e > start) setEnd(e);
    else if (!zKeyPress && !cKeyPress) setCurrentSeconds(e);
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
        setCurrentSeconds(parseFloat(e.target.value));
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
  // const handleFpsChange = e => {
  //   setFps(parseFloat(e.target.value))
  //   console.log(fps);
  // }
  const handleScaleChange = e => {
    setScale(parseFloat(e.target.value))
  }
  const handleDarkMode_switch = e => {
    setDarkMode(!darkMode);
    if (typeof(Storage) !== "undefined") {
      darkMode? localStorage.setItem('darkMode', 'false') : localStorage.setItem('darkMode', 'true')
    }
  }

  return <div className={`whole ${darkMode? 'darkmode' : ''}`}>
    <div className="button b2" id="button-11">
      <input type="checkbox" className="checkbox" checked={darkMode} onChange={handleDarkMode_switch}/>
      <div className="knobs"><span></span></div>
      <div className="layer"></div>
    </div>
    {ready? (
    <div className="App" style={video? {marginTop: '1rem'} : 
    {}}>
      {<h1>Convert or cut your video into a Gif</h1>}
      {video && <VideoPlayer newVideoToggle={newVideoToggle} url={video} onProgressCallBack={onProgressCallBack} onReadyCallBack={onReadyCallBack} onSeekCallback={onSeekCallback} />}
      {video && <div className="startEnd_inputs">
        <input className="numberStart" value={start} type="number" min="0" max={end - 0.0001} onChange={handleStartChange}/>
        <input className="numberEnd" value={end} type="number" min={start + 0.0001} max={duration} onChange={handleEndChange}/>
      </div>}
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
      <div className="video_input">
        {
          fileInput_mode? <label className="file">
          <input type="file" id="file" className="btn" onChange={e=> {
            setPrevVideo(video);
            setVideo_name(e.target.files?.item(0).name);
            setUrl(e.target.files?.item(0));
            setVideo(URL.createObjectURL(e.target.files?.item(0)));
            }} /> 
          <span className="file-custom" data-after-content={url? url.name : "Choose file..."}></span>
        </label> : 
          <input type="url" id="file" className="btn"/>
        }
        <button disabled onClick={() => setFileInput_mode(!fileInput_mode)} className="file_input_toggle">{fileInput_mode? <i className="far fa-file-video"></i> : <i className="fas fa-link"></i>}</button>
      </div>
      
      {video && <div className="panel">
        <div className="options">
          <div className="scale">
            <label htmlFor="scale">Scale: {Math.round(scale*100)}% </label>
            <input type="range" id="scale" min={0.1} max={1} step='any' defaultValue={0.5} onChange={handleScaleChange}/>
          </div>
          {/* <div className="fps-container">
            <input type="checkbox" onChange={()=>setUseCustomFps(!useCustomFps)}/>
            <label htmlFor="fps">Custom Fps </label>
            <input disabled={!useCustomFps} className="fps_input" id='fps' defaultValue={24} type="number" min={10} max={144} onChange={handleFpsChange}/>
          </div> */}
        </div>
        <button className="btn" onClick={(convertToGif)}>Convert</button>
        <div className="sub-btns">
          <button className="btn quick-convert" onClick={quickConvertToGif}>Quick Convert</button>
          <button className="btn mp4-convert" onClick={(convertTomp4)}>Cut (mp4) <i className="fas fa-exclamation-circle"></i></button>
        </div>
        {issue && <p className="error">Something went wrong.</p>}
        {loading && !gif && !mp4 && <div className='result'>
            <div className="load-4">
              <p>Converting</p>
              <div className="ring-1"></div>
          </div>
        </div>}
        {gif && <div className='result'>
          {loading? <div className="load-4">
              <p>Converting</p>
              <div className="ring-1"></div>
          </div> : <div className='contenido'>
            <img src={gif} width="256"></img>
            <a href={gif} target='_blank' download={`${video_name}.gif`}>Download</a>
          </div>
          }
          </div>}
        {mp4 && <div className='result'>
          {loading? <div className="load-4">
              <p>Converting</p>
              <div className="ring-1"></div>
          </div> : <div className='contenido'>
            <video
              autoPlay
              width='256'
              src={mp4}
            >
            </video>
            <a href={mp4} target='_blank' download={`${video_name}.mp4`}> Download</a>
          </div>
          }
        </div>}
      </div> }

    </div>
  ) : 
  (<div className="load-2">
  <div className="line"></div>
  <div className="line"></div>
  <div className="line"></div>
</div>)}
  <Help video={video} />
  <footer id="footer">Cut2Gif v1.0a &copy; made by Boku Dev.</footer>
</div>
  
}

export default App;
