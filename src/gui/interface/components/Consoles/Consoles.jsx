import React from 'react';
import { connect } from 'react-redux';

import mapValues from 'lodash/mapValues';
import values from 'lodash/values';

import { fetchConsoles } from '../../actions/consoles.actions';

class Consoles extends React.Component {

  componentDidMount() {
    this.props.fetchConsoles();
  }

  render() {
    const {
      consoles = {},
      loading,
    } = this.props;

    if (loading) {
      return (
        <div>LOADING</div>
      );
    }

    return (
      <div>
        {
          values(mapValues(consoles, (console, key) => (
            <div key={key}>{console.name}</div>
          )))
        }
      </div>
    );
  }
}

export default connect(
  state => ({
    consoles: state.consoles.consoles,
    loading: state.consoles.loading,
  }),
  { fetchConsoles },
)(Consoles);
