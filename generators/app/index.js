'use strict';
var myBase = require('./base.js');

module.exports = myBase.extend({
  prompting: function() {
    
    var prompts = [{
      type: 'confirm',
      name: 'installBootstrapper',
      message: 'Would you like to also install the bootstrappers?',
      default: this.options.installBootstrapper || true,
      when: this.options.installBootstrapper == null
    }, {
      type: 'confirm',
      name: 'installConfigFile',
      message: 'Would you like to install a config file?',
      default: this.options.installConfigFile || false,
      when: this.options.installConfigFile == null
    }, {
      type: 'confirm',
      name: 'downloadFromRemote',
      message: 'Do you want to grab updated resources from the Internet?',
      default: false,
      when: function(hash) {
        return hash.installBootstrapper || hash.installConfigFile;
      }
    }, {
      type: 'input',
      name: 'fileName',
      message: 'Enter a file name for your new build script',
      default: this.options.fileName || 'build.cake',
      when: this.options.fileName == null,
      store: true
    }];

    return this.prompt(prompts).then(function(props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function() {
    this.log('Generating Cake build script');
    this.fs.copy(
      this.templatePath('build.cake'),
      this.destinationPath(this.props.fileName)
    );
    if (this.props.installBootstrapper) {
      this.composeWith('cake:bootstrapper', {
        options: {
          preconfig: true,
          download: this.props.downloadFromRemote
        }
      }, {
        local: require.resolve('../bootstrapper'),
        link: 'strong'
      });
    }
    if (this.props.installConfigFile) {
      this.composeWith('cake:config', {
        options: {
          preconfig: true,
          download: this.props.downloadFromRemote
        }
      }, {
        local: require.resolve('../config'),
        link: 'strong'
      });
    }
  }
});
