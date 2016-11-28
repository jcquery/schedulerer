/* eslint-disable react/jsx-no-bind */

import EventBlock from './EventBlock';
import React from 'react';
import moment from 'moment';

class DaySchedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blocked: {},
      dragging: false,
      draggedEvent: {},
      draggable: false,
      resizeEvent: {},
      resizeMax: 0,
      resizeSize: {},
      resizeY: 0
    };

    // bind resize handlers so we can attach and detach their listeners from the
    // window
    this.resize = this.resize.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  // sets initial position to current hour, maybe should have a guard clause
  // to only work for the current day?
  componentDidMount() {
    const current = moment().format('ha');
    const container = this.dayContainer;
    const scrollTarget = document.getElementById(current);

    container.scrollTop = scrollTarget.offsetTop;
  }
  setDrag(bool) {
    this.setState({ draggable: bool });
  }

  // when drag-to-move starts, make an object of blocked times for the dragover
  // handler to check for validity. blocked times start ahead of existing events
  // by the length of the currently dragged event.
  startDrag(event) {
    const blocked = {};

    this.props.events.forEach((ev) => {
      if (ev.id === event.event.id) {
        return;
      }
      const start = moment(ev.startTime).subtract(event.height - 0.5, 'hours');
      const end = moment(ev.endTime);

      blocked[start.toISOString()] = true;

      while (!(end.diff(start, 'hours', true) <= 0.5)) {
        start.add(0.5, 'hours');
        blocked[start.toISOString()] = true;
      }
    });
    this.setState({ blocked, dragging: true, draggedEvent: event });
  }
  stopDrag() {
    this.setState({
      blocked: {},
      dragging: false,
      draggedEvent: {},
      draggable: false
    });
  }

  // check the blocked object to make sure the space below is valid.
  handleDragOver(e) {
    if (e.target.tagName !== 'DIV') {
      return true;
    }
    if (this.state.blocked[e.target.getAttribute('data-date')]) {
      return true;
    }
    e.preventDefault();
  }
  handleDrop(e) {
    const newEvent = Object.assign({}, this.state.draggedEvent.event);
    const height = this.state.draggedEvent.height;

    newEvent.startTime = e.currentTarget.getAttribute('data-date');
    newEvent.endTime = moment(newEvent.startTime).add(
      height,
      'hours'
    ).toISOString();

    this.props.onEventUpdate(newEvent);
    this.stopDrag();
  }

  // when we start resizing, figure out a max by either the distance from the
  // closest event or the end of the day, then add the mousemove and mouseup
  // listeners to track the resize and end it.
  startResize(e, eventData, size) {
    const id = eventData.id;
    const newSize = {};
    const end = moment(eventData.endTime);
    const currentDate = moment(this.props.date).format('MMM D');

    let max = this.props.events.reduce((closest, event) => {
      if (moment(event.startTime).format('MMM D') !== currentDate) {
        return closest;
      }
      const diff = -end.diff(event.startTime, 'hours', true);

      if (
        (diff === 0 || Math.sign(diff) === 1) &&
        event.id !== id &&
        diff < closest
      ) {
        return diff;
      }

      return closest;
    }, 50);

    if (max === 50) {
      max = moment(this.props.date).add(1, 'day').diff(end, 'hours', true);
    }
    newSize[id] = size;
    this.setState({
      resizeEvent: eventData,
      resizeMax: size + max,
      resizeSize: newSize,
      resizeY: e.clientY
    });
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.resize);
  }

  // track the mouse's y position relative to the recorded position (initially,
  // the resize button) and update the size of the event accordingly. when
  // updating the event size, update the recorded y.
  resize(e) {
    e.preventDefault();
    const id = this.state.resizeEvent.id;

    if (e.clientY - this.state.resizeY > 30) {
      const newMod = Math.round((e.clientY - this.state.resizeY) / 30) / 2;
      const newSize = Object.assign({}, this.state.resizeSize);

      newSize[id] += newMod;
      if (newSize[id] > this.state.resizeMax) {
        return;
      }
      this.setState({ resizeY: e.clientY, resizeSize: newSize });
    }
    else if (this.state.resizeY - e.clientY > 30) {
      const newMod = Math.round((this.state.resizeY - e.clientY) / 30) / 2;
      const newSize = Object.assign({}, this.state.resizeSize);

      newSize[id] -= newMod;
      if (newSize[id] < 0.5) {
        return;
      }
      this.setState({ resizeY: e.clientY, resizeSize: newSize });
    }
  }

  // update the event and remove the listeners.
  handleMouseUp() {
    const newEvent = Object.assign({}, this.state.resizeEvent);
    const height = this.state.resizeSize[this.state.resizeEvent.id];

    newEvent.endTime = moment(newEvent.startTime).add(
      height,
      'hours'
    ).toISOString();
    this.props.onEventUpdate(newEvent);

    this.setState({
      resizeEvent: {},
      resizeMax: 0,
      resizeSize: {},
      resizeY: 0
    });
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    // parent container
    const daycontainerStyle = {
      boxSizing: 'border-box',
      border: '2px solid black',
      borderRadius: '7px',
      height: '40rem',
      width: '25rem',
      marginLeft: '2rem',
      overflow: 'auto'
    };

    // an extra container to hide events going beyond the end of the day
    const groupcontainerStyle = {
      width: '100%',
      maxHeight: '96rem',
      overflow: 'hidden'
    };

    // hour block container
    const blockgroupStyle = {
      boxSizing: 'border-box',
      width: '100%',
      height: '4rem',
      position: 'relative',
      display: 'flex'
    };

    // hour block label
    const asideStyle = {
      boxSizing: 'border-box',
      paddingTop: '6%',
      height: '100%',
      width: '20%',
      flexAlign: 'left',
      border: '1px solid black',
      textAlign: 'center'
    };

    // half-hour block container
    const timeblockStyle = {
      boxSizing: 'border-box',
      width: '80%',
      height: '100%',
      flexAlign: 'left'
    };

    // half-hour block split for border reasons
    const halfblockStyleTop = {
      boxSizing: 'border-box',
      width: '100%',
      height: '50%',
      borderTop: '1px solid black',
      position: 'relative'
    };

    const halfblockStyleBot = {
      boxSizing: 'border-box',
      width: '100%',
      height: '50%',
      borderTop: '0.5px dashed black',
      borderBottom: '1px solid black',
      position: 'relative'
    };

    const currentDate = moment(this.props.date).format('MMM D');
    const events = {};

    // get events for the day and put them in an object so we only do one
    // loop
    this.props.events.forEach((event) => {
      if (moment(event.startTime).format('MMM D') === currentDate) {
        events[moment(event.startTime).format('h:mma')] = event;
      }
    });

    return <section
      className="daycontainer"
      onClick={this.handleClick}
      ref={(dayC) => { this.dayContainer = dayC; }}
      style={daycontainerStyle}
    >
      <section
        className="groupcontainer"
        style={groupcontainerStyle}
      >
        {this.props.timeArray.map((element, index) => {
          let topEvent = null;
          let botEvent = null;

          // while mapping the array of times, check if there are events for
          // either the hour or half hour blocks.
          if (events[`${element.time}:00${element.suf}`]) {
            const curEvent = events[`${element.time}:00${element.suf}`];
            const heightMod = moment(curEvent.endTime).diff(
              moment(curEvent.startTime),
              'hours',
              true
            );

            topEvent = <EventBlock
              curEvent={curEvent}
              draggable={this.state.draggable}
              dragging={this.state.dragging}
              heightMod={heightMod}
              resizeSize={this.state.resizeSize}
              setDrag={this.setDrag.bind(this)}
              startDrag={this.startDrag.bind(this)}
              startResize={this.startResize.bind(this)}
              stopDrag={this.stopDrag.bind(this)}
            />;
          }
          if (events[`${element.time}:30${element.suf}`]) {
            const curEvent = events[`${element.time}:30${element.suf}`];
            const heightMod = moment(curEvent.endTime).diff(
              moment(curEvent.startTime),
              'hours',
              true
            );

            botEvent = <EventBlock
              curEvent={curEvent}
              draggable={this.state.draggable}
              dragging={this.state.dragging}
              heightMod={heightMod}
              resizeSize={this.state.resizeSize}
              setDrag={this.setDrag.bind(this)}
              startDrag={this.startDrag.bind(this)}
              startResize={this.startResize.bind(this)}
              stopDrag={this.stopDrag.bind(this)}
            />;
          }

          return <section
            className="blockgroup"
            id={`${element.time}${element.suf}`}
            key={index}
            style={blockgroupStyle}
          >
            <aside style={asideStyle}>
              {`${element.time} ${element.suf}`}
            </aside>
            <section className="timeblock" style={timeblockStyle}>
              <div
                data-date={moment(
                  `${currentDate} ${element.time}:00${element.suf}`,
                  'MMM D h:mma'
                ).toISOString()}
                onDragOver={this.handleDragOver.bind(this)}
                onDrop={this.handleDrop.bind(this)}
                style={halfblockStyleTop}
              >
                {topEvent}
              </div>
              <div
                data-date={moment(
                  `${currentDate} ${element.time}:30${element.suf}`,
                  'MMM D h:mma'
                ).toISOString()}
                onDragOver={this.handleDragOver.bind(this)}
                onDrop={this.handleDrop.bind(this)}
                style={halfblockStyleBot}
              >
                {botEvent}
              </div>
            </section>
          </section>;
        })}
      </section>
    </section>;
  }
}

// is this es6? i think this is es6. i also think there are probably better
// ways to make a list of times.
DaySchedule.defaultProps = {
  timeArray: [
    { time: 12, suf: 'am' },
    { time: 1, suf: 'am' },
    { time: 2, suf: 'am' },
    { time: 3, suf: 'am' },
    { time: 4, suf: 'am' },
    { time: 5, suf: 'am' },
    { time: 6, suf: 'am' },
    { time: 7, suf: 'am' },
    { time: 8, suf: 'am' },
    { time: 9, suf: 'am' },
    { time: 10, suf: 'am' },
    { time: 11, suf: 'am' },
    { time: 12, suf: 'pm' },
    { time: 1, suf: 'pm' },
    { time: 2, suf: 'pm' },
    { time: 3, suf: 'pm' },
    { time: 4, suf: 'pm' },
    { time: 5, suf: 'pm' },
    { time: 6, suf: 'pm' },
    { time: 7, suf: 'pm' },
    { time: 8, suf: 'pm' },
    { time: 9, suf: 'pm' },
    { time: 10, suf: 'pm' },
    { time: 11, suf: 'pm' }
  ]
};

export default DaySchedule;
