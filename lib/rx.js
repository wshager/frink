const ReplaySubject = require("rxjs/ReplaySubject").ReplaySubject;

function subject() {
	return new ReplaySubject();
}

function next(s,v) {
	s.next(v);
	return s;
}

function complete(s) {
	s.complete();
	return s;
}

exports.subject = subject;

exports.next = next;

exports.complete = complete;
