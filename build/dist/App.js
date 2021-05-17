import React, {useState, useEffect} from "../_snowpack/pkg/react.js";
import {createFFmpeg, fetchFile} from "../_snowpack/pkg/@ffmpeg/ffmpeg.js";
import useKeyPress from "./useKeyPress.js";
import "./App.css.proxy.js";
import VideoPlayer from "./VideoPlayer.js";
import Help from "./Help.js";
const ffmpeg = createFFmpeg({log: true});
function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [url, setUrl] = useState();
  const [video, setVideo] = useState();
  const [prevVideo, setPrevVideo] = useState();
  const [fileInput_mode, setFileInput_mode] = useState(true);
  const [gif, setGif] = useState();
  const [png, setPng] = useState();
  const [mp4, setmp4] = useState();
  const [loading, setLoading] = useState(false);
  const [issue, setIssue] = useState(false);
  const [newVideoToggle, setNewVideoToggle] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [currentKey, setCurrentKey] = useState("x");
  const zKeyPress = useKeyPress("z");
  const cKeyPress = useKeyPress("c");
  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };
  function downHandler({key}) {
    if (key === "z") {
      setCurrentKey("z");
    } else if (key === "x" || key === "space") {
      setCurrentKey("x");
    } else if (key === "c") {
      setCurrentKey("c");
    }
  }
  useEffect(() => {
    if (typeof Storage !== "undefined") {
      if (localStorage.getItem("darkMode")) {
        if (localStorage.getItem("darkMode") === "true")
          setDarkMode(true);
        else
          setDarkMode(false);
      }
    }
    load();
    window.addEventListener("keydown", downHandler);
  }, []);
  const takeThumbnail = async (duration2) => {
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video));
    console.log("thumbnail ss: ", duration2 * 0.1);
    await ffmpeg.run("-i", "video.mp4", "-ss", (duration2 * 0.05).toString(), "-frames:v", "1", "out.jpg");
    const data = ffmpeg.FS("readFile", "out.jpg");
    const url2 = URL.createObjectURL(new Blob([data.buffer], {type: "image/jpg"}));
    setPng(url2);
  };
  const convertToGif = async () => {
    try {
      setLoading(true);
      ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video));
      await ffmpeg.run("-ss", start.toString(), "-t", (end - start).toString(), "-i", "video.mp4", "-vf", `fps=30,scale=w=${scale}*iw:h=${scale}*ih:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, "out.gif");
      const data = ffmpeg.FS("readFile", "out.gif");
      const url2 = URL.createObjectURL(new Blob([data.buffer], {type: "image/gif"}));
      setGif(url2);
      setmp4(void 0);
      setLoading(false);
    } catch (error) {
      console.error("Report this. Error: ", error);
      setIssue(true);
      setTimeout(() => {
        setIssue(false);
      }, 3200);
      setLoading(false);
    }
  };
  const quickConvertToGif = async () => {
    try {
      setLoading(true);
      ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video));
      await ffmpeg.run("-ss", start.toString(), "-i", "video.mp4", "-t", (end - start).toString(), "-vf", `fps=30`, "-f", "gif", "out.gif");
      const data = ffmpeg.FS("readFile", "out.gif");
      const url2 = URL.createObjectURL(new Blob([data.buffer], {type: "image/gif"}));
      setGif(url2);
      setmp4(void 0);
      setLoading(false);
    } catch (error) {
      console.error("Report this. Error: ", error);
      setIssue(true);
      setTimeout(() => {
        setIssue(false);
      }, 3200);
      setLoading(false);
    }
  };
  const convertTomp4 = async () => {
    try {
      setLoading(true);
      ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video));
      await ffmpeg.run("-ss", start.toString(), "-i", "video.mp4", "-t", (end - start).toString(), "-c", "copy", "out.mp4");
      const data = ffmpeg.FS("readFile", "out.mp4");
      const url2 = URL.createObjectURL(new Blob([data.buffer], {type: "video/mp4"}));
      setmp4(url2);
      setGif(void 0);
      setLoading(false);
    } catch (error) {
      console.error("Report this. Error: ", error);
      setIssue(true);
      setTimeout(() => {
        setIssue(false);
      }, 3200);
      setLoading(false);
    }
  };
  const onReadyCallBack = (e) => {
    console.log("onReady", e.getDuration());
    setDuration(e.getDuration());
    if (prevVideo !== video) {
      takeThumbnail(e.getDuration());
      setStart(0.15 * e.getDuration());
      setEnd(0.2 * e.getDuration());
      setPrevVideo(video);
    }
  };
  const onProgressCallBack = (e) => {
    const {played, playedSeconds} = e;
    setCurrentSeconds(playedSeconds);
    setCurrentPercentage(played);
  };
  const onSeekCallback = (e) => {
    if (zKeyPress && e < end)
      setStart(e);
    else if (cKeyPress && e > start)
      setEnd(e);
    else if (!zKeyPress && !cKeyPress)
      setCurrentSeconds(e);
  };
  const handleSeekChange = (e) => {
    console.log("handling seek change: ", e.target.value, e.target, e);
    switch (currentKey) {
      case "z":
        if (e.target.value < end)
          setStart(parseFloat(e.target.value));
        break;
      case "c":
        if (e.target.value > start)
          setEnd(parseFloat(e.target.value));
        break;
      case "x":
        setCurrentSeconds(parseFloat(e.target.value));
        break;
      default:
        break;
    }
  };
  const handleStartChange = (e) => {
    setStart(parseFloat(e.target.value));
  };
  const handleEndChange = (e) => {
    setEnd(parseFloat(e.target.value));
  };
  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value));
  };
  const handleDarkMode_switch = (e) => {
    setDarkMode(!darkMode);
    if (typeof Storage !== "undefined") {
      darkMode ? localStorage.setItem("darkMode", "false") : localStorage.setItem("darkMode", "true");
    }
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: `whole ${darkMode ? "darkmode" : ""}`
  }, /* @__PURE__ */ React.createElement("div", {
    className: "button b2",
    id: "button-11"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "checkbox",
    className: "checkbox",
    checked: darkMode,
    onChange: handleDarkMode_switch
  }), /* @__PURE__ */ React.createElement("div", {
    className: "knobs"
  }, /* @__PURE__ */ React.createElement("span", null)), /* @__PURE__ */ React.createElement("div", {
    className: "layer"
  })), ready ? /* @__PURE__ */ React.createElement("div", {
    className: "App",
    style: video ? {marginTop: "1rem"} : {}
  }, /* @__PURE__ */ React.createElement("h1", null, "Convert or cut your video into a Gif"), video && /* @__PURE__ */ React.createElement(VideoPlayer, {
    newVideoToggle,
    url: video,
    onProgressCallBack,
    onReadyCallBack,
    onSeekCallback
  }), video && /* @__PURE__ */ React.createElement("div", {
    className: "startEnd_inputs"
  }, /* @__PURE__ */ React.createElement("input", {
    className: "numberStart",
    value: start,
    type: "number",
    min: "0",
    max: end - 1e-4,
    onChange: handleStartChange
  }), /* @__PURE__ */ React.createElement("input", {
    className: "numberEnd",
    value: end,
    type: "number",
    min: start + 1e-4,
    max: duration,
    onChange: handleEndChange
  })), video && /* @__PURE__ */ React.createElement("div", {
    className: "timeline"
  }, /* @__PURE__ */ React.createElement("input", {
    className: "onSeekBar",
    style: {
      height: "8vh",
      backgroundImage: `url(${png})`,
      backgroundRepeat: "repeat",
      backgroundSize: "16vh"
    },
    type: "range",
    min: 0,
    max: duration,
    step: "any",
    value: currentSeconds,
    onChange: handleSeekChange
  }), /* @__PURE__ */ React.createElement("div", {
    onClick: () => setCurrentKey("z"),
    className: `start ${currentKey === "z" ? "selected" : ""}`,
    style: {
      transform: `translateY(-9vh) translateX(${start / duration * 52}vw)`
    }
  }), /* @__PURE__ */ React.createElement("div", {
    onClick: () => setCurrentKey("c"),
    className: `end ${currentKey === "c" ? "selected" : ""}`,
    style: {
      transform: `translateY(-9vh) translateX(${end / duration * 52}vw)`
    }
  })), /* @__PURE__ */ React.createElement("div", {
    className: "video_input"
  }, fileInput_mode ? /* @__PURE__ */ React.createElement("label", {
    className: "file"
  }, /* @__PURE__ */ React.createElement("input", {
    type: "file",
    id: "file",
    className: "btn",
    onChange: (e) => {
      setPrevVideo(video);
      setUrl(e.target.files?.item(0));
      console.log(e.target.files?.item(0));
      console.log(URL.createObjectURL(e.target.files?.item(0)));
      setVideo(URL.createObjectURL(e.target.files?.item(0)));
    }
  }), /* @__PURE__ */ React.createElement("span", {
    className: "file-custom",
    "data-after-content": url ? url.name : "Choose file..."
  })) : /* @__PURE__ */ React.createElement("input", {
    type: "url",
    id: "file",
    className: "btn"
  }), /* @__PURE__ */ React.createElement("button", {
    disabled: true,
    onClick: () => setFileInput_mode(!fileInput_mode),
    className: "file_input_toggle"
  }, fileInput_mode ? /* @__PURE__ */ React.createElement("i", {
    className: "far fa-file-video"
  }) : /* @__PURE__ */ React.createElement("i", {
    className: "fas fa-link"
  }))), video && /* @__PURE__ */ React.createElement("div", {
    className: "panel"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "options"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "scale"
  }, /* @__PURE__ */ React.createElement("label", {
    htmlFor: "scale"
  }, "Scale: ", Math.round(scale * 100), "% "), /* @__PURE__ */ React.createElement("input", {
    type: "range",
    id: "scale",
    min: 0.1,
    max: 1,
    step: "any",
    defaultValue: 0.5,
    onChange: handleScaleChange
  }))), /* @__PURE__ */ React.createElement("button", {
    className: "btn",
    onClick: convertToGif
  }, "Convert"), /* @__PURE__ */ React.createElement("div", {
    className: "sub-btns"
  }, /* @__PURE__ */ React.createElement("button", {
    className: "btn quick-convert",
    onClick: quickConvertToGif
  }, "Quick Convert"), /* @__PURE__ */ React.createElement("button", {
    className: "btn mp4-convert",
    onClick: convertTomp4
  }, "Convert to mp4 ", /* @__PURE__ */ React.createElement("i", {
    className: "fas fa-exclamation-circle"
  }))), issue && /* @__PURE__ */ React.createElement("p", {
    className: "error"
  }, "Something went wrong."), loading && !gif && !mp4 && /* @__PURE__ */ React.createElement("div", {
    className: "result"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "load-4"
  }, /* @__PURE__ */ React.createElement("p", null, "Converting"), /* @__PURE__ */ React.createElement("div", {
    className: "ring-1"
  }))), gif && /* @__PURE__ */ React.createElement("div", {
    className: "result"
  }, loading ? /* @__PURE__ */ React.createElement("div", {
    className: "load-4"
  }, /* @__PURE__ */ React.createElement("p", null, "Converting"), /* @__PURE__ */ React.createElement("div", {
    className: "ring-1"
  })) : /* @__PURE__ */ React.createElement("div", {
    className: "contenido"
  }, /* @__PURE__ */ React.createElement("img", {
    src: gif,
    width: "256"
  }), /* @__PURE__ */ React.createElement("a", {
    href: gif,
    target: "_blank",
    download: "yourGif.gif"
  }, "Download"))), mp4 && /* @__PURE__ */ React.createElement("div", {
    className: "result"
  }, loading ? /* @__PURE__ */ React.createElement("div", {
    className: "load-4"
  }, /* @__PURE__ */ React.createElement("p", null, "Converting"), /* @__PURE__ */ React.createElement("div", {
    className: "ring-1"
  })) : /* @__PURE__ */ React.createElement("div", {
    className: "contenido"
  }, /* @__PURE__ */ React.createElement("video", {
    autoPlay: true,
    width: "256",
    src: mp4
  }), /* @__PURE__ */ React.createElement("a", {
    href: mp4,
    target: "_blank",
    download: "yourmp4.mp4"
  }, " Download"))))) : /* @__PURE__ */ React.createElement("div", {
    className: "load-2"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "line"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "line"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "line"
  })), /* @__PURE__ */ React.createElement(Help, {
    video
  }), /* @__PURE__ */ React.createElement("footer", {
    id: "footer"
  }, "CutToGif v1.0a © made by Boku Dev."));
}
export default App;
