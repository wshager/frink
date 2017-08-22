(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.last = exports.position = exports.isVNode = undefined;
exports.VNodeIterator = VNodeIterator;
exports.Step = Step;
exports.nextNode = nextNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.getDoc = getDoc;
exports.lastChild = lastChild;
exports.parent = parent;
exports.self = self;
exports.iter = iter;
exports.cxFilter = cxFilter;
exports.element = element;
exports.attribute = attribute;
exports.text = text;
exports.node = node;
exports.child = child;
exports.followingSibling = followingSibling;
exports.select = select;
exports.isEmptyNode = isEmptyNode;
exports.name = name;

var _doc = require("./doc");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

function VNodeIterator(iter, parent, f) {
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.indexInParent = -1;
	this.__is_VNodeIterator = true;
}

var DONE = {
	done: true
};

VNodeIterator.prototype.next = function () {
	var v = this.iter.next();
	this.indexInParent++;
	if (v.done) return DONE;
	return { value: this.f(v.value, this.parent, this.indexInParent) };
};

function Step(inode, name, parent, depth, indexInParent) {
	this.inode = inode;
	this.name = name;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this.depth + ", closes:" + this.parent.name + "}";
};

/*
export function* docIter(node) {
	node = ensureDoc.bind(this)(node);
	yield node;
	while (node) {
		node = nextNode(node);
		if(node) yield node;
	}
}
*/
function nextNode(node /* VNode */) {
	var type = node.type,
	    inode = node.inode,
	    parent = node.parent,
	    indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	if (type != 17 && node.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = node.first();
		// TODO handle arrays
		node = parent.vnode(inode, parent, depth, indexInParent);
		//console.log("found first", node.name, depth,indexInParent);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//inode = parent;
			depth--;
			node = node.parent;
			if (depth === 0 || !node) return;
			inode = node.inode;
			node = new Step(inode, node.name, node.parent, depth, node.indexInParent);
			//console.log("found step", node.name, depth, indexInParent);
			return node;
		} else {
			// return the next child
			inode = parent.next(node);
			if (inode !== undefined) {
				node = parent.vnode(inode, parent, depth, indexInParent);
				//console.log("found next", node.name, depth, indexInParent);
				return node;
			}
			throw new Error("Node " + parent.name + " hasn't been completely traversed. Found " + indexInParent + ", contains " + parent.count());
		}
	}
}
/*
export function* prevNode(node){
	//var depth = node.depth;
	while(node){
		if(!node.size) {
			//depth--;
			node = node.parent;
			if(!node) break;
			yield node;
		} else{
			if(!("indexInParent" in node)) node.indexInParent = node.parent.size;
			node.indexInParent--;
			node = node.getByIndex(node.indexInParent);
		}
	}
}
*/
function stringify(input) {
	var str = "";
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var docAttrFunc = function docAttrFunc(z, kv) {
		return z += kv[0] == "DOCTYPE" ? "<!" + kv[0] + " " + kv[1] + ">" : "<?" + kv[0] + " " + kv[1] + "?>";
	};
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = docIter(input)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _node = _step.value;

			var type = _node.type;
			if (type == 1) {
				str += "<" + _node.name;
				str = (0, _transducers.foldLeft)(_node.attrEntries(), str, attrFunc);
				if (!_node.count()) str += "/";
				str += ">";
			} else if (type == 3) {
				str += _node.toString();
			} else if (type == 9) {
				str += (0, _transducers.foldLeft)(_node.attrEntries(), str, docAttrFunc);
			} else if (type == 17) {
				str += "</" + _node.name + ">";
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return (0, _pretty.prettyXML)(str);
}

function firstChild(node) {
	// FIXME return root if doc (or something else?)
	var next = _doc.ensureDoc.bind(this)(node);
	if (node !== next) return next;
	// next becomes parent, node = firstChild
	node = next.first();
	if (node) return next.vnode(node, next, next.depth + 1, 0);
}

function nextSibling(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var parent = node.parent;
	var next = parent.next(node);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return parent.vnode(next, parent, node.depth, node.indexInParent + 1);
}

/*
export function* children(node){
	node = ensureDoc.bind(this)(node);
	var i = 0;
	for(var c of node.values()){
		if(c) yield node.vnode(c, node, node.depth + 1, i++);
	}
}
*/
function getDoc(node) {
	node = _doc.ensureDoc.bind(this)(node);
	do {
		node = node.parent;
	} while (node.parent);
	return node;
}

function lastChild(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var last = node.last();
	return node.vnode(last, node, node.depth + 1, node.count() - 1);
}

function parent(node) {
	if (!arguments.length) return Axis(parent);
	return node.parent ? (0, _seq.seq)(new VNodeIterator([node.parent.inode][Symbol.iterator](), node.parent.parent, node)) : (0, _seq.seq)();
}

function Singleton(val) {
	this.val = val;
}

Singleton.prototype.next = function () {
	if (this.val !== undefined) {
		var val = this.val;
		this.val = undefined;
		return { value: val };
	}
	return { done: true };
};

function self(f) {
	if (f.name !== "transForEach") f = (0, _transducers.forEach)(f);
	return Axis(function (node) {
		return new Singleton(node);
	}, f, 3);
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = function f(node) {
		prev = node;
	};
	node = _doc.ensureDoc.bind(this)(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	return prev;
}

var isVNode = exports.isVNode = function isVNode(n) {
	return !!n && n.__is_VNode;
};

var _isElement = function _isElement(n) {
	return isVNode(n) && n.type == 1;
};

var _isAttribute = function _isAttribute(n) {
	return isVNode(n) && n.type == 2;
};

var _isText = function _isText(n) {
	return isVNode(n) && n.type == 3;
};

//const _isList = n => isVNode(n) && n.type == 5;

//const _isMap = n => isVNode(n) && n.type == 6;

var _isLiteral = function _isLiteral(n) {
	return isVNode(n) && n.type == 12;
};

function cxFilter(iterable, f) {
	return (0, _transducers.filter)(iterable, function (v, k, i) {
		if (!(0, _seq.isSeq)(v) && !isVNode(v)) v = (0, _seq.seq)(v);
		v.__cx = [k, i];
		return f(v, k, i);
	});
}

var position = exports.position = function position(n) {
	return n.__cx ? n.__cx[0] + 1 : n.indexInParent;
};

var last = exports.last = function last(n) {
	return n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;
};

// TODO convert qname to integer when parent is array
function _nodeTest(type, qname) {
	var f;
	if (qname === undefined) {
		f = type;
	} else {
		var hasWildcard = /\*/.test(qname);
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			f = function f(n) {
				return type(n) && regex.test(n.name);
			};
		} else {
			//return _seq.seq(_get(qname, 1), _transducers.filter(_isElement));
			f = function f(n) {
				return n.name === qname && type(n);
			};
			f.__Accessor = qname;
		}
	}
	f.__is_NodeTypeTest = true;
	return f;
}

function element(qname) {
	return _nodeTest(_isElement, qname);
}

function _attrGet(key, node) {
	var entries;
	if (key !== null) {
		var val = node.attr(key);
		if (!val) return [];
		entries = [[key, val]];
	} else {
		entries = node.attrEntries();
	}
	return (0, _transducers.forEach)(entries, function (kv) {
		return node.vnode(node.ivalue(2, kv[0], kv[1]), node.parent, node.depth + 1, node.indexInParent);
	});
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
function attribute(qname) {
	var hasWildcard = /\*/.test(qname);
	// getter of attributes / pre-processor of attributes
	// TODO iterator!
	// filter of attributes
	var f;
	if (hasWildcard) {
		var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		//	attrEntries returns tuples
		f = function f(n) {
			return _isAttribute(n) && regex.test(n.name);
		};
		// no direct access
		qname = null;
	} else {
		// name check provided by directAccess
		f = function f(n) {
			return _isAttribute(n);
		};
	}
	return Axis(_attrGet.bind(null, qname), (0, _transducers.filter)(f), 2);
}

function text() {
	var f = function f(n) {
		return _isText(n) && !!n.value;
	};
	f.__is_NodeTypeTest = true;
	return f;
}

function node() {
	var f = function f(n) {
		return _isElement(n) || _isText(n) && !!n.value;
	};
	f.__is_NodeTypeTest = true;
	return f;
}

// TODO create axis functions that return a function
// child(element(qname))
// works like a filter: filter(children(node|nodelist),n => element(qname,n))
// nextSibling(element()): filter(nextSibling(node|nodelist),n => element(undefined,n))
// filterOrGet: when f is called, and null or wildcard match was supplied as its qname parameter, call filter
// else call get
// if it is a seq, apply the function iteratively:
// we don't want to filter all elements from a seq, we want to retrieve all elements from elements in a seq
// final edge case: when node is of type array, and name is not an integer: filter
function Axis(g, f, type) {
	return {
		__is_Axis: true,
		__type: type || 1,
		f: f,
		g: g
	};
}
function child(f) {
	if (f.__is_NodeTypeTest) {
		// this means it's a predicate, and the actual function should become a filter
		if (f.__Accessor) {
			// TODO this means we can try direct access on a node
		}
		f = (0, _transducers.filter)(f);
	}
	return Axis(function (node) {
		return node[Symbol.iterator]();
	}, f);
}

var _isSiblingIterator = function _isSiblingIterator(n) {
	return !!n && n.__is_SiblingIterator;
};

var isVNodeIterator = function isVNodeIterator(n) {
	return !!n && n.__is_VNodeIterator;
};

function SiblingIterator(inode, parent, depth, indexInParent, dir) {
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

SiblingIterator.prototype.next = function () {
	var v = this.dir.call(this.parent.inode, this.name, this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: this.parent.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = _doc.ensureDoc.bind(this)(node);
	return (0, _seq.seq)(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent));
}

/*function* _combinedIter(iters, f) {
	for(var x of iters) {
		var next;
		// expect everything to be a faux iterator
		while(next = f(x).next(), !next.done) {
			yield next.value;
		}
	}
}*/

function CombinedIterator(iters, f) {
	this.iter = f(iters.shift());
	this.iters = iters;
	this.f = f;
	this.index = 0;
}

CombinedIterator.prototype.next = function () {
	if (!this.iter) return DONE;
	var v = this.iter.next();
	if (!v || v.done) {
		if (this.iters.length) {
			this.iter = this.f(this.iters.shift());
			return this.next();
		}
		return DONE;
	}
	return v;
};

function _combinedIter(iters, f) {
	return new CombinedIterator(iters, f);
}

// make sure all paths are transducer-funcs
function select(node) {
	// usually we have a sequence
	// TODO make lazy:
	// - combine iterators for each node seq to one iterator
	// - bind the composed function to the combined iterator
	// - combine the combined iterator
	var cur = node;
	var bed = _doc.ensureDoc.bind(this);

	for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		paths[_key - 1] = arguments[_key];
	}

	var _loop = function _loop() {
		var path = paths.shift();
		path = _axify(path);
		// TODO skip self
		skipCompare = path.__type == 2 || path.__type == 3;
		f = path.f;
		// rebind step function to the context

		bound = function bound(n) {
			return path.g(bed(n));
		};

		if (!skipCompare) f = (0, _transducers.compose)(f, (0, _transducers.filter)(_comparer()));
		x = (0, _seq.isSeq)(cur) ? _combinedIter(cur.toArray(), bound) : bound(cur);

		cur = (0, _transducers.into)(x, f, (0, _seq.seq)());
	};

	while (paths.length > 0) {
		var skipCompare;
		var f;
		var bound;
		var x;

		_loop();
	}
	return cur;
}

function _comparer() {
	// dirty preserve state on function
	var f = function f(node) {
		var has = f._checked.has(node);
		if (!has) f._checked.set(node, true);
		return !has;
	};
	f._checked = new WeakMap();
	return f;
}

/*
export function* select2(node,...paths) {
	// TODO
	// 1: node (or seq) is iterable, so get first as current context
	// 2: each function is a filter (either a node is returned or the process stops)
	// 3: pass each single result to a filter function, yielding a result for each
	var bed = ensureDoc.bind(this);
	var next = bed(node);
	var cx = next;
	if(next) {
		next = nextNode(next);
		while(next){
			for(var i=0,l=paths.length,path=paths[i]; i<l; i++){
				if(!isSeq(path)) path = seq(path);
				// process strings (can this be combined?)
				path = transform(path,compose(forEach(function(path){
					if(typeof path == "string") {
						var at = /^@/.test(path);
						if(at) path = path.substring(1);
						return at ? attribute(path) : element(path);
					}
					return [path];
				}),cat));
				var composed = compose.apply(null,path.toArray());
				let ret = composed.call(cx,next);
				if(node) {
					yield ret;
				} else {
					break;
				}
			}
		}
	}
}
*/
function _axify(path) {
	if (!path.__is_Axis) {
		// process strings (can this be combined?)
		if (typeof path == "string") {
			var at = /^@/.test(path);
			if (at) path = path.substring(1);
			return at ? attribute(path) : child(element(path));
		} else if (typeof path == "function") {
			return self(path);
		} else {
			// TODO throw error
		}
	}
	return path;
}

function isEmptyNode(node) {
	node = _doc.ensureDoc.bind(this)(node);
	if (!isVNode(node)) return false;
	if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

function name($a) {
	if ((0, _seq.isSeq)($a)) return (0, _transducers.forEach)($a, name);
	if (!isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}

},{"./doc":3,"./pretty":10,"./seq":12,"./transducers":13}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ensureDoc = ensureDoc;
exports.d = d;

var _inode = require("./inode");

var inode = _interopRequireWildcard(_inode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ensureDoc(node) {
	if (!node) return;
	var cx = this && this.vnode ? this : inode;
	if (!node.inode) {
		if (cx.getType(node) == 9) {
			var root = cx.first(node);
			return cx.vnode(root, cx.vnode(node), 1, 0);
		} else {
			var doc = d.bind(cx)();
			var _root = cx.vnode(node, doc, 1, 0);
			doc = doc.push(_root);
			return _root;
		}
	}
	if (typeof node.inode === "function") {
		node = node.inode(d.bind(cx)());
	}
	return node;
}

function d() {
	var uri = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	var doctype = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var attrs = {};
	var cx = this.vnode ? this : inode;
	if (uri) {
		attrs["xmlns" + (prefix ? ":" + prefix : "")] = uri;
	}
	if (doctype) {
		attrs.DOCTYPE = doctype;
	}
	return cx.vnode(cx.emptyINode(9, "#document", 0, cx.emptyAttrMap(attrs)));
}

},{"./inode":7}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ready = ready;
exports.byId = byId;
exports.query = query;
exports.on = on;
exports.click = click;
exports.hasClass = hasClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
exports.removeAttr = removeAttr;
exports.toggle = toggle;
exports.hide = hide;
exports.elem = elem;
exports.attr = attr;
exports.text = text;
exports.empty = empty;
exports.remove = remove;
exports.placeAt = placeAt;
exports.placeAfter = placeAfter;
exports.placeBefore = placeBefore;
exports.matchAncestorOrSelf = matchAncestorOrSelf;

var _access = require("./access");

var _seq = require("./seq");

var _transducers = require("./transducers");

function domify(n) {
    // render
} /**
   * DOM util module
   * @module dom-util
   */

function ready() {
    return new Promise(function (resolve, reject) {
        function completed() {
            document.removeEventListener("DOMContentLoaded", completed, false);
            window.removeEventListener("load", completed, false);
            resolve();
        }

        if (document.readyState === "complete") {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            setTimeout(callback);
        } else {

            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", completed, false);

            // A fallback to window.onload, that will always work
            window.addEventListener("load", completed, false);
        }
    });
}

function byId(id) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    return doc.getElementById(id);
}

function query(query) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    return doc.querySelectorAll(query);
}

function on(elm, type, fn) {
    var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : document;

    if (!elm) {
        console.error("TypeError: You're trying to bind an event, but the element is null");
        return;
    }
    try {
        if (elm instanceof NodeList || (0, _seq.isSeq)(elm)) {
            var handles = [];
            (0, _transducers.forEach)(elm, function (_) {
                handles.push(on(_, type, fn));
            });
            return function () {
                handles.forEach(function (_) {
                    _();
                });
            };
        }
        if (typeof elm == "string") {
            return on(query(elm, context), type, fn);
        }
        if ((0, _access.isVNode)(elm)) elm = elm._domNode || domify(elm);
        elm.addEventListener(type, fn);
        return function () {
            elm.removeEventListener(type, fn);
        };
    } catch (e) {
        console.error(e);
    }
}

function click(elm) {
    if (elm instanceof NodeList) return (0, _transducers.forEach)(elm, click);
    var clk = elm.onclick || elm.click;
    if (typeof clk == "function") {
        clk.apply(elm);
    }
}

function hasClass(elm, name) {
    if (elm instanceof NodeList) {
        return (0, _transducers.foldLeft)(elm, false, function (pre, _) {
            return pre || hasClass(_, name);
        });
    }
    return !!elm.className.match(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"));
}

function removeClass(elm, name) {
    //elm.classList.remove(name);
    if (elm instanceof NodeList) {
        (0, _transducers.forEach)(elm, function (_) {
            removeClass(_, name);
        });
    } else {
        elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "");
    }
}

function toggleClass(elm, name) {
    var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var hasc = hasClass(elm, name);
    if (state === false || state === null && hasc) {
        removeClass(elm, name);
    } else if (!hasc) {
        elm.className += " " + name;
    }
}

function removeAttr(elm, name) {
    if (elm instanceof NodeList) {
        (0, _transducers.forEach)(elm, function (_) {
            _.removeAttribute(name);
        });
    } else {
        elm.removeAttribute(name);
    }
}

function toggle(elm) {
    // TODO move to CSS checked state
    var cur = elm.style.display;
    elm.style.display = cur.match(/^(none)?$/) ? "block" : "none";
}

function hide(elm) {
    elm.style.display = "none";
}

function place(node, target, position) {
    if ((0, _access.isVNode)(node)) node = node._domNode || domify(node);
    if ((0, _access.isVNode)(target)) target = target._domNode || domify(target);
    if (position == 1) {
        empty(target);
    }
    if (position > 1) {
        var parent = target.parentNode;
        if (position == 2) {
            parent.insertBefore(node, target.nextSibling);
        } else {
            parent.insertBefore(node, target);
        }
    } else {
        target.appendChild(node);
    }
    return node;
}

function elem(name) {
    var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var ns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var node = document.createElement(name);
    children.forEach(function (c) {
        if (c) {
            if (c.nodeType == 2) {
                node.setAttributeNode(c);
            } else {
                node.appendChild(c);
            }
        }
    });
    return node;
}

function attr(name, value) {
    var ns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var node = document.createAttribute(name);
    node.value = value;
    return node;
}

function text(value) {
    return document.createTextNode(value);
}

function empty(node) {
    if ((0, _access.isVNode)(node)) node = node._domNode;
    if (!node) return;
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function remove(node) {
    empty(node);
    node.parentNode.removeChild(node);
}

function placeAt(node, target) {
    var replace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return place(node, target, replace ? 1 : 0);
}
function placeAfter(node, target) {
    return place(node, target, 2);
}
function placeBefore(node, target) {
    return place(node, target, 3);
}

/**
 * Match a DOM Node to a selector, or, if it doesn't match,
 * try matching up the ancestor tree
 * @param  {Node} elem The base element (self)
 * @param  {String} selector The selector to match
 * @return {HTMLElement|null} Null if no match
 */
function matchAncestorOrSelf(elem, selector) {
    var node = elem;
    if (node.matches(selector)) return node;
    while (node.parentNode) {
        node = node.parentNode;
        if (!!(node && node.matches(selector))) return node;
    }
}

},{"./access":2,"./seq":12,"./transducers":13}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.process = process;

var _doc = require("./doc");

var _access = require("./access");

// iter form and replace fieldset types
function process(node) {
	_access.iter.bind(this)(node, function (node) {
		if (node.type == 6) {
			// this is mutative
			if (node.inode.dataset.appearance == "hidden") {
				node.inode.disabled = true;
				node.inode.hidden = true;
			}
		}
	});
	return _doc.ensureDoc.bind(this)(node);
}

},{"./access":2,"./doc":3}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.next = next;
exports.count = count;
exports.keys = keys;
exports.cached = cached;
exports.first = first;
exports.get = get;
exports.getType = getType;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.push = push;
exports.getAttribute = getAttribute;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

