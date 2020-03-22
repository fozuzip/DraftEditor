import React, { Component } from 'react';
import AutoTextarea from 'react-autosize-textarea';
import styled from 'styled-components';
import ReactSVG from 'react-svg';
import onClickOutside from 'react-onclickoutside';

class Block extends Component {
  state = { editing: [null, null] };

  get = this.props.blockProps.get;
  set = cb => {
    const data = this.props.blockProps.get();
    this.props.blockProps.set(cb(data));
  };
  toggle = status => {
    this.props.blockProps.toggleDisableInput(status);
  };

  onClick = fn => e => {
    e.preventDefault();
    fn();
  };

  addRow = index => () => {
    this.set(prev => ({
      ...prev,
      cells: [
        ...prev.cells.slice(0, index + 1),
        prev.headers.map(_ => ' '),
        ...prev.cells.slice(index + 1)
      ]
    }));
  };

  deleteRow = index => () => {
    this.set(prev => ({
      ...prev,
      cells: [...prev.cells.slice(0, index), ...prev.cells.slice(index + 1)]
    }));
  };

  addCol = index => () =>
    this.set(prev => ({
      headers: [...prev.headers.slice(0, index + 1), ' ', ...prev.headers.slice(index + 1)],
      cells: prev.cells.map(row => [...row.slice(0, index + 1), ' ', ...row.slice(index + 1)])
    }));
  removeCol = index => () =>
    this.set(prev => ({
      headers: [...prev.headers.slice(0, index), ...prev.headers.slice(index + 1)],
      cells: prev.cells.map(row => [...row.slice(0, index), ...row.slice(index + 1)])
    }));

  editHeader = index => e => {
    e.preventDefault();
    this.set(prev => ({
      ...prev,
      headers: prev.headers.map((h, i) => (i === index ? e.target.value : h))
    }));
  };
  editCell = (rIndex, cIndex) => e => {
    e.preventDefault();
    this.set(prev => ({
      ...prev,
      cells: prev.cells.map((row, rI) =>
        rI === rIndex ? row.map((cell, cI) => (cI === cIndex ? e.target.value : cell)) : row
      )
    }));
  };
  setHeaderEditing = index => {
    this.setEditing(-1, index);
    setTimeout(() => {
      const el = document.getElementById(`header-${index}-${this.props.blockProps.id}`);
      if (el) el.focus();
    }, 100);
  };
  setEditing = (rIndex, cIndex) => {
    this.setState({ editing: [rIndex, cIndex] });
    setTimeout(() => {
      const el = document.getElementById(`cell-${rIndex}-${cIndex}`);
      if (el) el.focus();
    }, 100);
  };
  isHeaderEdit = index => this.isEdit(-1, index);
  isEdit = (rIndex, cIndex) => this.state.editing[0] === rIndex && this.state.editing[1] === cIndex;

  handleClickOutside = e => {
    //e.preventDefault();
    if (this.state.editing[0] !== null) {
      this.setState({ editing: [null, null] });
      this.toggle(false);
    }
  };

  setControls = (target, value) =>
    this.setState(prev => ({
      controls: {
        ...prev.controls,
        [target]: value
      }
    }));

  delete = () => {
    this.props.blockProps.toggleDisableInput(false);
    this.props.blockProps.delete();
  };

