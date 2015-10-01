import _ from 'lodash';
import React from 'react/addons';
import TimerMixin from 'react-timer-mixin';
import Pane from './pane.jsx';
import Controls from './controls.jsx';
var cx = React.addons.classSet;

var Workspace = React.createClass({
  mixins: [TimerMixin],

  getDefaultProps: function() {
    return {
      panes: [],
      steps: [],
      vars: {}
    }
  },

  getInitialState: function() {
    return {
      step: -1,
      activePane: null,
      activeVars: _.clone(this.props.vars || {}),
      positions: [],
      highlights: [],

      playing: false,
      playSpeed: 500,
      pauseOnPaneChange: true
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this._reset(nextProps);
  },

  doTogglePlay: function() {
    this.setState({ playing: !this.state.playing, playSpeed: 500, pauseOnPaneChange: true });
  },

  doPlayEnd: function() {
    this.setState({ playing: !this.state.playing, playSpeed: 300, pauseOnPaneChange: false });
  },

  doStepFirst: function() {
    this._reset(this.props);
  },

  doStepNext: function() {
    if (this.props.panes.length > 0 && this.state.step < this.props.steps.length-1) {
      var state = this._computeNext(_.clone(this.state));
      this.setState(state);
    } else {
      this.setState({ playing: false });
    }
  },

  doStepBack: function() {
    if (this.props.panes.length > 0 && this.state.step >= 0) {
      var state = this.getInitialState();
      for (var i=0; i<this.state.step; i++)
        this._computeNext(state);
      this.setState(state);
    }
  },

  _reset: function(props) {
    var state = this.getInitialState();
    state.activeVars = _.clone(props.vars);
    this.setState(state);
  },

  _computeNext: function(oldState) {
    var step = oldState.step + 1;
    var stepData = this.props.steps[step];
    var positions = oldState.positions;
    var highlights = oldState.highlights;
    var activePane = stepData[0];
    positions[activePane] = stepData[1];
    var vars = stepData[2];
    highlights[activePane] = stepData[3];

    return _.merge(oldState, {
      step: step,
      activePane: activePane,
      positions: positions,
      highlights: highlights,
      activeVars: _.merge(oldState.activeVars, vars),
      playing: (oldState.pauseOnPaneChange && activePane != oldState.activePane) ? false : oldState.playing
    });
  },

  render: function() {
    if (this.state.playing) {
      this.setTimeout(() => {
        this.doStepNext();
      }, this.state.playSpeed);
    }

    return (
      <div className="code--workspace">
        <Controls playing={this.state.playing} step={this.state.step} numSteps={this.props.steps.length}
          doTogglePlay={this.doTogglePlay} doPlayEnd={this.doPlayEnd} 
          doStepNext={this.doStepNext} doStepFirst={this.doStepFirst} doStepBack={this.doStepBack} />
        <div className="code--panes">
          {this.props.panes.map((code, i) => { return (
              <Pane key={i} name={code.name} 
                lines={code.lines} line={this.state.positions[i]} active={this.state.activePane == i}
                vars={this.state.activeVars} highlight={this.state.highlights[i]} />
          )})}
        </div>
      </div>
    );
  }
});

module.exports = Workspace;
