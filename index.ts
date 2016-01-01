


/**
 * Deep copy an object (make copies of all its object properties, sub-properties, etc.)
 * An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
 * that doesn't break if the constructor has required parameters
 * 
 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
 * 
 * (dav: solution copied from here: http://stackoverflow.com/a/13333781)
 */
function deepClone(src, /* INTERNAL */ _visited?) {
    if (src == null || typeof (src) !== 'object') {
        return src;
    }

    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined) {
        _visited = [];
    }
    // Otherwise, ensure src has not already been visited
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




let checkNotNull = (x: any, msg?: string): any => {
    if (x || typeof x === "number" || typeof x === "string" || typeof x === "boolean") {
        return x;
    } else {
        let newMsg = msg ? msg : "Found null/undefined value: ";
        throw new Error(newMsg + x);
    }
}

let checkArgument = (x: boolean, msg?: string): any => {
    checkNotNull(x);
    if (x) {
        return x;
    } else {
        let newMsg = msg ? msg : "Found false argument!";
        throw new Error(newMsg);
    }
}

/**
 * Checks plain javascript equality with ===
 */

let checkEquals = (x: any, y: any, msg?: string): any => {
    if (x === y) {
        return x;
    } else {
        let newMsg = msg ? msg : "x !== y ! x was :" + x + " and y was: " + y;
        throw new Error(newMsg);
    }
}

/**
 * Checks provided array or string is not empty
 */
let checkNotEmpty = (obj: Array<any> | string, msg?: string): any => {

    checkNotNull(obj);

    if (typeof obj === "string" || Array.isArray(obj)) {
        if (obj.length > 0) {
            return obj;
        } else {
            let newMsg = msg ? msg : "Provided parameter is not empty! :" + obj;
            throw new Error(newMsg);
        }
    } else {
        throw new Error("Provided param is not an Array nor a string! " + obj);
    }
}


/**
 * <P> the fields of the class. P should be an interface with all optional fields. 
 */
interface Immutable<P> {

    /**
     * @throws Error if check fails.
     */
    check(): this;
	
    /**
     * Returns a shallow clone merging in the result the provided fields.
     */
    "with"(fields: P): this;

}


/**
 * Returns a new shallow copy of obj merging inside it the provided fields.
 */
let wither = <P, C extends Immutable<{}>>(properties: P, obj: C): C => {
    checkNotNull(properties);
    if (Object.keys(properties).length === 0) {
        return obj;
    } else {
        let ret = deepClone(obj); // todo should be shallow ...
        for (let key of Object.keys(properties)) {
            ret[key] = properties[key];
        }
        return ret.check();
    }
}

/**
 * 
 */
function of<P, C extends Immutable<{}>>(empty: C, properties?: P): C {
    if (properties) {
        return <any>empty.with(properties);
    } else {
        return empty;
    }

}



/**
 * Example of parameters
 */
interface MyImmFields {
    x?: string;
    y?: number;

}

/**
 * Example of immutable class. 
 */
class MyImm implements Immutable<MyImmFields>, MyImmFields {

    private static DEFAULT = new MyImm();    

    /**
     * Shows we can have a get property if we want to
     */
    get x() {
        return this._x;
    }

    /** Avoid calling this directly, use {@link of} method instead.
     * (Constructor can't be private in Typescript)
     */
    constructor(
        private _x = "a",
        public y = 3) {

        this.check();
    }

    check() {
        checkArgument(this.y > 2);
        return this;
    }

    static of(properties?: MyImmFields) {
        return of(MyImm.DEFAULT, properties);
    }

    /** 
     * Note we currently need to manually add the 'this' as strangely 
     * enough Typescript doesn't infer the type. 
    */
    with(properties?: MyImmFields): this {
        return wither(properties, this);
    }

    trial() {	        
        //return this.check();
        return this.with({ x: "a" });
    };

}



let toText = (obj: any) => {
    if (typeof obj === "string"
        || typeof obj === "number"
        || typeof obj === "date") {
        return obj.toString();
    } else {
        return JSON.stringify(obj);
    }
}


/**
 * Admits only 3 letter lowercase color strings like #3fc
 */
let checkColor = (colorString: string) => {
    checkNotNull(colorString);
    checkEquals(colorString.length, 4);
    checkEquals(colorString.charAt(0), '#');
    for (let i = 1; i < colorString.length; i++) {
        let c = colorString.charAt(i);
        if (isNaN(+c) && c === c.toUpperCase()) {
            throw new Error("We admit only lowercase characters in color strings! Found instead: '" + c + "' in " + colorString);
        }
    }
}




   
    const BITMASK : number[] = [];
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
class BitSeq {
    _bytes : Uint8Array;
    get length(){
        return this._bytes.length; 
    }    
    constructor(nbits : number){
        checkArgument(nbits  >= 0, "Number of bits must be positive!");
        
        let nbytes = (nbits / 8) + 1; 
        
        var buffer = new ArrayBuffer(nbytes);
        this._bytes = new Uint8Array(buffer);         
    }

    /**
     * Sets the ith bit in the array
     */
    bit(i : number, b? : boolean);

    /**
     * Returns the ith bit in the array
     */
    bit(i : number) : boolean;/* {
              

    }*/
    
    /**
     * Gets or sets the bit at the ith position.
     * @param b if it is a boolean, the ith bit is set to this value 
     */
    public bit(i : number, b? : boolean): any 
    {
        let bytePos = i / 8;
        let bitInBytePos = i % 8;
        
        if (typeof b === "boolean"){
            this._bytes[bytePos] = this._bytes[bytePos] | BITMASK[bitInBytePos];
        } else {
            return (this._bytes[bytePos] & BITMASK[bitInBytePos]) > 0;            
        } 
    }
    
   public eq(bs : BitSeq) : boolean {
       for (let i = 0; i < bs._bytes.length; i++){
           if (this._bytes[i] !== bs._bytes[i]){
               return false;
           }
       }
       return true;
   }
}

let drawMatrix = (m : BitSeq) => {

}

interface Op {
    
    op(m : BitSeq) : BitSeq;
    
    inv(m : BitSeq) : BitSeq;
}


class Not implements Op {
    
    private static DEFAULT = new Not();
    
    op(m : BitSeq) : BitSeq {
        for (var i = 0; i < m.length; i++){
            m.bit(~m.bit(i));
        }   
        return m;
    }
    
    inv(bs : BitSeq) : BitSeq  {
        return this.op(bs);
    }
    
    static of() : Not{
        return Not.DEFAULT;
    }
}

let checkInvertible = (op : Op)=>{
    
}

module debug {

}

let load = ()=>{
    var buffer = new ArrayBuffer(3);
    var arr = new Uint8Array(buffer);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = i;
        console.log(" arr[i] = ", arr[i]);
    }
    
    let not = Not.of();
    let bs = new BitSeq(2);
    checkArgument(bs.eq(bs));
    
    let bs1 = new BitSeq(2);
    checkEquals(bs1.bit(0), false);
    bs1.bit(0, true);
    checkEquals(bs1.bit(0), true);
    
    let bs2 = new BitSeq(2);
    
    
    checkArgument(not.inv(not.op(bs)).eq(bs));
    
    console.log("tests passed");
}

load();    


/*
if (["window"]){
    window.addEventListener("load", function() {
        load();

    });    
} else {
    
}

*/