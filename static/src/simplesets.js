// Set code for Node.js, which stores objects in arrays. All sets are
// mutable, and set update operations happen destructively. However,
// operations like set intersection and difference create a new set.

var SetPrototype = {
    // Does this set contain an element x? Returns true or false.
    has: function(x) {
	return this._items.indexOf(x) >= 0;
    },

    // Add an element x to this set, and return this set.
    add: function(x) {
	if (!this.has(x)) this._items.push(x);
	return this;
    },

    // Remove an element x from this set, if it is part of the set. If
    // it is not part of the set, do nothing. Returns this set.
    remove: function(x) {
	var pos = this._items.indexOf(x);
	if (pos >= 0) {
	    this._items.splice(pos, 1);
	}
	return this;
    },

    // Return a new set containing the items found in either this set,
    // the other set, or both.
    union: function(other) {
	var result = new exports.Set();
	result._items = this._items.concat(); // Make a copy
	for (var i = 0; i < other._items.length; i++)
	    result.add(other._items[i]);
	return result;
    },

    // Return a new set containing the items found in both this set
    // and the other set.
    intersection: function(other) {
	var result = new exports.Set();
	for (var i = 0; i < other._items.length; i++)
	    if (this.has(other._items[i]))
		result._items.push(other._items[i]);
	return result;
    },

    // Return a new set containing the items in this set that are not
    // in the other set.
    difference: function(other) {
	var result = new exports.Set();
	for (var i = 0; i < this._items.length; i++)
	    if (!other.has(this._items[i]))
		result._items.push(this._items[i]);
	return result;
    },

    // Return a new set containing the items in either this set or the
    // other set, but not both.
    symmetric_difference: function(other) {
	// Hideously inefficient -- but who uses this function, anyway?
	return this.union(other).difference(this.intersection(other));
    },

    // Return true if every element of this set is in the other set.
    issubset: function(other) {
	for (var i = 0; i < this._items.length; i++)
	    if (!other.has(this._items[i]))
		return false;
	return true;
    },

    // Return true if every element of the other is in this set.
    issuperset: function(other) {
	return other.issubset(this);
    },

    // Return a copy of the items in the set, as an array.
    array: function() {
	return this._items.concat();
    },

    // Return the size of the set.
    size: function() {
	return this._items.length;
    },

    // Return a shallow copy of the set.
    copy: function() {
	var result = new exports.Set();
	result._items = this._items.concat();
	return result;
    },

    // Return a random element of the set, or null if the set is
    // empty. Unlike pop, does not remove the element from the set.
    pick: function() {
	if (this._items.length === 0) return null;

	var i = Math.floor(Math.random() * this._items.length);
	return this._items[i];
    },

    // Remove and return a random element of the set, or null if the
    // set is empty.
    pop: function() {
	if (this._items.length === 0) return null;

	var i = Math.floor(Math.random() * this._items.length);
	return this._items.splice(i, 1)[0];
    },

    // Return true if this set equals another set, i.e. if every
    // element in each set is equal to an element in the other set.
    equals: function(other) {
	// Common case: sets are different size.
	if (this.size() !== other.size()) return false;

	
	// If sets are the same size, we can just check to see that
	// every element in this set corresponds to an element in the
	// other set.
	for (var i = 0; i < this._items.length; i++)
	    if (!other.has(this._items[i]))
		return false;
	return true;
    },

    // Call a callback function on each element of the set. If the set
    // is changed by the callback, the results are undefined.
    // Callback takes the same parameters as the forEach method of
    // arrays:  value, index, set
    // Takes an optional parameter that sets what this is bound to.
    each: function(callback, thisArg) {
	// If there's no callback, don't bother.
	if (!callback) return;
	
	if (thisArg) {
	    callback = callback.bind(thisArg);
	}

	for (var i = 0; i < this._items.length; i++)
	    callback(this._items[i], i, this);
    }
};

var Set = function(items) {
    // All items are stored in this list, in no particular order.
    this._items = [];

    // If initial items were given, add them to the set.
    if (typeof items !== "undefined")
	for (var i = 0; i < items.length; i++)
	    this.add(items[i]);
};

Set.prototype = SetPrototype;