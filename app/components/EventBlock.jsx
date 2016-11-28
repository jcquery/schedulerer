/* eslint-disable react/jsx-no-bind */

import React from 'react';
import moment from 'moment';

class EventBlock extends React.Component {
  // instead of really using datatransfer on the drag event, we're using react.
  // datatransfer is solely used to trigger the dragend event.
  handleDragStart(e) {
    const eventData = {
      event: this.props.curEvent,
      height: this.props.heightMod
    };

    e.dataTransfer.setData('text/plain', '');
    this.props.startDrag(eventData);
  }
  handleDragEnd() {
    this.props.stopDrag();
  }
  handleMouseDown() {
    this.props.setDrag(true);
  }
  handleMouseUp() {
    this.props.setDrag(false);
  }
  handleResize(e) {
    this.props.startResize(e, this.props.curEvent, this.props.heightMod);
  }

  render() {
    // adjust z-index to allow for placing events on divs they're covering.
    const zIndex = this.props.dragging ? 0 : 11;
    const opacity = this.props.dragging ? 0.5 : 0.7;

    // if an event is being resized, use its updated size; otherwise, use
    // its duration.
    const resizing = this.props.resizeSize[this.props.curEvent.id];

    const eventStyle = {
      position: 'absolute',
      top: '-1px',
      left: 0,
      width: '100%',
      height: `${4 * (resizing || this.props.heightMod)}rem`,
      color: 'white',
      backgroundColor: this.props.curEvent.color,
      zIndex,
      opacity
    };
    const headerStyle = {
      display: 'inline-block',
      width: '50%',
      margin: '0rem 0 0 0.3rem',
      position: 'absolute',
      textShadow: '0px 0px 4px black'
    };
    const timeStyle = {
      margin: '1.2rem 0 0 0.3rem',
      fontSize: '0.75rem',
      textShadow: '0px 0px 4px black'
    };
    const movebuttonStyle = {
      fontSize: '1.6rem',
      float: 'right',
      border: '4px solid black',
      borderRadius: '10%',
      width: '1.5rem',
      height: '1.5rem',
      textAlign: 'center',
      color: 'black',
      cursor: 'move'
    };
    const resizeButtonStyle = {
      position: 'absolute',
      bottom: '0rem',
      fontSize: '1.75rem',
      width: '10%',
      margin: '0 45% 0 45%',
      textAlign: 'center',
      cursor: 'ns-resize',
      textShadow: '0px 0px 3px black'
    };

    return <article
      draggable={this.props.draggable}
      onDragEnd={this.handleDragEnd.bind(this)}
      onDragStart={this.handleDragStart.bind(this)}
      style={eventStyle}
    >
      <h3
        style={headerStyle}
      >
        {this.props.curEvent.description}
      </h3>
      <span
        className="movebutton"
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
        style={movebuttonStyle}
      >
        ↕
      </span>
      <span
        onMouseDown={this.handleResize.bind(this)}
        style={resizeButtonStyle}
      >
        ↧
      </span>
      <h5 style={timeStyle}>
        {`${moment(this.props.curEvent.startTime).format('h:mma')} -
        ${moment(this.props.curEvent.endTime).format('h:mma')}`}
      </h5>
    </article>;
  }
}

export default EventBlock;
