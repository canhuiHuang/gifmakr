import React, {useState, useEffect, useRef} from "../_snowpack/pkg/react.js";
import ReactPlayer from "../_snowpack/pkg/react-player.js";
function VideoPlayer({url, onSeekCallback, onReadyCallBack, onProgressCallBack, newVideoToggle}) {
  const [video, setVideo] = useState(url);
  const playerRef = useRef();
  const loadVideo = () => {
    console.log("asd");
    setVideo(url);
  };
  useEffect(() => {
    loadVideo();
  }, []);
  const toggleHack = (url2) => {
    setVideo(url2);
    return video;
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "player-wrapper"
  }, /* @__PURE__ */ React.createElement(ReactPlayer, {
    ref: playerRef,
    className: "react-player",
    url,
    width: "100%",
    height: "100%",
    controls: true,
    onSeek: onSeekCallback,
    onReady: onReadyCallBack,
    onStart: () => {
      console.log("started");
    },
    onProgress: onProgressCallBack
  }));
}
export default VideoPlayer;
