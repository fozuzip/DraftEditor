import React, { Component } from 'react';
import apiService from 'utils/api';
import './main.css';
import {
  EditorState,
  SelectionState,
  RichUtils,
  Modifier,
  AtomicBlockUtils,
  convertFromRaw,
  convertToRaw
} from 'draft-js';

import Lottie from 'react-lottie';
import animationData from 'assets/lottie/loader-check.json';

import Editor from './Editor';
import Toolbar from './Toolbar';
import Spinner from '../Spinner';

import { MainContainer } from './common';

import { adjustBlockDepth } from 'utils/indentation';
import debounce from 'lodash/debounce';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions = {
  loop: false,
  autoplay: false,
  animationData
};

class Main extends Component {
  constructor(props) {
    super(props);
    const editorState = this.props.initialContent
      ? EditorState.createWithContent(convertFromRaw(this.props.initialContent))
      : EditorState.createEmpty();

    this.state = {
      showButtons: false,
      editorState,
      isSaving: false,
      disableInput: false,
      showSaveButton: true,
      showLoadButton: false,
      initialStringContent: this.props.initialStringContent,
      isPaused: true,
      showLottie: false,
      bgColor: '#3c4858',
      lastSaveLoading: false
    };
  }

  componentDidMount() {
    this.autoSave();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.editorState !== this.state.editorState ||
      prevState.initialStringContent !== this.state.initialStringContent
    ) {
      if (
        this.state.initialStringContent !==
        JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
      ) {
        this.setState({ showButtons: true, showSaveButton: true });
      }
    }
  }

  autoSave = () => {
    setInterval(() => {
      if (!this.state.isSaving && !this.state.showLoadButton && this.state.showButtons)
        this.onSaveButtonClick();
    }, 20000);
  };

  toggleInlineStyle = type =>
    this.update(RichUtils.toggleInlineStyle(this.state.editorState, type));

  replaceInlineStyle = (oldType, newType) => {
    const stateWithoutStyle = RichUtils.toggleInlineStyle(this.state.editorState, oldType);
    this.update(RichUtils.toggleInlineStyle(stateWithoutStyle, newType));
  };

  toggleBlockType = (type, style) => {
    let state = this.state.editorState;

    if (style) {
      state = this.addBlockStyle(style, state);
    }

    state = RichUtils.toggleBlockType(state, type);

    if (type === 'code-block') {
      const rawState = convertToRaw(state.getCurrentContent());
      const blocks = rawState.blocks;
      const selection = state.getSelection();
      const currentBlockIndex = blocks.findIndex(block => block.key === selection.getStartKey());

      if (currentBlockIndex > 0) {
        const prevBlockType = blocks[currentBlockIndex - 1].type;

        if (prevBlockType === 'unordered-list-item' || prevBlockType === 'ordered-list-item') {
          blocks[currentBlockIndex].depth = blocks[currentBlockIndex - 1].depth + 1;

          const block = state.getCurrentContent().getBlockForKey(selection.getStartKey());
          const key = block.getKey();
          const length = block.getLength();
          const selectionState = new SelectionState({
            anchorKey: key,
            anchorOffset: length,
            focusKey: key,
            focusOffset: length,
          });

          state = EditorState.forceSelection(EditorState.createWithContent(convertFromRaw(rawState)), selectionState);
        }
      }
    }

    this.update(state);
  };

  setBlockStyle = style => {
    this.update(this.addBlockStyle(style, this.state.editorState));
  };

  addBlockStyle = (style, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const currentStyle = contentState
      .getBlockForKey(selection.getStartKey())
      .getData()
      .toObject();

    return EditorState.push(
      editorState,
      Modifier.setBlockData(contentState, selection, {
        ...currentStyle,
        ...style
      })
    );
  };

  indentSelection = type => {
    this.update(adjustBlockDepth(this.state.editorState, type === 'add' ? 1 : -1, 4));
  };

  undo = () => this.update(EditorState.undo(this.state.editorState));
  redo = () => this.update(EditorState.redo(this.state.editorState));

  createEntity = (type, immutability, data) => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(type, immutability, data);
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity },
      'create-entity'
    );
    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    });
  };

  createLink = url => {
    if (!url.includes('://')) url = 'http://' + url;

    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', {
      url
    });

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.push(editorState, contentStateWithEntity, 'create-entity');

    this.update(RichUtils.toggleLink(newEditorState, selection, entityKey));
  };

  editEntity = (key, newData) => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const edittedContent = contentState.mergeEntityData(key, newData);
    const newState = EditorState.push(editorState, edittedContent, 'apply-entity');
    this.update(EditorState.forceSelection(newState, newState.getSelection()), true);
  };

  removeEntity = key => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = contentState.getBlockForKey(selection.getStartKey());

    block.findEntityRanges(
      value => {
        return value.toObject().entity === key;
      },
      (start, end) => {
        const selection = new SelectionState({
          anchorKey: block.getKey(),
          anchorOffset: start,
          focusKey: block.getKey(),
          focusOffset: end,
          hasFocus: false,
          isBackward: false
        });

        const contentWithoutEntity = Modifier.applyEntity(contentState, selection, null);
        this.update(EditorState.push(editorState, contentWithoutEntity, 'apply-entity'));
      }
    );
  };

  createInternalLink = to => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const contentStateWithEntity = contentState.createEntity('INTERNAL-LINK', 'MUTABLE', { to });

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.push(editorState, contentStateWithEntity, 'create-entity');

    this.update(RichUtils.toggleLink(newEditorState, selection, entityKey));
  };

  getHeaderBlocks = () => {
    const contentState = this.state.editorState.getCurrentContent();

    return this.state.editorState
      .getCurrentContent()
      .getBlockMap()
      .toArray()
      .filter(block => block.getType().startsWith('header'))
      .map(block => ({
        key: block.getKey(),
        content: contentState.getBlockForKey(block.getKey()).getText()
      }))
      .filter(block => block.content.length >= 1);
  };

  onSaveButtonClick = async () => {
    this.setState({ isSaving: true, showLottie: true, isPaused: false });
    this.btnSave.anim.playSegments([0, 92], true);
    try {
      this.btnSave.anim.playSegments([0, 92], false);
      const checkResponse = await apiService.get('/notes/');
      this.btnSave.anim.playSegments([0, 92], false);
      if (checkResponse.data.body !== this.state.initialStringContent) {
        return this.setState({
          showLoadButton: true,
          isSaving: false,
          showSaveButton: false,
          showLottie: false,
          isPaused: true
        });
      } else {
        await apiService.put('/notes/', {
          body: convertToRaw(this.state.editorState.getCurrentContent())
        });

        this.btnSave.anim.playSegments([95, 171], true);
        this.setState({
          initialStringContent: JSON.stringify(
            convertToRaw(this.state.editorState.getCurrentContent())
          ),
          bgColor: '#7ED321'
        });
        setTimeout(() => {
          this.setState({
            showLottie: false,
            isPaused: true,
            isSaving: false,
            bgColor: '#3c4858',
            showButtons: false
          });
        }, 1500);
      }
    } catch (error) {
      this.setState({
        isSaving: false,
        showLottie: false,
        isPaused: true,
        showLoadButton: true
      });
    }
  };

  onChange = editorState => [this.setState({ editorState })];

  update = (editorState, forceSave = false) => {
    this.setState({ editorState })
  };

  toggleDisableInput = status =>
    this.setState(prev => ({
      disableInput: status
    }));

  isSelectionEmpty = () => {
    const selection = this.state.editorState.getSelection();
    return (
      selection.getStartKey() === selection.getEndKey() &&
      selection.getStartOffset() === selection.getEndOffset()
    );
  };

  loadLastSave = cb => {
    this.setState({ lastSaveLoading: true });
    apiService.get('/notes/').then(async res => {
      let rawState = res.data.body && res.data.body !== '' ? JSON.parse(res.data.body) : null;
      if (rawState) rawState = await this.props.updateImageUrls(rawState, res.data.integration_id);
      const editorState = rawState
        ? EditorState.createWithContent(convertFromRaw(rawState))
        : EditorState.createEmpty();
      this.setState({
        isSaving: false,
        editorState,
        showLoadButton: false,
        initialStringContent: res.data.body,
        lastSaveLoading: false,
        showButtons: false
      });
    });
  };

  render() {
    const {
      showSaveButton,
      showLoadButton,
      isPaused,
      showLottie,
      showButtons,
      bgColor,
      lastSaveLoading
    } = this.state;
    return (
      <MainContainer>
        {showButtons ? (
          <>
            {showSaveButton && (
              <div
                onClick={this.onSaveButtonClick}
                style={{
                  backgroundColor: bgColor,
                  padding: showLottie ? '6.5px 15.5px' : '7.5px 34.5px'
                }}
                className="button"
              >
                <Lottie
                  options={defaultOptions}
                  ref={ref => (this.btnSave = ref)}
                  height={showLottie ? 20 : 0}
                  eventListeners={this.eventListeners}
                  width={showLottie ? 20 : 0}
                  style={{ marginRight: showLottie ? 7.92 : 0 }}
                  isPaused={isPaused}
                />
                <span className="button-text">
                  {showLottie && bgColor === '#3c4858'
                    ? 'Saving'
                    : bgColor === '#7ED321'
                    ? 'Saved'
                    : 'Save'}
                </span>
              </div>
            )}
            {showLoadButton && (
              <div onClick={this.loadLastSave} className="button-discard">
                <span className="discard-text">{'Discard & Update'}</span>
              </div>
            )}
          </>
        ) : null}

        <div style={{ display: 'flex' }}>
          <Spinner size={16} show={lastSaveLoading} />
          <Toolbar
            editorState={this.state.editorState}
            toggleInlineStyle={this.toggleInlineStyle}
            replaceInlineStyle={this.replaceInlineStyle}
            toggleBlockType={this.toggleBlockType}
            setBlockStyle={this.setBlockStyle}
            indentSelection={this.indentSelection}
            undo={this.undo}
            redo={this.redo}
            canEdit={this.props.canEdit}
            insertCheckbox={this.insertCheckbox}
            uploadImage={this.props.uploadImage}
            createEntity={this.createEntity}
            editEntity={this.editEntity}
            removeEntity={this.removeEntity}
            createLink={this.createLink}
            createInternalLink={this.createInternalLink}
            headerBlocks={this.getHeaderBlocks()}
            isSelectionEmpty={this.isSelectionEmpty()}
            createTable={this.createTable}
            onChange={this.update}
          />
        </div>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          indentSelection={this.indentSelection}
          disableInput={this.state.disableInput}
          toggleDisableInput={this.toggleDisableInput}
          toggleInlineStyle={this.toggleInlineStyle}
          update={this.update}
          canEdit={this.props.canEdit}
          uploadImage={this.props.uploadImage}
          createEntity={this.createEntity}
        />
      </MainContainer>
    );
  }
}
export default Main;
