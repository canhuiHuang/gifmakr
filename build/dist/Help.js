import React, {useState} from "../_snowpack/pkg/react.js";
function Help({video}) {
  const [expanded, setExpanded] = useState(false);
  return /* @__PURE__ */ React.createElement("div", {
    className: `help-button-wrapper ${expanded ? "expanded" : ""}`,
    style: video ? {alignSelf: "flex-end"} : {alignSelf: "center", marginTop: "-2rem"}
  }, /* @__PURE__ */ React.createElement("ul", {
    className: "help-list"
  }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("img", {
    id: "instructionGif",
    width: "420",
    src: "https://media.giphy.com/media/KmNvcE5x6gFbf3CUZx/giphy.gif",
    alt: ""
  })), /* @__PURE__ */ React.createElement("li", {
    className: "instructions"
  }, "Use the bars to select part of the video to cut."), /* @__PURE__ */ React.createElement("li", {
    className: "instructions"
  }, "You can also use the Keys 'Z' & 'C'.")), /* @__PURE__ */ React.createElement("button", {
    className: "help-button",
    onClick: () => setExpanded(!expanded)
  }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", {
    className: "fas fa-question"
  }))));
}
export default Help;
