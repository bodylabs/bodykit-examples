/** @jsx React.DOM */
var React = require('react'),
    _ = require('underscore'),
    measurementsUI = require('./measurementsUI'),
    MeasurementInputForm = measurementsUI.MeasurementInputForm,
    MeasurementsTable = measurementsUI.MeasurementOutputTable,
    MeasurementsErrorsPrompt = measurementsUI.MeasurementsErrorsPrompt;

var AuthCredentialSetPrompt = React.createClass({
  render: function () {
    if (!this.props.shouldDisplayAuthSetPrompt) {
      return null;
    }

    return (
      <span> &nbsp; Auth Credentials Set! </span>
    );
  }
});

var AuthResultPrompt = React.createClass({
    render: function () {
        if (this.props.authStatus === 'unknown') {
          return null;
        } else if(this.props.shouldClean){
          return null;
        } else if (this.props.authStatus === 'Success') {
          return (<span> &nbsp; Authentication success! </span>);
        } else {
          return (<span> &nbsp; Authentication Failed: {this.props.authStatus} </span>);
        }
    } 
});

var AuthSetupForm = React.createClass({
    getInitialState: function () {
        return {
          setButtonClicked:false,
          shouldCleanAuthResult: false
        };
    },
    handleClick: function () {
      var accessKey = this.refs.accessKeyInputBox.getDOMNode().value;
      var secret = this.refs.apiSecretInputBox.getDOMNode().value;

      this.props.onAuthFormSubmit(accessKey, secret);

      this.setState({setButtonClicked:true});
      this.setState({shouldCleanAuthResult:false});
    },
    cleanPrompts: function (){
      this.setState({setButtonClicked:false});
      this.setState({shouldCleanAuthResult:true});
    },
    render: function () {
        return (
          <div className="auth-setup">
            <h3> Auth Setup Form </h3>
            <p>
              <input type="text" ref="accessKeyInputBox" placeholder="Enter Your Access Key here..." onChange={this.cleanPrompts}/>
            </p>
            <p>
              <input type="text" ref="apiSecretInputBox" placeholder="Enter Your API secret here..." onChange={this.cleanPrompts}/> 
            </p>
            <p>
              <input type="button" value="Set" onClick={this.handleClick} />
              <AuthCredentialSetPrompt shouldDisplayAuthSetPrompt={this.state.setButtonClicked && this.props.authResult === 'unknown'}/>
              <AuthResultPrompt authStatus={this.props.authResult} shouldClean={this.state.shouldCleanAuthResult}/>
            </p>
          </div>
        );
    }
});

var MeasurementsApp = React.createClass({
    errorHandler: function (xhr) {
        if (xhr.status === 401){
          this.setState({authResult: xhr.statusText});
        } else {
          this.setState({errors: {status: xhr.status, text: xhr.responseText}});
        }
    },
    getMesh: function (payload) {
        $.ajax({
            type: 'POST',
            url: this.props.baseUrl + '/lite/mesh',
            data: JSON.stringify(payload),
            dataType: 'json',
            headers: {"Authorization": "SecretPair accesskey="+ this.state.auth.accessKey +",secret=" + this.state.auth.secret},
            error: this.errorHandler,
            success: function (data) {
                this.setState({authResult: 'Success'});
                this.setState({errors: {}});
                this.downloadStringAsFile('mesh.obj', data);
            }.bind(this)
        });
    },

    getPredictedMeasurements: function (payload) {
        $.ajax({
            type: 'POST',
            url: this.props.baseUrl + '/lite/measurements',
            data: JSON.stringify(payload),
            dataType: 'json',
            headers: {"Authorization": "SecretPair accesskey="+ this.state.auth.accessKey +",secret=" + this.state.auth.secret},
            error: this.errorHandler,
            success: function (data) {
                this.setState({predictedMeasurements: data.output.measurements});
                this.setState({authResult: 'Success'});
                this.setState({errors: {}});
            }.bind(this)
        });
    },
    setUpAuth: function (accessKey, secret) {
        this.setState({
                      auth: {
                        accessKey: accessKey,
                        secret: secret
                      },
                      authResult: 'unknown',

        });
    },
    downloadStringAsFile: function (filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    },
    getInitialState: function () {
        return {
          predictedMeasurements: {},
          auth: {},
          authResult: 'unknown',
          errors: {},
        };
    },
    render: function () {
        return (
            <div className='measurementsDemo'>

              <AuthSetupForm onAuthFormSubmit={this.setUpAuth} authResult={this.state.authResult}/>

              <section className='measurements-left'>
                  <MeasurementInputForm presetMeasurements={this.props.presetMeasurements}
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
        );
    }
});

setInterval(function () {

  var standardMeasurements = [
    {id: 'weight'},
    {id: 'height'},
    {id: 'bust_girth'},
    {id: 'waist_girth'},
    {id: 'high_hip_girth'},
    {id: 'full_sleeve_length'},
    {id: 'inseam'},
  ];

  var baseUrl = "https://api.bodylabs.com";

  React.render(
    <MeasurementsApp presetMeasurements={standardMeasurements} baseUrl={baseUrl}/>,
    document.getElementById('container')
  );
}, 50);