var _iform = require("./iform");

var cx = _interopRequireWildcard(_iform);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _inferType(node) {
	var t = node.dataType;
	if (t) {
		switch (t) {
			case "string":
				return 3;
			case "boolean":
			case "number":
				return 12;
			case "array":
				return 5;
			case "object":
				return 6;
		}
	}
	var nodeName = node.nodeName.toUpperCase();
	if (nodeName == "FIELDSET" || nodeName == "FORM") return 6;
	if (node.type == "number" || node.type == "checkbox") return 12;
	return 3;
}
function ivalue(type, name, value) {
	return value;
}

function vnode(inode, parent, depth, indexInParent) {
	var type = _inferType(inode);
	var format = inode.type;
	var val = inode.value;
	if (type == 12 && typeof val == "string") {
		if (format == "checkbox") {
			val = inode.checked;
		} else if (format == "number") {
			val = parseFloat(inode.value);
		}
	}
	return new _vnode.VNode(cx, inode, type, inode.name, val, parent, depth, indexInParent);
}

function next(inode, node, type) {
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// FIXME detect fieldset elements
	var elems = inode.elements;
	if (elems) return elems[idx + 1];
}

function count(inode, type) {
	return inode.elements ? inode.elements.length : 0;
}

function keys(inode, type) {
	// TODO cached
	return inode.elements ? (0, _transducers.forEach)(inode.elements, function (_) {
		return _.name;
	}) : [];
}

