/** @jsx React.DOM */
var React = require('react'),
    _ = require('underscore');

var MeasurementsRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td>{this.props.id}</td>
                <td>{this.props.value}</td>
            </tr>
        );
    }
});

var MeasurementsTable = React.createClass({
    render: function() {
        var rows = [];
        var predictedMeasurements = this.props.measurements;

        _(this.props.measurements).map(function (measurementsValue, key) {
          rows.push(<MeasurementsRow id={key} value={measurementsValue} key={key} />);
        });
        
        return (
          <div className='measurements-output'>
            <table>
                <thead>
                    <tr>
                        <th>MeasurementId</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
          </div>
        );
    }
});


// Weight -- lbs, others -- inch
var MeasurementInput = React.createClass({
    handleChange: function (event) {
        this.props.onUserInput(
            this.props.measurement.id,
            event.target.value
        );
    },
    render: function () {
        return (
          <p>
            <input
              type="number"
              placeholder={this.props.measurement.id}
              onChange={this.handleChange}/>
          </p>
        );
    }
});

var MeasurementsErrorsPrompt = React.createClass({
  render: function () {
    if (!this.props.status) {
      return null;
    }

    return (
      <p> 
        &nbsp; Errors Detected! 
        <span> Status: {this.props.status} </span>
        <span> Error: {this.props.text} </span> 
      </p>
    );
  }
});

var MeasurementInputForm = React.createClass({
    getInitialState: function () {
      return {
          inputMeasurements: {},
      };
    },
    constructPayload: function () {
      var size = this.refs.baseBodySize.getDOMNode().value;

      payload = {
            gender: this.refs.radioMale.getDOMNode().checked ? 'male' : 'female',
            unitSystem: this.refs.radioUnitsUS.getDOMNode().checked ? 'unitedStates' : 'metric',
            scheme: 'flexible',
            measurements: this.state.inputMeasurements,
            generation: '1'
      };

      if (size) {
        payload.size = size;
      }
      return payload;
    },
    handleUserInput: function (measurementsId, measurementsValue) {
      var inputMeasurements = this.state.inputMeasurements;

      //add new value to input_measurements state
      if (measurementsId) {

        if(!measurementsValue){
          delete inputMeasurements[measurementsId];
        } else {
            inputMeasurements[measurementsId] = parseFloat(measurementsValue);
        }
        this.setState({inputMeasurements: inputMeasurements});
      }
    },
    handleGetMeshClick: function (event) {
      this.props.onMeshRequest(this.constructPayload());
    },
    handleGetMeasurementsClick: function (event) {
      this.props.onMeasurementsRequest(this.constructPayload());
    },
    render: function () {
      return (
        <div className='measurements-input'>
            <h3>Enter Your Measurements</h3>
            <div>
              <input type="radio" name="gender" value="male" ref='radioMale' defaultChecked={true}/>male &nbsp;
              <input type="radio" name="gender" value="female"/>female
            </div>

             <div>
              <input type="radio" name="unitSystem" value="unitedStates" ref='radioUnitsUS' defaultChecked={true}/>US (in, lb) &nbsp;
              <input type="radio" name="unitSystem" value="metric"/>metric (cm, kg)
            </div>

                {
                    _(this.props.presetMeasurements).map(function (item) {
                        return ( 
                              <div key={item.id + '-div'}>
                                  <MeasurementInput measurement={item} 
                                               key={item.id}
                                               onUserInput={this.handleUserInput}/>
                              </div>);
                    }, this)
                }

            <p>
              <input
                type="text"
                placeholder="size"
                ref="baseBodySize"/>
            </p>
            <p>
              <input type="button" value="Get Measurements" onClick={this.handleGetMeasurementsClick} />
            </p>
            <p>
              <input type="button" value="Download Mesh" onClick={this.handleGetMeshClick} />
            </p>
        </div>
      );
    }
});

module.exports = {
  MeasurementInputForm: MeasurementInputForm,
  MeasurementOutputTable: MeasurementsTable,
  MeasurementsErrorsPrompt: MeasurementsErrorsPrompt,
};