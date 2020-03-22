import React, { Component } from "react";

import Editor, { composeDecorators } from "draft-js-plugins-editor";
import {
  RichUtils,
  EditorState,
  Modifier,
  SelectionState,
  convertToRaw,
  convertFromRaw
} from "draft-js";

import "assets/editor.css";
import { OrderedMap } from "immutable";
import { insertTab } from "utils/indentation";

import { TextAreaContainer } from "../common";
import theme from "style";

import createStrikethroughPlugin from "./plugins/strikethroughPlugin";
import createfontColorsPlugin from "./plugins/fontColorsPlugin";
import createfontSizePlugin from "./plugins/fontSizePlugin";
import createAlignmentPlugin from "./plugins/alignmentPlugin";
import createListStylesPlugin from "./plugins/listStylesPlugin";
import createBlockDepthPlugin from "./plugins/blockDepthPlugin";
import createCodeSnippetPlugin from "./plugins/codeSnippetPlugin";
import createTablePlugin from "./plugins/tablePlugin";
import createCheckboxPlugin from "./plugins/checkboxPlugin";
import createMonospacePlugin from "./plugins/monospacePlugin";
import linkPlugin from "./plugins/addLinkPlugin";
import internalLinkPlugin from "./plugins/internalLinkPlugin";
import createAllCapsPlugin from "./plugins/allCapsPlugin";
import createImagePlugin from "draft-js-image-plugin";

import createFocusPlugin from "draft-js-focus-plugin";
import "draft-js-focus-plugin/lib/plugin.css";
import createBlockDndPlugin from "draft-js-drag-n-drop-plugin";

import createResizablePlugin from "draft-js-resizeable-plugin";
import createBreakoutPlugin from "draft-js-block-breakout-plugin";

const getFragmentFromSelection = require("draft-js/lib/getFragmentFromSelection");

const focusPlugin = createFocusPlugin({ theme: { focused: "focused" } });
const resizeablePlugin = createResizablePlugin();
const blockDndPlugin = createBlockDndPlugin();

const decorator = composeDecorators(
  blockDndPlugin.decorator,
  resizeablePlugin.decorator,
  focusPlugin.decorator
);
const imagePlugin = createImagePlugin({
  theme: { image: "image-wrapper" },
  decorator
});
const breakoutPlugin = createBreakoutPlugin({
  breakoutBlocks: [
    "header-one",
    "header-two",
    "header-three",
    "header-four",
    "header-five",
    "header-six",
    "table"
  ]
});
class CustomEditor extends Component {
  ref = React.createRef();

  componentDidUpdate(prevProps) {
    // if new block copy the previous blocks data to the new
    const blocks = this.getBlockInfo(this.props.editorState);
    const oldBlocks = this.getBlockInfo(prevProps.editorState);
    // TODO check if blocks have the same type
    if (blocks.length > oldBlocks.length) {
      const newBlockIndex = blocks.findIndex(
        block => !oldBlocks.find(oldblock => oldblock.key === block.key)
      );
      if (newBlockIndex > 0) {
        const prevLastBlockStyles = this.props.editorState
          .getCurrentContent()
          .getBlockForKey(oldBlocks[newBlockIndex - 1].key)
          .getData()
          .toObject();
        const {
          cells,
          headers,
          isChecked,
          ...restStyles
        } = prevLastBlockStyles;
        this.props.onChange(
          EditorState.push(
            this.props.editorState,
            Modifier.setBlockData(
              this.props.editorState.getCurrentContent(),
              this.props.editorState.getSelection(),
              restStyles
            )
          )
        );
      }
    }
  }