function cached() {}

function first(inode, type) {
	// FIXME detect / filter fieldset elements
	if (inode.elements) return inode.elements[0];
}

function get(inode, idx, type) {
	return inode[idx];
}

function getType(inode) {
	// probably only used for empty root
	return 9;
}

function emptyINode(type, name, depth, attrs) {}

function emptyAttrMap() {
	// probably only used for empty root
}

function push() {}

function getAttribute(inode) {
	return inode.attributes[inode];
}

},{"./iform":6,"./transducers":13,"./vnode":15}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getType = undefined;
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.next = next;
exports.push = push;
exports.set = set;
exports.removeChild = removeChild;
exports.cached = cached;
exports.keys = keys;
exports.values = values;
exports.finalize = finalize;
exports.setAttribute = setAttribute;
exports.getAttribute = getAttribute;
exports.count = count;
exports.first = first;
exports.last = last;
exports.attrEntries = attrEntries;
exports.modify = modify;
exports.stringify = stringify;

var _vnode = require("./vnode");

var _qname = require("./qname");

var _pretty = require("./pretty");

var _transducers = require("./transducers");

var _multimap = require("./multimap");

var multimap = _interopRequireWildcard(_multimap);

var _inode = require("./inode");

var cx = _interopRequireWildcard(_inode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// helpers ---------------
if (!Object.values) {
	var objUtil = function objUtil(obj, f) {
		var keys = Object.keys(obj);
		var entries = [];
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			entries.push(f(key));
		}
		return entries;
	};
	Object.values = function (o) {
		return objUtil(o, function (key) {
			return o[key];
		});
	};
	Object.entries = function (o) {
		return objUtil(o, function (key) {
			return [key, o[key]];
		});
	};
}

// import self!

