import DaySchedule from './DaySchedule';
import React from 'react';

class DayScheduleContainer extends React.Component {
  constructor(props) {
    super(props);

    const date = '2016-11-14T08:00:00Z';
    const initialEventData = [
      {
        id: 1,
        startTime: '2016-11-14T16:00:00Z',
        endTime: '2016-11-14T18:00:00Z',
        description: 'Morning Event',
        color: '#2ecc71'
      }, {
        id: 2,
        startTime: '2016-11-14T20:00:00Z',
        endTime: '2016-11-14T23:00:00Z',
        description: 'Afternoon Event',
        color: '#f0cf5f'
      }, {
        id: 3,
        startTime: '2016-11-15T06:00:00Z',
        endTime: '2016-11-15T10:00:00Z',
        description: 'Evening Event',
        color: '#e67e22'
      }, {
        id: 4,
        startTime: '2016-11-15T16:00:00Z',
        endTime: '2016-11-15T18:00:00Z',
        description: 'Next Day Event',
        color: '#e74c3c'
      }
    ];

    this.state = {
      date,
      events: initialEventData
    };
  }

  handleEventUpdate(event) {
    const newEvents = this.state.events.map((element) => {
      if (element.id === event.id) {
        return event;
      }

      return element;
    });

    this.setState({ events: newEvents });
  }

  render() {
    const {
      date,
      events
    } = this.state;

    return (
      <DaySchedule
        date={date}
        events={events}
        onEventUpdate={this.handleEventUpdate.bind(this)}
      />
    );
  }
}

export default DayScheduleContainer;