  handleKeyCommand = command => {
    const newState = RichUtils.handleKeyCommand(
      this.props.editorState,
      command
    );
    if (newState) {
      this.props.onChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  handleTab = e => {
    e.preventDefault();
    const contentState = this.props.editorState.getCurrentContent();
    const selection = this.props.editorState.getSelection();

    const blockType = contentState
      .getBlockForKey(selection.getAnchorKey())
      .getType();
    if (blockType.endsWith("list-item")) {
      this.props.update(RichUtils.onTab(e, this.props.editorState, 4));
    } else {
      this.props.update(insertTab(e, this.props.editorState, 4));
    }
  };

  handleReturn = () => {
    if (this.hasInlineStyle("CODE")) {
      setTimeout(() => this.props.toggleInlineStyle("CODE"), 100);
    }
  };

  hasInlineStyle = type =>
    this.getInlineStyles()
      .toArray()
      .includes(type);

  getInlineStyles = () => this.props.editorState.getCurrentInlineStyle();

  getBlockInfo = editorState =>
    editorState
      .getCurrentContent()
      .getBlockMap()
      .toArray()
      .map(contentBlock => ({
        key: contentBlock.getKey(),
        type: contentBlock.getType()
      }));

  getBlockData = key => () =>
    this.props.editorState
      .getCurrentContent()
      .getBlockForKey(key)
      .getData()
      .toObject();

  setBlockData = key => data => {
    const contentState = this.props.editorState.getCurrentContent();
    const selection = SelectionState.createEmpty(key);
    this.props.onChange(
      EditorState.push(
        this.props.editorState,
        Modifier.setBlockData(contentState, selection, data)
      )
    );
  };

  removeBlock = key => {
    const contentState = this.props.editorState.getCurrentContent();
    const selection = this.props.editorState.getSelection();

    const blockMap = contentState.getBlockMap();
    const newBlockMap = blockMap
      .toArray()
      .filter(block => block.getKey() !== key);

    const newContentState = contentState.merge({
      blockMap: new OrderedMap(
        newBlockMap.map(block => [block.getKey(), block])
      ),
      selectionBefore: selection,
      selectionAfter: selection
    });
    this.props.onChange(
      EditorState.push(
        this.props.editorState,
        newContentState,
        "insert-fragment"
      )
    );
  };

  plugins = [
    createStrikethroughPlugin(),
    createfontColorsPlugin(theme.color.editor),
    createfontSizePlugin(),
    createAlignmentPlugin(["unordered-list-item", "ordered-list-item"]),
    createListStylesPlugin(),
    createBlockDepthPlugin(["unordered-list-item", "ordered-list-item"]),
    createCodeSnippetPlugin(),
    linkPlugin,
    internalLinkPlugin,
    createTablePlugin({
      getBlockData: this.getBlockData,
      setBlockData: this.setBlockData,
      toggleDisableInput: this.props.toggleDisableInput,
      removeBlock: this.removeBlock
    }),
    createCheckboxPlugin({
      getBlockData: this.getBlockData,
      setBlockData: this.setBlockData
    }),
    createMonospacePlugin(),
    createAllCapsPlugin(),
    imagePlugin,
    focusPlugin,
    resizeablePlugin,
    blockDndPlugin,
    breakoutPlugin
  ];

  onCopy = e => {
    localStorage.setItem(
      "draft/state",
      JSON.stringify({
        content: convertToRaw(this.props.editorState.getCurrentContent()),
        selection: this.props.editorState.getSelection(),
        text: window.getSelection().toString()
      })
    );
  };

  onPaste = async e => {
    if (localStorage.getItem("draft/state")) {
      var { text } = JSON.parse(localStorage.getItem("draft/state"));
      if (e.clipboardData.getData("text/plain") === text) {
        return;
      }
    }

    const html = e.clipboardData.getData("text/html");
    if (e.clipboardData.getData("text/html")) {
      const element = document.createElement("html");
      element.innerHTML = html;
      const images = element.getElementsByTagName("img");
      for (let i = 0; i < images.length; i++) {
        const source = images[i].src;

        fetch(source)
          .then(res => res.blob()) // Gets the response and returns it as a blob
          .then(blob => {
            const file = new File([blob], "image");
            if (file) {
              this.createImage(file);
            }
          })
          .catch(error => console.log(error));
      }

      //images.forEach(image => this.props.uploadImage(image.attr('src'), -1));
    }

    if (e.clipboardData.items && e.clipboardData.items[0]) {
      const file = e.clipboardData.items[0].getAsFile();
      if (file && file.type.startsWith("image")) {
        this.createImage(file);
      }
    }
  };

  createImage = async file => {
    let data = new FormData();
    data.append("data", file);

    const { id, url } = await this.props.uploadImage(data);
    this.addImage(url, id);
  };
  addImage = (src, id) =>
    this.props.createEntity("image", "IMMUTABLE", { src, id });

  handlePastedText = pastedText => {
    if (localStorage.getItem("draft/state")) {
      var { content, selection, text } = JSON.parse(
        localStorage.getItem("draft/state")
      );
      if (pastedText === text) {
        let state = EditorState.createWithContent(convertFromRaw(content));
        state = EditorState.forceSelection(
          state,
          new SelectionState(selection)
        );
        const blockMap = getFragmentFromSelection(state);

        const { editorState } = this.props;

        const newState = Modifier.replaceWithFragment(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          blockMap
        );
        this.props.onChange(
          EditorState.push(editorState, newState, "insert-fragment")
        );

        return "handled";
      } else {
        localStorage.removeItem("draft/state");
        return "not-handled";
      }
    } else {
      return "not-handled";
    }
  };

  handleDroppedFiles = (selection, files) => {
    files.forEach(file => this.createImage(file));
  };

  render() {
    return (
      <TextAreaContainer
        onClick={() => this.editorRef.focus()}
        onCopy={this.onCopy}
        onPaste={this.onPaste}
      >
        <Editor
          {...this.props}
          ref={ref => (this.editorRef = ref)}
          plugins={this.plugins}
          handleKeyCommand={this.handleKeyCommand}
          handleReturn={this.handleReturn}
          onTab={this.handleTab}
          readOnly={this.props.disableInput || !this.props.canEdit}
          handlePastedText={this.handlePastedText}
          handleDroppedFiles={this.handleDroppedFiles}
        />
      </TextAreaContainer>
    );
  }
}
export default CustomEditor;