function _inferType(inode) {
	if (inode === null) return 12;
	var cc = inode.constructor;
	if (cc == Array) {
		return 6;
	} else if (cc == Object) {
		if (inode.$children) {
			return inode.$name == "#document" ? 9 : 1;
		} else if (inode.$value) {
			return 2;
		} else if (inode.$comment) {
			return 8;
		} else {
			return 6;
		}
	} else if (cc == Number || cc == Boolean) {
		return 12;
	}
	return 3;
}

/*
function* _get(children, idx) {
	let len = children.length;
	for (let i = 0; i < len; i++) {
		if ((children[i].$name || i + 1) == idx) {
			yield children[i];
		}
	}
}
*/
function _last(a) {
	return (0, _transducers.drop)(a, a.length - 1);
}

function _elemToString(e) {
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var str = "<" + e.$name;
	var ns = e.$ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = (0, _transducers.foldLeft)(Object.entries(e.$attrs), str, attrFunc);
	if (e.$children.length > 0) {
		str += ">";
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = e.$children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var c = _step.value;

				str += stringify(c);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		str += "</" + e.$name + ">";
	} else {
		str += "/>";
	}
	return str;
}

// -----------------------

function ivalue(type, name, value) {
	if (type == 2) {
		return { $name: name, $value: value };
	} else if (type == 8) {
		return { $comment: value };
	}
	return value;
}

function vnode(inode, parent, depth, indexInParent) {
	var type = _inferType(inode),
	    name,
	    value;
	if (type == 1 || type == 9) {
		name = inode.$name;
	} else if (type == 2) {
		name = inode.$name;
		value = inode.$value;
	} else if (type == 5) {
		name = parent.keys()[indexInParent];
	} else if (type == 6) {
		name = parent.keys()[indexInParent];
	} else if (type == 8) {
		value = inode.$comment;
	} else if (type == 3 || type == 12) {
		value = inode;
		name = parent.keys()[indexInParent];
	}
	// return vnode
	return new _vnode.VNode(cx, inode, type, inode && inode.$ns ? (0, _qname.q)(inode.$ns.uri, name) : name, value, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? [] : {};
	if (type == 1 || type == 9) {
		inode.$name = name;
		inode.$attrs = attrs;
		inode.$ns = ns;
		inode.$children = [];
	}
	return inode;
}

function emptyAttrMap(init) {
	return init || {};
}

/*
export function get(inode,idx,type,cache){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		if(cache) return cache[idx];
		return _get(inode.$children,idx);
	}
	return inode[idx];
}
*/
function next(inode, node, type) {
	type = type || _inferType(inode);
	var idx = node.indexInParent;
	if (type == 1 || type == 9) {
		return inode.$children[idx + 1];
	}
	if (type == 5) return inode[idx + 1];
	if (type == 6) {
		var vals = Object.values(inode);
		return vals[idx + 1];
	}
}

function push(inode, val, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		inode.$children.push(val[1]);
	} else if (type == 5) {
		inode.push(val);
	} else if (type == 6) {
		inode[val[0]] = val[1];
	}
	return inode;
}

function set(inode /*,key,val,type*/) {
	// used to restore immutable parents, never modifies mutable
	return inode;
}

function removeChild(inode, child, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		inode.$children.splice(child.indexInParent, 1);
	} else if (type == 5) {
		inode.splice(child.indexInParent, 1);
	} else if (type == 6) {
		delete inode[child.name];
	}
	return inode;
}

function cached(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		var children = inode.$children,
		    len = children.length,
		    cache = multimap.default();
		for (var i = 0; i < len; i++) {
			cache.push([children[i].$name || i + 1, children[i]]);
		}
		return cache;
	}
	if (type == 5) {
		return {
			keys: function keys() {
				return (0, _transducers.range)(inode.length).toArray();
			}
		};
	}
	if (type == 6) {
		return {
			keys: function keys() {
				return Object.keys(inode);
			}
		};
	}
}

function keys(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		var children = inode.$children,
		    len = children.length,
		    _keys = [];
		for (var i = 0; i < len; i++) {
			_keys[i] = children[i].$name || i + 1;
		}
		return _keys;
	}
	if (type == 5) return (0, _transducers.range)(inode.length).toArray();
	if (type == 6) return Object.keys(inode);
	return [];
}

function values(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) return inode.$children;
	if (type == 2) return [[inode.$name, inode.$value]];
	if (type == 6) return Object.values(inode);
	if (type == 8) return [inode.$comment];
	return inode;
}

function finalize(inode) {
	return inode;
}

function setAttribute(inode, key, val) {
	if (inode.$attrs) inode.$attrs[key] = val;
	return inode;
}

function getAttribute(inode, key) {
	if (inode.$attrs) return inode.$attrs[key];
}

function count(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		return inode.$children.length;
	} else if (type == 5) {
		return inode.length;
	} else if (type == 6) {
		return Object.keys(inode).length;
	}
	return 0;
}

function first(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		return inode.$children[0];
	} else if (type == 5) {
		return inode[0];
	} else if (type == 6) {
		return Object.values(inode)[0];
	}
}

function last(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) return _last(inode.$children);
	if (type == 5) return _last(inode);
	if (type == 6) {
		return _last(Object.values(inode));
	}
}

function attrEntries(inode) {
	if (inode.$attrs) return Object.entries(inode.$attrs);
	return [];
}

function modify(inode, node, ref, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		if (ref !== undefined) {
			inode.$children.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.$children.push(node.inode);
		}
	} else if (type == 5) {
		if (ref !== undefined) {
			inode.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.push(node.inode);
		}
	} else if (type == 6) {
		inode[node.name] = node.inode;
	}
	return inode;
}

function stringify(inode, type) {
	var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	var key = arguments[3];

	var str = "";
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		str += _elemToString(inode);
	} else if (type == 5) {
		var val = (0, _transducers.forEach)(inode, function (c) {
			return stringify(c);
		}).join("");
		if (key) {
			str += "<" + key + " json:type=\"array\"" + (val ? ">" + val + "</" + key + ">" : "/>");
		} else {
			str += "<json:array" + (val ? ">" + val + "</json:array>" : "/>");
		}
	} else if (type == 6) {
		var _val = (0, _transducers.forEach)(Object.entries(inode), function (c) {
			return stringify(c[1], null, false, c[0]);
		}).join("");
		if (key) {
			str += "<" + key + " json:type=\"map\"" + (_val ? ">" + _val + "</" + key + ">" : "/>");
		} else {
			str += "<json:map" + (_val ? ">" + _val + "</json:map>" : "/>");
		}
	} else {
		var _val2 = inode === null ? "null" : inode.toString();
		if (key) {
			str += "<" + key + (type == 12 ? " json:type=\"literal\"" : "") + (_val2 ? ">" + _val2 + "</" + key + ">" : "/>");
		} else {
			str += type == 12 ? "<json:literal>" + _val2 + "</json:literal>" : _val2;
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
}

var getType = exports.getType = _inferType;

},{"./inode":7,"./multimap":9,"./pretty":10,"./qname":11,"./transducers":13,"./vnode":15}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.validate = exports.select = exports.lastChild = exports.firstChild = exports.d = exports.ensureDoc = undefined;

var _transducers = require("../transducers");

Object.keys(_transducers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _transducers[key];
    }
  });
});

var _domUtil = require("../dom-util");

Object.keys(_domUtil).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _domUtil[key];
    }
  });
});

var _iform = require("../iform");

var inode = _interopRequireWildcard(_iform);

var _doc = require("../doc");

var dc = _interopRequireWildcard(_doc);

var _access = require("../access");

var ac = _interopRequireWildcard(_access);

var _validate = require("../validate");

var va = _interopRequireWildcard(_validate);

var _formUtil = require("../form-util");

var fu = _interopRequireWildcard(_formUtil);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var ensureDoc = exports.ensureDoc = dc.ensureDoc.bind(inode);

var d = exports.d = dc.d.bind(inode);

var firstChild = exports.firstChild = ac.firstChild.bind(inode);

var lastChild = exports.lastChild = ac.lastChild.bind(inode);

var select = exports.select = ac.select.bind(inode);

