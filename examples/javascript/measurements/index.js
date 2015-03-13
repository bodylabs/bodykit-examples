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
          shouldCleanAuthResult: false,
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

    getInitialState: function () {
        return {
          predictedMeasurements: {},
          heatmapMeasurements: {},
          auth: {},
          authResult: 'unknown',
          errors: {},
          aclAuthHeader: {},
        };
    },

    componentDidMount: function() {
        this.getAclAuthHeader();
    },

    errorHandler: function (xhr) {
        if (xhr.status === 401){
          this.setState({authResult: xhr.statusText});
        } else {
          this.setState({errors: {status: xhr.status, text: xhr.responseText}});
        }
    },

    // Grant access control for user to try out demo page
    getAclAuthHeader: function () {
        var component = this;

        var authUrl = this.props.aclAuthServerUrl;

        $.ajax({
            type: 'POST',
            url: authUrl,         
            error: component.errorHandler,
            success: function (data) {
                component.setState({authResult: 'Success'});
                component.setState({
                    aclAuthHeader: {Authorization: data}
                });       
            }
        });
    },

    _getMeasurements: function (payload, successCallback) {

        var component = this;
        $.ajax({
            type: 'POST',
            url: component.props.baseUrl + '/instant/measurements',
            data: JSON.stringify(payload),
            dataType: 'json',
            // headers: {"Authorization": "SecretPair accesskey="+ component.state.auth.accessKey +",secret=" + component.state.auth.secret},
            headers: component.state.aclAuthHeader,
            error: component.errorHandler,
            success: successCallback
        });
    },

    /// functions for get the outputs

    getMesh: function (payload) {
        var component = this;
        $.ajax({
            type: 'POST',
            url: component.props.baseUrl + '/instant/mesh',
            data: JSON.stringify(payload),
            dataType: 'json',
            // headers: {"Authorization": "SecretPair accesskey="+ component.state.auth.accessKey +",secret=" + component.state.auth.secret},
            headers: component.state.aclAuthHeader,
            error: component.errorHandler,
            success: function (data) {
                component.setState({authResult: 'Success'});
                component.setState({errors: {}});
                component.downloadStringAsFile('mesh.obj', data);
            }
        });
    },

    getPredictedMeasurements: function(payload) {
        var component = this;
        this._getMeasurements(payload, function (data) {
            component.setState({predictedMeasurements: data.output.measurements});
            component.setState({authResult: 'Success'});
            component.setState({errors: {}});
        });
    },

    //Get heatmap and get heatmap measurements alone the way
    getHeatmap: function (payload) {
        var component = this;
        $.ajax({
            type: 'POST',
            url: component.props.baseUrl + '/instant/heatmap',
            data: JSON.stringify(payload),
            dataType: 'json',
            // headers: {"Authorization": "SecretPair accesskey="+ component.state.auth.accessKey +",secret=" + component.state.auth.secret},
            headers: component.state.aclAuthHeader,
            error: component.errorHandler,
            success: function (data) {
                component.setState({authResult: 'Success'});
                component.setState({errors: {}});
                component.downloadStringAsFile('heatmap.obj', data);
            }
        });

        //the second body is the body to be compared.
        var bodyFromWidget = payload.bodies[1];
        this._getMeasurements(bodyFromWidget, function (data) {
          component.setState({heatmapMeasurements: data.output.measurements});
          component.setState({authResult: 'Success'});
          component.setState({errors: {}});
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

    render: function () {

        var widgetOptions = this.props.widgetOptions;
        widgetOptions.accessKey = this.state.auth.accessKey || 'some-fake-key';

        //Use below if you want secret key auth.
        // var secretKeyAuthSetupForm = (<AuthSetupForm onAuthFormSubmit={this.setUpAuth} authResult={this.state.authResult}/>);

        return (
            <div className='measurementsDemo'>

              <section className='measurements-left'>
                  <MeasurementInputForm  widgetOptions={widgetOptions}
                                    presetMeasurements={this.props.presetMeasurements}
                                    onMeasurementsRequest={this.getPredictedMeasurements}
                                    onMeshRequest={this.getMesh}
                                    handleHeatMapsRequest={this.getHeatmap}/>
              
              </section>

              <section className='measurements-middle'>
                    <h3>Generated Measurements: </h3>
                    <MeasurementsTable measurements={this.state.predictedMeasurements}/>
              </section>

               <section className='measurements-right'>
                    <h3>Heatmap Measurements: </h3>
                    <MeasurementsTable measurements={this.state.heatmapMeasurements}/>
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
    {id: 'low_hip_girth'},
    {id: 'shirt_sleeve_length'},
    {id: 'inseam'},
  ];

  var bodykitWidgetOptions = {
      genderOptions: ['female', 'male'],
      defaultGender: 'male',
  };

  var baseUrl = "https://api.bodylabs.com";
  var aclAuthServerUrl = "https://bodylabs-web-glue.herokuapp.com/api_auth/demo";

  React.render(
    <MeasurementsApp presetMeasurements={standardMeasurements} 
                     baseUrl={baseUrl}
                     aclAuthServerUrl={aclAuthServerUrl}
                     widgetOptions={bodykitWidgetOptions}/>,
    document.getElementById('container')
  );
}, 50);

