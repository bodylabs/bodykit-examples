/** @jsx React.DOM */
var React = require('react'),
    _ = require('underscore'),
    measurementsUI = require('../../measurements/measurementsUI'),
    MeasurementInputForm = measurementsUI.MeasurementInputForm,
    MeasurementsTable = measurementsUI.MeasurementOutputTable,
    MeasurementsErrorsPrompt = measurementsUI.MeasurementsErrorsPrompt;

var MeasurementsApp = React.createClass({
  getInitialState: function() {
    return {
      presetMeasurements: this.props.presetMeasurements,
      predictedMeasurements: {},
      errors: {},
      baseUrl: this.props.baseUrl,
      aclAuthHeader: this.props.aclAuthHeader
    };
  },
  errorHandler: function (xhr) {
    this.setState({errors: {status: xhr.status, text: xhr.responseText}});    
  },
  getMesh: function (payload) {
        $.ajax({
            type: 'POST',
            url: this.state.baseUrl + '/lite/mesh',
            data: JSON.stringify(payload),
            dataType: 'json',
            headers: this.state.aclAuthHeader,
            error: this.errorHandler,
            success: function (data) {
                this.setState({errors: {}});
                this.downloadStringAsFile('mesh.obj', data);
            }.bind(this)
        });
  },
  getPredictedMeasurements: function (payload) {
        $.ajax({
            type: 'POST',
            url: this.state.baseUrl + '/lite/measurements',
            data: JSON.stringify(payload),
            dataType: 'json',
            headers: this.state.aclAuthHeader,
            error: this.errorHandler,
            success: function (data) {
                this.setState({predictedMeasurements: data.output.measurements});
                this.setState({errors: {}});
            }.bind(this)
        });
  },
  downloadStringAsFile: function (filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
  },
  render: function() {
    return (
      <div className="container">
        <div>
          <h3>
            Your API access permission will last {this.props.expireAfterSeconds} seconds.
          </h3>
        </div>
        <div className='measurementsDemo'>
              <section className='measurements-left'>
                  <MeasurementInputForm presetMeasurements={this.state.presetMeasurements}
                                    onMeasurementsRequest={this.getPredictedMeasurements}
                                    onMeshRequest={this.getMesh}/>
              
              </section>

              <section className='measurements-right'>
                    <h3>Generated Measurements: </h3>
                    <MeasurementsTable measurements={this.state.predictedMeasurements}/>
              </section>

              <section className='measurements-errors'>
                    <MeasurementsErrorsPrompt status={this.state.errors.status} text={this.state.errors.text} />
              </section>
        </div>
      </div>
    );
  }
});

module.exports = MeasurementsApp;