var validate = exports.validate = va.validate.bind(inode);

var process = exports.process = fu.process.bind(inode);

},{"../access":2,"../doc":3,"../dom-util":4,"../form-util":5,"../iform":6,"../transducers":13,"../validate":14}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = multimap;
function MultiMap() {
	this._buckets = {};
	this._size = 0;
	this.__is_MultiMap = true;
}

MultiMap.prototype.push = function (entry) {
	var key = entry[0];
	var bucket = this._buckets[key];
	entry[2] = this._size++;
	if (bucket && bucket.__is_Bucket) {
		bucket.push(entry);
	} else {
		this._buckets[key] = new Bucket(entry);
	}
	return this;
};

MultiMap.prototype.get = function (key) {
	var bucket = this._buckets[key];
	if (bucket && bucket.__is_Bucket) {
		var vals = bucket._values,
		    len = vals.length;
		if (len === 0) return;
		if (len == 1) return vals[0][1];
		// TODO fix order if needed
		var out = new Array(len);
		for (var i = 0; i < len; i++) {
			out[i] = vals[i][1];
		}return out;
	}
};

MultiMap.prototype.keys = function () {
	// retain key types
	var keys = [];
	for (var i = 0, l = this._buckets.length; i < l; i++) {
		keys[i] = this._buckets[i][0];
	}
	return keys;
};

function Bucket(val) {
	this._values = [val];
	this.__is_Bucket = true;
}

Bucket.prototype.push = function (val) {
	this._values.push(val);
	return this;
};

function multimap() {
	return new MultiMap();
}

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.prettyXML = prettyXML;
function prettyXML(text) {
	var shift = ['\n']; // array of shifts
	var step = '  '; // 2 spaces
	var maxdeep = 100; // nesting level

	// initialize array with shifts //
	for (var _ix = 0; _ix < maxdeep; _ix++) {
		shift.push(shift[_ix] + step);
	}
	var ar = text.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/xmlns\:/g, "~::~xmlns:").replace(/xmlns\=/g, "~::~xmlns=").split('~::~'),
	    len = ar.length,
	    inComment = false,
	    deep = 0,
	    str = '',
	    ix = 0;

	for (ix = 0; ix < len; ix++) {
		// start comment or <![CDATA[...]]> or <!DOCTYPE //
		if (ar[ix].search(/<!/) > -1) {
			str += shift[deep] + ar[ix];
			inComment = true;
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
				inComment = false;
			}
		} else
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else
				// <elm></elm> //
				if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) && /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')) {
					str += ar[ix];
					if (!inComment) deep--;
				} else
					// <elm> //
					if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
						str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
					} else
						// <elm>...</elm> //
						if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
							str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
						} else
							// </elm> //
							if (ar[ix].search(/<\//) > -1) {
								str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
							} else
								// <elm/> //
								if (ar[ix].search(/\/>/) > -1) {
									str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
								} else
									// <? xml ... ?> //
									if (ar[ix].search(/<\?/) > -1) {
										str += shift[deep] + ar[ix];
									} else
										// xmlns //
										if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
											str += shift[deep] + ar[ix];
										} else {
											str += ar[ix];
										}
	}

	return str[0] == '\n' ? str.slice(1) : str;
}

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isQName = isQName;
exports.QName = QName;
function isQName(maybe) {
  return !!(maybe && maybe.__is_QName);
}

function QName(uri, name) {
  var prefix = /:/.test(name) ? name.replace(/:.+$/, "") : null;
  return {
    __is_QName: true,
    name: name,
    prefix: prefix,
    uri: uri
  };
}

var q = exports.q = QName;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;
exports.seq = seq;
exports.isSeq = isSeq;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;
function LazySeq(iterable) {
	this.iterable = isSeq(iterable) ? iterable.toArray() : iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function () {
	var ret = _isArray(this.iterable) ? this.iterable : Array.from(this.iterable);

	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	for (var i = 0, l = a.length; i < l; i++) {
		var x = a[i];
		if (_isArray(x)) {
			//  assume flat
			ret = ret.concat(x);
		} else if (isSeq(x)) {
			ret = ret.concat(x.toArray());
		} else {
			ret.push(x);
		}
	}
	return new LazySeq(ret);
};

LazySeq.prototype.toString = function () {
	return "[" + this.iterable + "]";
};

LazySeq.prototype.count = function () {
	return this.iterable.length;
};

LazySeq.prototype.toArray = function () {
	return Array.from(this.iterable);
};

Object.defineProperty(LazySeq.prototype, "size", {
	get: function get() {
		return this.count();
	}
});

function SeqIterator(iterable) {
	this.iter = _isIter(iterable) ? iterable : iterable[Symbol.iterator]();
}

SeqIterator.prototype["@@append"] = LazySeq.prototype.push;

SeqIterator.prototype["@@empty"] = function () {
	return new LazySeq();
};

var DONE = {
	done: true
};

SeqIterator.prototype.next = function () {
	var v = this.iter.next();
	if (v.done) return DONE;
	return v;
};

SeqIterator.prototype[Symbol.iterator] = function () {
	return this;
};

LazySeq.prototype[Symbol.iterator] = function () {
	return new SeqIterator(this.iterable);
};

function _isArray(a) {
	return !!(a && a.constructor == Array);
}

function _isIter(a) {
	return !!(a && typeof a.next == "function");
}

function seq() {
	for (var _len2 = arguments.length, a = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		a[_key2] = arguments[_key2];
	}

	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if (_isArray(x) || _isIter(x)) return new LazySeq(x);
	}
	var s = new LazySeq();
	if (a.length === 0) return s;
	return s.concat.apply(s, a);
}

function isSeq(a) {
	return !!(a && a.__is_Seq);
}

var Seq = exports.Seq = LazySeq;

var first = exports.first = function first(s) {
	return isSeq(s) ? _isArray(s.iterable) ? s.iterable[0] : _first(s.iterable) : s;
};

var undef = function undef(s) {
	return s === undefined || s === null;
};

function empty(s) {
	return isSeq(s) ? !s.count() : undef(s);
}

function exists(s) {
	return isSeq(s) ? !!s.count() : !undef(s);
}

function count(s) {
	return empty(s) ? 0 : isSeq(s) ? s.count() : undef(s) ? 0 : 1;
}

