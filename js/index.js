/**
 * Deep copy an object (make copies of all its object properties, sub-properties, etc.)
 * An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
 * that doesn't break if the constructor has required parameters
 *
 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
 *
 * (dav: solution copied from here: http://stackoverflow.com/a/13333781)
 */
function deepClone(src, /* INTERNAL */ _visited) {
    if (src == null || typeof (src) !== 'object') {
        return src;
    }
    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined) {
        _visited = [];
    }
    else {
        var i, len = _visited.length;
        for (i = 0; i < len; i++) {
            // If src was already visited, don't try to copy it, just return the reference
            if (src === _visited[i]) {
                return src;
            }
        }
    }
    // Add this object to the visited array
    _visited.push(src);
    //Honor native/custom clone methods
    if (typeof src.clone == 'function') {
        return src.clone(true);
    }
    //Special cases:
    //Array
    if (Object.prototype.toString.call(src) == '[object Array]') {
        //[].slice(0) would soft clone
        ret = src.slice();
        var i = ret.length;
        while (i--) {
            ret[i] = deepClone(ret[i], _visited);
        }
        return ret;
    }
    //Date
    if (src instanceof Date) {
        return new Date(src.getTime());
    }
    //RegExp
    if (src instanceof RegExp) {
        return new RegExp(src);
    }
    //DOM Elements
    if (src.nodeType && typeof src.cloneNode == 'function') {
        return src.cloneNode(true);
    }
    //If we've reached here, we have a regular object, array, or function
    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src) : src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
    }
    var ret = Object.create(proto);
    for (var key in src) {
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = deepClone(src[key], _visited);
    }
    return ret;
}
var checkNotNull = function (x, msg) {
    if (x || typeof x === "number" || typeof x === "string" || typeof x === "boolean") {
        return x;
    }
    else {
        var newMsg = msg ? msg : "Found null/undefined value: ";
        throw new Error(newMsg + x);
    }
};
var checkArgument = function (x, msg) {
    checkNotNull(x);
    if (x) {
        return x;
    }
    else {
        var newMsg = msg ? msg : "Found false argument!";
        throw new Error(newMsg);
    }
};
/**
 * Checks plain javascript equality with ===
 */
var checkEquals = function (x, y, msg) {
    if (x === y) {
        return x;
    }
    else {
        var newMsg = msg ? msg : "x !== y ! x was :" + x + " and y was: " + y;
        throw new Error(newMsg);
    }
};
/**
 * Checks provided array or string is not empty
 */
var checkNotEmpty = function (obj, msg) {
    checkNotNull(obj);
    if (typeof obj === "string" || Array.isArray(obj)) {
        if (obj.length > 0) {
            return obj;
        }
        else {
            var newMsg = msg ? msg : "Provided parameter is not empty! :" + obj;
            throw new Error(newMsg);
        }
    }
    else {
        throw new Error("Provided param is not an Array nor a string! " + obj);
    }
};
/**
 * Returns a new shallow copy of obj merging inside it the provided fields.
 */
var wither = function (properties, obj) {
    checkNotNull(properties);
    if (Object.keys(properties).length === 0) {
        return obj;
    }
    else {
        var ret = deepClone(obj); // todo should be shallow ...
        for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
            var key = _a[_i];
            ret[key] = properties[key];
        }
        return ret.check();
    }
};
/**
 *
 */
function of(empty, properties) {
    if (properties) {
        return empty.with(properties);
    }
    else {
        return empty;
    }
}
/**
 * Example of immutable class.
 */
