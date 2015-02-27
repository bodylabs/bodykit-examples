/** @jsx React.DOM */
var React = require('react/addons'),
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

    propTypes: {
      widgetOptions: React.PropTypes.object,
      handleHeatMapsRequest: React.PropTypes.func,
    },

    getDefaultProps: function () {

        var component = this;

        //Provide a set of default options for simplicity
        var attrs = {
            genderOptions: ['female', 'male'],
            defaultGender: 'male',
        };

        return {
          widgetOptions: attrs,
        };
    },

    getInitialState: function () {
      return {
          inputMeasurements: {},
          heatMapInputMeasurements: {},
          showWidget: false,
          widgetInitialized: false,
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

    constructHeatMapPayload: function (bodyOne, bodyTwo) {

      return { 
        bodies: [bodyOne, bodyTwo],
        generation: '1.0',
      };
    },

    handleHeatMapModalToggle: function () {

      if(!this.state.widgetInitialized) {
          this._initializeWidget();
      }
      this.setState({
        showWidget: !this.state.showWidget,
      });
    },

    _initializeWidget: function () {
        var component = this;
        var bodylabsWidget = document.getElementById('bodylabsWidget');

        if (bodylabsWidget) {
          var widgetOptions = component.props.widgetOptions;

          widgetOptions.action = {
                    label: 'Get HeatMap',
                    callback: function (info) {
                      var measurements = info.measurements,
                          gender = info.gender,
                          size = info.size,
                          unitSystem=component.refs.radioUnitsUS.getDOMNode().checked ? 'unitedStates' : 'metric';

                      var bodyOne = component.constructPayload();

                      var bodyTwo = {
                        gender: gender,
                        size: size,
                        unitSystem: unitSystem,
                        measurements: measurements[unitSystem],
                        scheme: 'standard',
                      };

                      var heatMapPayload = component.constructHeatMapPayload(bodyOne, bodyTwo);

                      component.props.handleHeatMapsRequest(heatMapPayload);
                    },
          };
          window.BodyKit.bootstrapWidget(bodylabsWidget, widgetOptions);
          
          this.setState({widgetInitialized: true});
        }
        
    },

    _addMeasurements: function (measurementsId, measurementsValue, oldMeasurements) {
      var newMeasurements = oldMeasurements;
      
      if (measurementsId) {
        if(!measurementsValue){
            delete newMeasurements[measurementsId];
        } else {
            newMeasurements[measurementsId] = parseFloat(measurementsValue);
        }
      }

      return newMeasurements;
    },

    handleUserInput: function (measurementsId, measurementsValue) {
      var inputMeasurements = this.state.inputMeasurements;

      //add new value to input_measurements state
      this.setState({inputMeasurements: this._addMeasurements(measurementsId, measurementsValue, inputMeasurements)});
    },

    handleHeatmapUserInput: function (measurementsId, measurementsValue) {
      var inputMeasurements = this.state.heatMapInputMeasurements;
      this.setState({heatMapInputMeasurements: this._addMeasurements(measurementsId, measurementsValue, inputMeasurements)});
    },

    handleGetMeshClick: function (event) {
      this.props.onMeshRequest(this.constructPayload());
    },
    handleGetMeasurementsClick: function (event) {
      this.props.onMeasurementsRequest(this.constructPayload());
    },
    handleDownloadHeatmapClick: function (event) {
      this.props.handleHeatMapsRequest(this.constructHeatMapPayload());
    },

    renderWidget: function () {

      var component = this;

      var widgetContainerClasses = React.addons.classSet({
            'widget-container': true,
            'hidden': !component.state.showWidget,
      });

      return (
        <div className={widgetContainerClasses}>
          <h3> HeatMap Comparison </h3>
          <div id="bodylabsWidget"/>
        </div>
      );
    },

    render: function () {

      var component = this;

      var widget = component.renderWidget();

      var heatMapButtonValue = this.state.showWidget ? "Close Widget <<": "Get HeatMap >>";

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
                                               onUserInput={component.handleUserInput}/>
                              </div>);
                    })
                }

            <p>
              <input
                type="text"
                placeholder="size"
                ref="baseBodySize"/>
            </p>

            <div className='action_buttons_container'>
              <p>
                <input type="button" value="Get Measurements" onClick={this.handleGetMeasurementsClick} />
              </p>
              <p>
                <input type="button" value="Download Mesh" onClick={this.handleGetMeshClick} />
              </p>
              <p>
                <input type="button" value={heatMapButtonValue} onClick={this.handleHeatMapModalToggle} />
              </p>
            </div>

            { widget }
        </div>
      );
    }
});

module.exports = {
  MeasurementInputForm: MeasurementInputForm,
  MeasurementOutputTable: MeasurementsTable,
  MeasurementsErrorsPrompt: MeasurementsErrorsPrompt,
};