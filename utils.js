'use strict';

// From https://github.com/sindresorhus/pretty-bytes/blob/master/index.js
function formatBytes(num) {
  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	if (!Number.isFinite(num)) {
		throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
	}

	const neg = num < 0;

	if (neg) {
		num = -num;
	}

	if (num < 1) {
		return (neg ? '-' : '') + num + ' B';
	}

	const exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1);
	const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
	const unit = UNITS[exponent];

	return (neg ? '-' : '') + numStr + ' ' + unit;
};

function formatSpeed(speed) {
  return formatBytes(speed * 60) + "/sec";
}

var customHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: function() { return 'y' },
      mo: function() { return 'mo' },
      w: function() { return 'w' },
      d: function() { return 'd' },
      h: function() { return 'h' },
      m: function() { return 'm' },
      s: function() { return 's' },
      ms: function() { return 'ms' },
    }
  }
});

function formatDuration(duration, precision = 2) {
  return customHumanizer(duration, {
    largest: precision,
    round: true,
    spacer: '',
    delimiter: ' '
  })
}