function insertBefore(s, pos, ins) {
	pos = first(pos);
	pos = pos === 0 ? 1 : pos - 1;
	var a = s.toArray();
	var n = a.slice(0, pos);
	if (isSeq(ins)) {
		n = n.concat(ins.toArray());
	} else {
		n.push(ins);
	}
	return seq(n.concat(a.slice(pos)));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	if ($arg === undefined) return seq();
	if (!isSeq($arg)) return $arg;
	if ($arg.size > 1) return error("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	if ($arg === undefined) return error("FORG0004");
	if (!isSeq($arg)) return $arg;
	if ($arg.size === 0) return error("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	if ($arg === undefined) return error("FORG0005");
	if (!isSeq($arg)) return $arg;
	if ($arg.size != 1) return error("FORG0005");
	return $arg;
}

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isIterable = isIterable;
exports.compose = compose;
exports.distinctCat$1 = distinctCat$1;
exports.cat = cat;
exports.drop = drop;
exports.take = take;
exports.forEach = forEach;
exports.filter = filter;
exports.distinctCat = distinctCat;
exports.foldLeft = foldLeft;
exports.transform = transform;
exports.into = into;
exports.range = range;

var _seq = require("./seq");

function isIterable(obj) {
    // FIXME is this acceptable?
    return !!obj && typeof obj != "string" && typeof obj[Symbol.iterator] === 'function';
} // very basic stuff, not really transducers but less code


function Singleton(val) {
    this.val = val;
}

Singleton.prototype.next = function () {
    if (this.val !== undefined) {
        var val = this.val;
        this.val = undefined;
        return { value: val };
    }
    return { done: true };
};

function _getIter(iterable) {
    return iterable === undefined ? new Singleton() : isIterable(iterable) ? iterable[Symbol.iterator]() : iterable.constructor == Object ? Object.entries(iterable)[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : new Singleton(iterable);
}

function compose() {
    for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
        funcs[_key] = arguments[_key];
    }

    var l = funcs.length;
    return function (v, i, iterable, z) {
        var reset = false,
            c = _append;
        for (var j = 0; j < l; j++) {
            var ret = reset ? z : funcs[j].call(null, v, i, iterable, z);
            if (ret === undefined) {
                reset = true;
                continue;
            }
            // if it's a step, continue processing
            if (ret["@@step"]) {
                v = ret.v;
                z = ret.z;
                c = ret.f;
                if (ret.t == i) return !reset ? step(z, v, c) : z;
            } else {
                // stop processing current iteration
                reset = true;
                z = ret;
            }
        }
        // append at the end
        //return !reset ? step(z, v, c) : z;
        return !reset ? step(z, v, c) : z;
    };
}

// TODO pass control function to the point where a value would be yielded
// use that to control a custom iterator
function _iterate(iterable, f, z) {
    if (z === undefined) z = _new(iterable);
    var i = 0;
    // iterate anything
    var iter = _getIter(iterable);
    var next = void 0;
    while (next = iter.next(), !next.done) {
        var v = next.value;
        var ret = f(v, i, iterable, z);
        if (ret !== undefined) {
            if (ret["@@step"]) {
                z = ret.f(ret.z, ret.v);
                if (ret.t == i) return z;
            } else {
                z = ret;
            }
        }
        i++;
    }
    return z;
}

function _new(iterable) {
    return iterable["@@empty"] ? iterable["@@empty"]() : new iterable.constructor();
}

// checkiecheckie
function _append(iterable, appendee) {
    if (iterable["@@append"]) {
        return iterable["@@append"](appendee);
    } else if (iterable.push) {
        var appended = iterable.push(appendee);
        // stateful stuff
        if (appended !== iterable) {
            return iterable;
        }
        return appended;
    } else if (iterable.set) {
        var _appended = iterable.set(appendee[0], appendee[1]);
        // stateful stuff
        if (_appended !== iterable) {
            return iterable;
        }
        return _appended;
    } else {
        return (0, _seq.seq)(appendee);
    }
    // badeet badeet bathatsallfolks!
}

// introduce a step so we can reuse _iterate for foldLeft
function step(z, v, f, t, d) {
    // we're going to process this further
    return {
        z: z,
        v: v,
        f: f,
        t: t,
        "@@step": true
    };
}

function _contains(iterable, value, comp) {
    // FIXME how to prevent iteration?
    var iter = _getIter(iterable);
    var next = void 0;
    while (next = iter.next(), !next.done) {
        if (next.value === value) return true;
    }
    return false;
}

function distinctCat$1(f) {
    // FIXME how to optimize?
    return function transDistinctCat(v, i, iterable, z) {
        return step(z, v, function (z, v) {
            return foldLeft(v, z, function (z, v) {
                if (f(z, v)) return _append(z, v);
                return z;
            });
        });
    };
}

function cat(v, i, iterable, z) {
    return step(z, v, function (z, v) {
        return foldLeft(v, z, _append);
    });
}

function forEach$1(f) {
    return function transForEach(v, i, iterable, z) {
        return step(z, f(v, i, iterable), _append);
    };
}

function filter$1(f) {
    return function transFilter(v, i, iterable, z) {
        if (f(v, i, iterable)) {
            return step(z, v, _append);
        }
        return z;
    };
}

function foldLeft$1(f, z) {
    return function transFoldLeft(v, i, iterable, z) {
        return f(z, v, i, iterable);
    };
}

function take$1(idx) {
    return function transTake(v, i, iterable, z) {
        if (i < idx) {
            return step(z, v, _append, idx);
        }
        return z;
    };
}

function drop$1(idx) {
    return function transDrop(v, i, iterable, z) {
        if (i >= idx) {
            return step(z, v, _append, -1);
        }
        return z;
    };
}

function drop(iterable, i) {
    if (arguments.length == 1) return drop$1(iterable);
    return _iterate(iterable, drop$1(i), _new(iterable));
}

function take(iterable, i) {
    if (arguments.length == 1) return take$1(iterable);
    return _iterate(iterable, take$1(i), _new(iterable));
}

function forEach(iterable, f) {
    if (arguments.length == 1) return forEach$1(iterable);
    return _iterate(iterable, forEach$1(f), _new(iterable));
}

function filter(iterable, f) {
    if (arguments.length == 1) return filter$1(iterable);
    return _iterate(iterable, filter$1(f), _new(iterable));
}

function distinctCat(iterable, f) {
    if (arguments.length < 2) return distinctCat$1(iterable || _contains);
    return _iterate(iterable, distinctCat$1(f), _new(iterable));
}

// non-composables!
function foldLeft(iterable, z, f) {
    return _iterate(iterable, foldLeft$1(f), z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
function transform(iterable, f) {
    return _iterate(iterable, f);
}

function into(iterable, f, z) {
    return _iterate(iterable, f, z);
}

function range(n) {
    var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var arr = [];
    for (var i = s; i < n; i++) {
        arr.push(i);
    }
    return (0, _seq.seq)(arr);
}

// TODO:
// rewindable/fastforwardable iterators

},{"./seq":12}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.validate = validate;
exports.validation = validation;

var _doc = require("./doc");

var _access = require("./access");

var _transducers = require("./transducers");

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(obj, prop) {
	if (obj.hasOwnProperty(prop)) return obj[prop];
}

function _formAttrNameToKey(k) {
	if (k == "data-type") return "type";
	if (k == "type") return "format";
	if (k == "min") return "minimum";
	if (k == "max") return "maximum";
	if (k == "maxlength") return "maxLength";
	return k;
}

function _formNodeToSchema(node) {
	var inode = node.inode;
	var attrs = inode.attributes;
	if (attrs.hidden || attrs.disabled) return;
	var s = {};
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = attrs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var a = _step.value;

			var k = _formAttrNameToKey(a.name);
			if (validator[k]) {
				s[k] = a.value;
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	if (inode.type == "select-one") {
		s.enum = (0, _transducers.into)(inode.options, (0, _transducers.forEach)(function (o) {
			return o.value;
		}), []);
	}
	return s;
}

/**
 * Validate a doc against a schema
 * @param {INode|VNode} doc The doc or VNode to validate
 * @param {any} schema A JSON schema with XML extension
 * @return {VNode} A document containing errors
 */
function validate(node, schema) {
	var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	node = node.inode ? node : _doc.ensureDoc.bind(this)(node);
	var depth = node.depth,
	    entries = [],
	    err = [],
	    index = "#",
	    path = "";
	if (params.form) {
		index = node.name;
		path = node.parent.name;
		schema = node.schema = _formNodeToSchema(node);
	}
	var entry = validation(schema, params, index, path, err);
	entry[0].call(null, node);
	//var errCount = [err.length];
	while (node) {
		node = (0, _access.nextNode)(node);
		if (!node) return err;
		if (params.form) {
			if (node.type == 17) continue;
			// prevent child schema if no parent schema
			node.schema = node.parent.schema && _formNodeToSchema(node);
			entry = validation(node.schema, params, node.name, path, err);
			if (entry) entry[0].call(null, node);
		} else {
			if (node.type == 17) {
				depth--;
				entry = entries[depth];
			} else if (node.depth == depth + 1) {
				entries[depth] = entry;
				depth++;
				if (!entry[1]) {
					console.log("skipping", node.name);
					continue;
				}
				entry = entry[1](node);
				if (entry) entry[0].call(null, node);
			} else if (node.depth == depth) {
				entry = entries[depth - 1];
				if (!entry[1]) {
					console.log("skipping", node.name);
					continue;
				}
				entry = entry[1].call(null, node);
				if (entry) entry[0].call(null, node);
			}
		}
	}
	return err;
}

function compose(funcs) {
	var len = funcs.length;
	return function (node) {
		var entries = [[], []];
		for (var i = 0; i < len; i++) {
			if (!funcs[i]) continue;
			var ret = funcs[i].call(null, node);
			if (ret && ret.length) {
				entries[0].push(ret[0]);
				entries[1].push(ret[1]);
			}
		}
		return [compose(entries[0]), compose(entries[1])];
	};
}

function validation(schema, params, index, path, err) {
	if (!schema) return;
	var sc = schema.constructor;
	var entry;
	if (sc === Object) {
		var keys = Object.keys(schema);
		var funcs = [];
		// TODO compose a function that will contain all rules for a level
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var k = _step2.value;

				if (!/properties|patternProperties|items/.test(k)) {
					if (!validator[k]) {
						console.log("Unsupported " + k);
						continue;
					}
					funcs.push(validator[k].bind(null, schema, k, params, index, path, err));
				}
			}
			// TODO what if there are more?
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var childFuncs = [];
		var _arr = ["properties", "patternProperties", "items"];
		for (var _i = 0; _i < _arr.length; _i++) {
			var _k = _arr[_i];
			var childSchema = get(schema, _k);
			if (childSchema) childFuncs.push(validator[_k].bind(null, schema, _k, params, index, path, err));
		}
		entry = [compose(funcs), compose(childFuncs)];
	} else if (sc === Array) {
		// an array of schemas to validate against, meaning at least one of the must match
		var _funcs = [];
		var _childFuncs = [];
		for (var i = 0, len = schema.length; i < len; i++) {
			var _entry = validation(schema[i], params, index, path, err);
			_funcs.push(_entry[0]);
			_childFuncs.push(_entry[1]);
		}
		entry = [compose(_funcs), compose(_childFuncs)];
	} else if (sc === String) {
		entry = [validator.type.bind(null, { type: schema }, "type", params, index, path, err)];
	}
	return entry;
}

function X(schema, key, path, validationMessage, faults) {
	this.schema = schema;
	this.key = key;
	this.path = path;
	this.validationMessage = validationMessage;
	this.faults = faults;
}

function x(schema, key, params, path, node, faults) {
	var validationMessage = params.form ? node.attr("validationMessage") : "";
	return new X(schema, key, path, validationMessage, faults);
}

// TODO types are functions, so allow adding custom functions
// TODO use XVType, coersion
var types = {
	null: function _null(node) {
		return node.type == 12 && node.value === null;
	},
	string: function string(node) {
		return node.type == 3;
	},
	number: function number(node) {
		return node.type == 12 && typeof node.value == "number" && !isNaN(node.value);
	},
	double: function double(node) {
		return node.type == 12 && typeof node.value == "number" && !isNaN(node.value);
	},
	boolean: function boolean(node) {
		return node.type == 12 && typeof node.value == "boolean";
	},
	integer: function integer(node) {
		var val = node.value;
		if (val === null || val === undefined) return false;
		var ret = false;
		try {
			if (val.constructor != _big2.default) val = new _big2.default(val);
			ret = (node.type == 3 || node.type == 12) && val.c.length - val.e === 1;
		} catch (err) {
			console.log(val, err);
		}
		return ret;
	},
	element: function element(node) {
		return node.type == 1;
	},
	array: function array(node) {
		return node.type == 5;
	},
	object: function object(node) {
		return node.type == 6;
	},
	map: function map(node) {
		return node.type == 6;
	}
};

var HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$/i;
//var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[a-f0-9]{2})*@)?(?:\[(?:(?:(?:(?:[a-f0-9]{1,4}:){6}|::(?:[a-f0-9]{1,4}:){5}|(?:[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){4}|(?:(?:[a-f0-9]{1,4}:){0,1}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){3}|(?:(?:[a-f0-9]{1,4}:){0,2}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){2}|(?:(?:[a-f0-9]{1,4}:){0,3}[a-f0-9]{1,4})?::[a-f0-9]{1,4}:|(?:(?:[a-f0-9]{1,4}:){0,4}[a-f0-9]{1,4})?::)(?:[a-f0-9]{1,4}:[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[a-f0-9]{1,4}:){0,5}[a-f0-9]{1,4})?::[a-f0-9]{1,4}|(?:(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4})?::)|[Vv][a-f0-9]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[a-f0-9]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[a-f0-9]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[a-f0-9]{2})*)?$/i;
//var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[a-f0-9]{2})*@)?(?:\[(?:(?:(?:(?:[a-f0-9]{1,4}:){6}|::(?:[a-f0-9]{1,4}:){5}|(?:[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){4}|(?:(?:[a-f0-9]{1,4}:){0,1}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){3}|(?:(?:[a-f0-9]{1,4}:){0,2}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){2}|(?:(?:[a-f0-9]{1,4}:){0,3}[a-f0-9]{1,4})?::[a-f0-9]{1,4}:|(?:(?:[a-f0-9]{1,4}:){0,4}[a-f0-9]{1,4})?::)(?:[a-f0-9]{1,4}:[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[a-f0-9]{1,4}:){0,5}[a-f0-9]{1,4})?::[a-f0-9]{1,4}|(?:(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4})?::)|[Vv][a-f0-9]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[a-f0-9]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@\/?]|%[a-f0-9]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'"()*+,;=:@\/?]|%[a-f0-9]{2})*)?$/i;
// uri-template: https://tools.ietf.org/html/rfc6570
var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[a-f0-9]{2})|\{[+#.\/;?&=,!@|]?(?:[a-z0-9_]|%[a-f0-9]{2})+(?:\:[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[a-f0-9]{2})+(?:\:[1-9][0-9]{0,3}|\*)?)*\})*$/i;
// For the source: https://gist.github.com/dperini/729294
// For test cases: https://mathiasbynens.be/demo/url-regex
// @todo Delete current URL in favour of the commented out URL rule when this issue is fixed https://github.com/eslint/eslint/issues/7983.
// var URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
var URL = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
var UUID = /^(?:urn\:uuid\:)?[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
var JSON_POINTER = /^(?:\/(?:[^~\/]|~0|~1)*)*$|^\#(?:\/(?:[a-z0-9_\-\.!$&'()*+,;:=@]|%[a-f0-9]{2}|~0|~1)*)*$/i;
var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:\#|(?:\/(?:[^~\/]|~0|~1)*)*)$/;

var formats = {
	// date: http://tools.ietf.org/html/rfc3339#section-5.6
	date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
	// date-time: http://tools.ietf.org/html/rfc3339#section-5.6
	time: /^[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i,
	"date-time": /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
	// uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
	uri: /^(?:[a-z][a-z0-9+-.]*)(?:\:|\/)\/?[^\s]*$/i,
	"uri-reference": /^(?:(?:[a-z][a-z0-9+-.]*:)?\/\/)?[^\s]*$/i,
	"uri-template": URITEMPLATE,
	url: URL,
	// email (sources from jsen validator):
	// http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
	// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
	email: /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
	hostname: HOSTNAME,
	// optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
	ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
	// optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
	ipv6: /^\s*(?:(?:(?:[a-f0-9]{1,4}:){7}(?:[a-f0-9]{1,4}|:))|(?:(?:[a-f0-9]{1,4}:){6}(?::[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[a-f0-9]{1,4}:){5}(?:(?:(?::[a-f0-9]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[a-f0-9]{1,4}:){4}(?:(?:(?::[a-f0-9]{1,4}){1,3})|(?:(?::[a-f0-9]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){3}(?:(?:(?::[a-f0-9]{1,4}){1,4})|(?:(?::[a-f0-9]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){2}(?:(?:(?::[a-f0-9]{1,4}){1,5})|(?:(?::[a-f0-9]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){1}(?:(?:(?::[a-f0-9]{1,4}){1,6})|(?:(?::[a-f0-9]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[a-f0-9]{1,4}){1,7})|(?:(?::[a-f0-9]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
	regex: regex,
	// uuid: http://tools.ietf.org/html/rfc4122
	uuid: UUID,
	// JSON-pointer: https://tools.ietf.org/html/rfc6901
	// uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
	"json-pointer": JSON_POINTER,
	// relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
	"relative-json-pointer": RELATIVE_JSON_POINTER
};

var Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
	if (Z_ANCHOR.test(str)) return false;
	try {
		new RegExp(str);
		return true;
	} catch (e) {
		return false;
	}
}

var validator = {
	value: function value(schema, key, params, index, path, err, node) {
		if (params.form) {
			if (!node.inode.checkValidity()) {
				err.push(x(schema, key, params, path + "/" + index, node));
			}
		}
	},
	type: function type(schema, key, params, index, path, err, node) {
		var type = schema[key];
		var ret;
		if (type instanceof Array) {
			ret = (0, _transducers.foldLeft)((0, _transducers.forEach)(type, function (t) {
				return types[t](node);
			}), false, function (r, z) {
				return r || z;
			});
		} else {
			ret = types[type](node);
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	format: function format(schema, key, params, index, path, err, node) {
		var name = schema[key];
		var format = params.formats ? params.formats[name] : formats[name];
		if (!format) {
			console.log("Unknown format " + name);
		} else {
			var fn = typeof format == "function" ? format : function (v) {
				return !!v.match(format);
			};
			if (!fn(node.value)) err.push(x(schema, key, params, path + "/" + index, node));
		}
	},
	required: function required(schema, key, params, index, path, err, node) {
		// for forms:
		if (params.form) {
			if (!node.value) err.push(x(schema, key, params, path + "/" + index, node));
		}
	},
	properties: function properties(schema, key, params, index, path, err, node) {
		// default is allErrors=true, so all children should be validated
		// this function will be passed to the children matching key + schema
		// when applied, the function uses the matching prop and updated path
		var props = schema[key];
		schema = get(props, node.name);
		if (schema) return validation(schema, params, node.name, path + "/" + index, err);
	},
	patternProperties: function patternProperties(schema, key, params, index, path, err, node) {
		var pattProps = get(schema, key);
		var patterns;
		if (pattProps) {
			patterns = get(schema, "patternPropertiesREGEXP");
			if (!patterns) {
				patterns = {};
				for (var k in pattProps) {
					patterns[k] = new RegExp(k);
				}
				schema.patternPropertiesREGEXP = patterns;
			}
		}
		var patternMatcher = function patternMatcher(key) {
			var ret = [];
			for (var k in patterns) {
				if (patterns[k].test(key)) ret.push(pattProps[k]);
			}
			return ret;
		};
		var newpath = path + "/" + index;
		var schemas = patternMatcher(node.name);
		if (schemas.length) return validation(schemas, params, node.name, newpath, err);
	},
	additionalProperties: function additionalProperties(schema, key, params, index, path, err, node) {
		var additionalProps = get(schema, key);
		if (additionalProps === false) {
			var props = get(schema, "properties");
			var pattProps = get(schema, "patternProperties");
			var patterns;
			if (pattProps) {
				patterns = get(schema, "patternPropertiesREGEXP");
				if (!patterns) {
					patterns = {};
					for (var k in pattProps) {
						patterns[k] = new RegExp(k);
					}
					schema.patternPropertiesREGEXP = patterns;
				}
			}
			var patternMatcher = function patternMatcher(key) {
				for (var k in patterns) {
					if (patterns[k].test(key)) return true;
				}
				return false;
			};
			var faults = [];
			var newpath = path + "/" + index;
			var keys = node.keys();
			var len = node.count();
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _k2 = _step3.value;

					if (props[_k2] || patternMatcher(_k2)) {
						len--;
					} else {
						faults.push(_k2);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			if (len > 0) err.push(x(schema, key, params, newpath, node, faults));
		}
	},
	items: function items(schema, key, params, index, path, err, node) {
		var schemas = schema[key];
		var newpath = path + "/" + index;
		schema = schemas[node.indexInParent];
		if (schema) return validation(schema, params, node.name, newpath, err);
	},
	additionalItems: function additionalItems(schema, key, params, index, path, err, node) {
		//var additionalItems = schema[key];
		var items = schema.items;
		if (items.length !== node.count()) err.push(x(schema, key, params, path + "/" + index, node));
	},
	minimum: function minimum(schema, key, params, index, path, err, node) {
		var test = schema[key];
		var ret = false;
		if (node.value && node.value.constructor == _big2.default) {
			ret = node.value.gte(test);
		} else {
			ret = node.value >= test;
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	maximum: function maximum(schema, key, params, index, path, err, node) {
		var test = schema[key];
		var ret = false;
		if (node.value && node.value.constructor == _big2.default) {
			ret = node.value.lte(test);
		} else {
			ret = node.value <= test;
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	maxLength: function maxLength(schema, key, params, index, path, err, node) {
		var test = schema[key];
		if (!node.value) return;
		if (node.value.length >= test) err.push(x(schema, key, params, path + "/" + index, node));
	}
};

},{"./access":2,"./doc":3,"./transducers":13,"big.js":1}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.VNode = VNode;

var _access = require("./access");

function VNode(cx, inode, type, name, value, parent, depth, indexInParent, cache) {
	this.cx = cx;
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth | 0;
	this.indexInParent = indexInParent;
	this.cache = cache;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function () {
	return this.cx.stringify(this.inode);
};

VNode.prototype.count = function () {
	if (typeof this.inode == "function") return 0;
	return this.cx.count(this.inode);
};

VNode.prototype.keys = function () {
	var cache = this.cache || this.cx.cached(this.inode, this.type);
	if (cache) return cache.keys();
	return this.cx.keys(this.inode, this.type);
};

VNode.prototype.values = function () {
	return this.cx.values(this.inode, this.type);
};

VNode.prototype.first = function () {
	return this.cx.first(this.inode, this.type);
};

VNode.prototype.last = function () {
	return this.cx.last(this.inode, this.type);
};

VNode.prototype.next = function (node) {
	return this.cx.next(this.inode, node, this.type);
};

VNode.prototype.push = function (child) {
	this.inode = this.cx.push(this.inode, [child.name, child.inode], this.type);
	return this;
};

VNode.prototype.set = function (key, val) {
	this.inode = this.cx.set(this.inode, key, val, this.type);
	return this;
};

VNode.prototype.removeChild = function (child) {
	this.inode = this.cx.removeChild(this.inode, child, this.type);
	return this;
};

VNode.prototype.finalize = function () {
	this.inode = this.cx.finalize(this.inode);
	return this;
};

VNode.prototype.attrEntries = function () {
	return this.cx.attrEntries(this.inode);
};

VNode.prototype.attr = function (k, v) {
	if (arguments.length == 1) return this.cx.getAttribute(this.inode, k);
	if (arguments.length === 0) {
		this.inode = this.cx.clearAttributes(this.inode);
	} else {
		this.inode = this.cx.setAttribute(this.inode, k, v);
	}
	return this;
};

VNode.prototype.modify = function (node, ref) {
	this.inode = this.cx.modify(this.inode, node, ref, this.type);
	return this;
};

// hitch this on VNode for reuse
VNode.prototype.vnode = function (inode, parent, depth, indexInParent) {
	return this.cx.vnode(inode, parent, depth, indexInParent);
};

VNode.prototype.ivalue = function (type, name, value) {
	return this.cx.ivalue(type, name, value);
};

VNode.prototype.emptyINode = function (type, name, attrs, ns) {
	return this.cx.emptyINode(type, name, attrs, ns);
};

VNode.prototype.emptyAttrMap = function (init) {
	return this.cx.emptyAttrMap(init);
};

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function () {
	return new _access.VNodeIterator(this.values()[Symbol.iterator](), this, this.cx.vnode);
};

VNode.prototype.get = function (idx) {
	var val = this.cx.get(this.inode, idx, this.type, this.cache);
	if (!val) return [];
	//val = val.next || val.constructor == Array ? val : [val];
	//console.log(val[Symbol.iterator]());
	return new _access.VNodeIterator(val.next ? val : val[Symbol.iterator](), this, this.cx.vnode);
};

},{"./access":2}]},{},[8])(8)
});