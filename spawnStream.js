var Transform = require('readable-stream').Transform
  , fs = require("fs")
  , util = require("util")
  , spawn = require("child_process").spawn
  , Transform = require("stream").Transform;

  
module.exports = SpawnStream;

util.inherits(SpawnStream, Transform);

function SpawnStream(command, args, opts){
	var self = this
      , stdErr  = self.emit.bind(self, "error")
	  , onError = self.emit.bind(self, "error")
	  , onClose = self.emit.bind(self, "close");

	Transform.call(this);

    if ( !Array.isArray(args) ){
        opts = args || {};

	    if (process.platform === 'win32') {
            opts.windowsVerbatimArguments = true;
	        args = ['/s', '/c', '"' + command + '"'];
            command = 'cmd.exe';
  	    } else {
	        args = ['-c', command];
            command = '/bin/sh';
  	    }
    }

	self.cp = spawn(command, args, opts);

	self.cp.stderr
		.on('data', stdErr);

	self.cp.stdout
		.on('data', self.push.bind(self));

	self.cp
        .on('error', onError)
        .on('close', onClose);
}

SpawnStream.prototype._transform = function(data, encoding, done) {
	this.cp.stdin.write(data, encoding, done);
};

SpawnStream.prototype._flush = function(done) {
    this._flushed = true;
  	this.cp.stdout.on('end', done);
	this.cp.stdin.end();
};