var MyImm = (function () {
    /** Avoid calling this directly, use {@link of} method instead.
     * (Constructor can't be private in Typescript)
     */
    function MyImm(_x, y) {
        if (_x === void 0) { _x = "a"; }
        if (y === void 0) { y = 3; }
        this._x = _x;
        this.y = y;
        this.check();
    }
    Object.defineProperty(MyImm.prototype, "x", {
        /**
         * Shows we can have a get property if we want to
         */
        get: function () {
            return this._x;
        },
        enumerable: true,
        configurable: true
    });
    MyImm.prototype.check = function () {
        checkArgument(this.y > 2);
        return this;
    };
    MyImm.of = function (properties) {
        return of(MyImm.DEFAULT, properties);
    };
    /**
     * Note we currently need to manually add the 'this' as strangely
     * enough Typescript doesn't infer the type.
    */
    MyImm.prototype.with = function (properties) {
        return wither(properties, this);
    };
    MyImm.prototype.trial = function () {
        //return this.check();
        return this.with({ x: "a" });
    };
    ;
    MyImm.DEFAULT = new MyImm();
    return MyImm;
})();
var toText = function (obj) {
    if (typeof obj === "string"
        || typeof obj === "number"
        || typeof obj === "date") {
        return obj.toString();
    }
    else {
        return JSON.stringify(obj);
    }
};
/**
 * Admits only 3 letter lowercase color strings like #3fc
 */
var checkColor = function (colorString) {
    checkNotNull(colorString);
    checkEquals(colorString.length, 4);
    checkEquals(colorString.charAt(0), '#');
    for (var i = 1; i < colorString.length; i++) {
        var c = colorString.charAt(i);
        if (isNaN(+c) && c === c.toUpperCase()) {
            throw new Error("We admit only lowercase characters in color strings! Found instead: '" + c + "' in " + colorString);
        }
    }
};
var BITMASK = [];
BITMASK[0] = 0x1;
BITMASK[1] = 0x2;
BITMASK[2] = 0x4;
BITMASK[3] = 0x8;
BITMASK[4] = 0x16;
BITMASK[5] = 0x32;
BITMASK[6] = 0x64;
BITMASK[7] = 0x128;
/**
 * A slightly prematurely optimized sequence of bits. Worse, it is mutable.
 */
var BitSeq = (function () {
    function BitSeq(nbits) {
        checkArgument(nbits >= 0, "Number of bits must be positive!");
        var nbytes = (nbits / 8) + 1;
        var buffer = new ArrayBuffer(nbytes);
        this._bytes = new Uint8Array(buffer);
    }
    Object.defineProperty(BitSeq.prototype, "length", {
        get: function () {
            return this._bytes.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets or sets the bit at the ith position.
     * @param b if it is a boolean, the ith bit is set to this value
     */
    BitSeq.prototype.bit = function (i, b) {
        var bytePos = i / 8;
        var bitInBytePos = i % 8;
        if (typeof b === "boolean") {
            this._bytes[bytePos] = this._bytes[bytePos] | BITMASK[bitInBytePos];
        }
        else {
            return (this._bytes[bytePos] & BITMASK[bitInBytePos]) > 0;
        }
    };
    BitSeq.prototype.eq = function (bs) {
        for (var i = 0; i < bs._bytes.length; i++) {
            if (this._bytes[i] !== bs._bytes[i]) {
                return false;
            }
        }
        return true;
    };
    return BitSeq;
})();
var drawMatrix = function (m) {
};
var Not = (function () {
    function Not() {
    }
    Not.prototype.op = function (m) {
        for (var i = 0; i < m.length; i++) {
            m.bit(~m.bit(i));
        }
        return m;
    };
    Not.prototype.inv = function (bs) {
        return this.op(bs);
    };
    Not.of = function () {
        return Not.DEFAULT;
    };
    Not.DEFAULT = new Not();
    return Not;
})();
var checkInvertible = function (op) {
};
var load = function () {
    var buffer = new ArrayBuffer(3);
    var arr = new Uint8Array(buffer);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = i;
        console.log(" arr[i] = ", arr[i]);
    }
    var not = Not.of();
    var bs = new BitSeq(2);
    checkArgument(bs.eq(bs));
    var bs1 = new BitSeq(2);
    checkEquals(bs1.bit(0), false);
    bs1.bit(0, true);
    checkEquals(bs1.bit(0), true);
    var bs2 = new BitSeq(2);
    checkArgument(not.inv(not.op(bs)).eq(bs));
    console.log("tests passed");
};
load();
/*
if (["window"]){
    window.addEventListener("load", function() {
        load();

    });
} else {
    
}

*/ 
//# sourceMappingURL=index.js.map