  render() {
    const data = this.get();
    return data.headers ? (
      <div style={{ marginRight: 16 }}>
        <Table>
          <tbody>
            <tr>
              <th align={'center'}>
                <div onMouseDown={this.onClick(this.delete)}>
                  {this.state.editing[0] !== null && this.state.editing[1] !== null && (
                    <ReactSVG
                      src={require('assets/close.svg')}
                      svgStyle={{ height: 8, width: 8, cursor: 'pointer' }}
                      onMouseDown={this.onClick(this.delete)}
                    />
                  )}
                </div>
              </th>
              {data.headers.map((_, i) => (
                <th contentEditable={false} align={'center'} style={{ height: 32 }}>
                  <Controls
                    show={this.state.editing[1] === i}
                    alignment="horizontal"
                    onAdd={this.onClick(this.addCol(i))}
                    onDelete={data.headers.size > 1 && this.onClick(this.removeCol(i))}
                  />
                </th>
              ))}
            </tr>
            <tr>
              <th align={'center'} width="16">
                <Controls
                  show={this.state.editing[0] === -1}
                  alignment="vertical"
                  onAdd={this.onClick(this.addRow(-1))}
                />
              </th>
              {data.headers.map((h, i) => (
                <Th
                  key={i}
                  onMouseDown={this.onClick(() => this.setHeaderEditing(i))}
                  isEditing={this.isHeaderEdit(i)}
                >
                  {this.isHeaderEdit(i) ? (
                    <Textarea
                      bold
                      id={`header-${i}-${this.props.blockProps.id}`}
                      onMouseDown={this.onClick(() =>
                        document.getElementById(`header-${i}-${this.props.blockProps.id}`).focus()
                      )}
                      value={h}
                      onChange={this.editHeader(i)}
                      onFocus={() => this.toggle(true)}
                      onBlur={() => this.toggle(false)}
                    />
                  ) : (
                    <div id={`header-${i}-${this.props.blockProps.id}`}>{h}</div>
                  )}
                </Th>
              ))}
            </tr>
            {data.cells.map((row, rIndex) => (
              <tr key={rIndex}>
                <td align={'center'} style={{ height: 32 }}>
                  <Controls
                    show={this.state.editing[0] === rIndex}
                    alignment="vertical"
                    onAdd={this.onClick(this.addRow(rIndex))}
                    onDelete={this.onClick(this.deleteRow(rIndex))}
                  />
                </td>
                {row.map((cell, cIndex) => (
                  <Td
                    key={cIndex}
                    onMouseDown={this.onClick(() => this.setEditing(rIndex, cIndex))}
                    isEditing={this.isEdit(rIndex, cIndex)}
                  >
                    {this.isEdit(rIndex, cIndex) ? (
                      <Textarea
                        id={`cell-${rIndex}-${cIndex}`}
                        onMouseDown={this.onClick(() =>
                          document.getElementById(`cell-${rIndex}-${cIndex}`).focus()
                        )}
                        value={cell}
                        onChange={this.editCell(rIndex, cIndex)}
                        onFocus={() => this.toggle(true)}
                        onBlur={() => this.toggle(false)}
                      />
                    ) : (
                      cell
                    )}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ) : null;
  }
}
export default onClickOutside(Block);

const Controls = ({ show, alignment, onAdd, onDelete }) => (
  <ControlsWrapper alignment={alignment}>
    {show && onAdd && (
      <ReactSVG
        src={require('assets/add.svg')}
        svgStyle={{ height: 8, width: 8, cursor: 'pointer' }}
        onMouseDown={onAdd}
      />
    )}
    {show && onDelete && (
      <ReactSVG
        onMouseDown={onDelete}
        src={require('assets/delete.svg')}
        svgStyle={{
          height: 8,
          width: 8,
          marginTop: alignment === 'horizontal' ? 0 : 8,
          marginLeft: alignment === 'horizontal' ? 8 : 0,
          cursor: 'pointer'
        }}
      />
    )}
  </ControlsWrapper>
);

const ControlsWrapper = styled.div`
  width: 16px;
  height: 100%;
  display: flex;
  flex-direction: ${({ alignment }) => (alignment === 'horizontal' ? 'row' : 'column')};
  align-items: center;
  justify-content: center;
`;

const Table = styled.table`
  min-width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`;

const Td = styled.td`
  text-align: center;
  border: 1px ${({ isEditing }) => (isEditing ? 'double #F2DD86' : 'solid #e0e6ed')};
  height: 40px;
  padding: 8px 16px;
  max-width: 120px;
  min-width: 80px;

  z-index: ${({ isEditing }) => (isEditing ? 20 : 10)};
`;
const Th = styled.th`
  text-align: center;
  border: 1px ${({ isEditing }) => (isEditing ? 'double #F2DD86' : 'solid #e0e6ed')};
  height: 40px;
  padding: 8px 16px;
  max-width: 120px;
  min-width: 80px;
  z-index: ${({ isEditing }) => (isEditing ? 20 : 10)};
`;

const Textarea = styled(AutoTextarea)`
  font-weight: ${({ bold }) => (bold ? '600' : '300')}
  border: none;
  overflow: auto;
  outline: none;
  resize: none;
  width: 80px;
  text-align: center;
`;
