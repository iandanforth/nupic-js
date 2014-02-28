/**
 * @author Ian Danforth <iandanforth@gmail.com>
 */

/*********************************/
// TODO - Find a better place for these

// JAVASCRIPT MOD BUG FIX
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

// http://www.codinghorror.com/blog/2007/12/the-danger-of-naivete.html
function shuffle(arr) {
        var i, temp, j, len = arr.length;
        for (i = 0; i < len; i++) {
                j = ~~(Math.random() * (i + 1));
                temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
        }
        return arr;
}

function arrayMean(arr) {
    // Returns the sum of an array of numbers
    var sum = 0;
    for(var i = 0; i < arr.length; i++){
        sum += arr[i];
    };
    
    return sum / arr.length;
}

function arrayProduct(arr) {
    //Returns the product of the values in an array
    var prod = 1
    for (var i = 0; i < arr.length; i += 1) {
        prod *= arr[i];
    };
    return prod;
}

function defaultFor(arg, val) {
    return typeof arg !== 'undefined' ? arg : val;
}

function nDto1D(mat, dimCount) {
    // Returns a 1 dimensional array extracted from mat based on dimCount
    // Within a dimension all arrays must be of equal length.
    var oneDArray = [];
    if (dimCount == 1) {
        oneDArray = mat;
    } else if (dimCount == 2) {
        var oneDArray = [];
        for (var i = 0; i < mat.length; i++) {
            for (var j = 0; j < mat[0].length; j++) {
                oneDArray.push(mat[i][j]);
            };
        };
        return oneDArray;
    } else if (dimCount == 3) {
        var oneDArray = [];
        for (var i = 0; i < mat.length; i++) {
            for (var j = 0; j < mat[0].length; j++) {
                for (var k = 0; k < mat[0][0].length; k++) {
                    oneDArray.push(mat[i][j][k]);
                };
            };
        };
    } else {
      throw "Input Error: Inputs must have 1, 2 or 3 dimensions.";
    };
    
    return oneDArray;
}

function Comparator( a, b ) {
    
    if (a[1] < b[1]) {
        return -1;
    } else if (a[1] > b[1]) {
        return 1;
    };
    return 0;
};

function ComparatorReversed( a, b ) {
    
    if (a[1] > b[1]) {
        return -1;
    } else if (a[1] < b[1]) {
        return 1;
    };
    return 0;
};

/*********************************/

var SpatialPooler = function( inputDimensions,
			      columnDimensions,
			      potentialRadius,
			      potentialPct,
			      globalInhibition,
			      localAreaDensity,
			      numActiveColumnsPerInhArea,
			      stimulusThreshold,
			      synPermInactiveDec,
			      synPermActiveInc,
			      synPermConnected,
			      minPctOverlapDutyCycle,
			      minPctActiveDutyCycle,
			      dutyCyclePeriod,
			      maxBoost,
			      seed,
			      spVerbosity,
			      addNoise ) {
    /*************************************************************
    Parameters:
    ----------------------------
    inputDimensions:      A number, list or numpy array representing the 
                          dimensions of the input vector. Format is [height, 
                          width, depth, ...], where each value represents the 
                          size of the dimension. For a topology of one dimesion 
                          with 100 inputs use 100, or [100]. For a two 
                          dimensional topology of 10x5 use [10,5]. 
    columnDimensions:     A number, list or numpy array representing the 
                          dimensions of the columns in the region. Format is 
                          [height, width, depth, ...], where each value 
                          represents the size of the dimension. For a topology 
                          of one dimesion with 2000 columns use 2000, or 
                          [2000]. For a three dimensional topology of 32x64x16 
                          use [32, 64, 16]. 
    potentialRadius:      This parameter deteremines the extent of the input 
                          that each column can potentially be connected to. 
                          This can be thought of as the input bits that
                          are visible to each column, or a 'receptiveField' of 
                          the field of vision. A large enough value will result 
                          in the 'global coverage', meaning that each column 
                          can potentially be connected to every input bit. This 
                          parameter defines a square (or hyper square) area: a 
                          column will have a max square potential pool with 
                          sides of length 2 * potentialRadius + 1. 
    potentialPct:         The percent of the inputs, within a column's
                          potential radius, that a column can be connected to. 
                          If set to 1, the column will be connected to every 
                          input within its potential radius. This parameter is 
                          used to give each column a unique potential pool when 
                          a large potentialRadius causes overlap between the 
                          columns. At initialization time we choose 
                          ((2*potentialRadius + 1)^(# inputDimensions) * 
                          potentialPct) input bits to comprise the column's
                          potential pool.
    globalInhibition:     If true, then during inhibition phase the winning 
                          columns are selected as the most active columns from 
                          the region as a whole. Otherwise, the winning columns 
                          are selected with resepct to their local 
                          neighborhoods. using global inhibition boosts 
                          performance x60.
    localAreaDensity:     The desired density of active columns within a local
                          inhibition area (the size of which is set by the
                          internally calculated inhibitionRadius, which is in
                          turn determined from the average size of the 
                          connected potential pools of all columns). The 
                          inhibition logic will insure that at most N columns 
                          remain ON within a local inhibition area, where N = 
                          localAreaDensity * (total number of columns in 
                          inhibition area).
    numActivePerInhArea:  An alternate way to control the density of the active
                          columns. If numActivePerInhArea is specified then
                          localAreaDensity must less than 0, and vice versa. 
                          When using numActivePerInhArea, the inhibition logic 
                          will insure that at most 'numActivePerInhArea' 
                          columns remain ON within a local inhibition area (the 
                          size of which is set by the internally calculated
                          inhibitionRadius, which is in turn determined from 
                          the average size of the connected receptive fields of 
                          all columns). When using this method, as columns 
                          learn and grow their effective receptive fields, the
                          inhibitionRadius will grow, and hence the net density
                          of the active columns will *decrease*. This is in
                          contrast to the localAreaDensity method, which keeps
                          the density of active columns the same regardless of
                          the size of their receptive fields.
    stimulusThreshold:    This is a number specifying the minimum number of
                          synapses that must be on in order for a columns to
                          turn ON. The purpose of this is to prevent noise 
                          input from activating columns. Specified as a percent 
                          of a fully grown synapse.
    synPermInactiveDec:   The amount by which an inactive synapse is 
                          decremented in each round. Specified as a percent of 
                          a fully grown synapse.
    synPermActiveInc:     The amount by which an active synapse is incremented 
                          in each round. Specified as a percent of a
                          fully grown synapse.
    synPermActiveSharedDec: *UNUSED/EXPERIMENTAL* The amount by which to
                          decrease the permanence of an active synapse which is
                          connected to another column that is active at the same
                          time. Specified as a percent of a fully grown synapse.
    synPermOrphanDec:     The amount by which to decrease the permanence of an 
                          active synapse on a column which has high overlap 
                          with the input, but was inhibited (an "orphan" 
                          column).
    synPermConnected:     The default connected threshold. Any synapse whose
                          permanence value is above the connected threshold is
                          a "connected synapse", meaning it can contribute to
                          the cell's firing.
    minPctOvlerapDutyCycle: A number between 0 and 1.0, used to set a floor on
                          how often a column should have at least
                          stimulusThreshold active inputs. Periodically, each
                          column looks at the overlap duty cycle of
                          all other column within its inhibition radius and 
                          sets its own internal minimal acceptable duty cycle 
                          to: minPctDutyCycleBeforeInh * max(other columns' 
                          duty cycles).
                          On each iteration, any column whose overlap duty 
                          cycle falls below this computed value will  get
                          all of its permanence values boosted up by
                          synPermActiveInc. Raising all permanences in response
                          to a sub-par duty cycle before  inhibition allows a
                          cell to search for new inputs when either its
                          previously learned inputs are no longer ever active,
                          or when the vast majority of them have been 
                          "hijacked" by other columns.
    minPctActiveDutyCycle: A number between 0 and 1.0, used to set a floor on
                          how often a column should be activate.
                          Periodically, each column looks at the activity duty 
                          cycle of all other columns within its inhibition 
                          radius and sets its own internal minimal acceptable 
                          duty cycle to:
                            minPctDutyCycleAfterInh *
                            max(other columns' duty cycles).
                          On each iteration, any column whose duty cycle after
                          inhibition falls below this computed value will get
                          its internal boost factor increased.
    dutyCyclePeriod:      The period used to calculate duty cycles. Higher
                          values make it take longer to respond to changes in
                          boost or synPerConnectedCell. Shorter values make it
                          more unstable and likely to oscillate.
    maxBoost:             The maximum overlap boost factor. Each column's
                          overlap gets multiplied by a boost factor
                          before it gets considered for inhibition.
                          The actual boost factor for a column is number 
                          between 1.0 and maxBoost. A boost factor of 1.0 is 
                          used if the duty cycle is >= minOverlapDutyCycle, 
                          maxBoost is used if the duty cycle is 0, and any duty 
                          cycle in between is linearly extrapolated from these 
                          2 endpoints.
    seed:                 Seed for our own pseudo-random number generator.
    spVerbosity:          spVerbosity level: 0, 1, 2, or 3
    addNoise:             If we should add noise to column activiations to break
                          ties. With this on you can never have *no* activity
                          which may or may not be desirable.
    *******************************************************************/
    
    var parent = this
    this._seed = defaultFor(seed, -1);
    Math.seedrandom(this._seed);

    this._inputDimensions = defaultFor(inputDimensions, [ 32, 32 ] );
    this._columnDimensions = defaultFor(columnDimensions, [ 64, 64 ] );
    this._numInputs = arrayProduct(this._inputDimensions);
    this._numColumns = arrayProduct(this._columnDimensions);
    
    // Check input is valid
    console.assert(this._numInputs > 0,
                   "Number of inputs must be greater than 0");    
    console.assert(this._numColumns > 0,
                   "Number of columns must be greater than 0");
        
    // Save arguments
    this._potentialRadius = defaultFor(potentialRadius, this._numInputs);
    this._potentialPct = defaultFor(potentialPct, 0.5);
    this._globalInhibition = defaultFor(globalInhibition, false);
    this._localAreaDensity = defaultFor(localAreaDensity, -1.0);
    this._numActiveColumnsPerInhArea = defaultFor(numActiveColumnsPerInhArea,
                                                  10.0);
    this._stimulusThreshold = defaultFor(stimulusThreshold, 0);
    this._synPermInactiveDec = defaultFor(synPermInactiveDec, 0.01);
    this._synPermActiveInc = defaultFor(synPermActiveInc, 0.1);
    this._synPermConnected = defaultFor(synPermConnected, 0.10);
    this._synPermBelowStimulusInc = this._synPermConnected / 10;
    this._minPctOverlapDutyCycles = defaultFor(minPctOverlapDutyCycle, 0.001);
    this._minPctActiveDutyCycles = defaultFor(minPctActiveDutyCycle, 0.1);
    this._dutyCyclePeriod = defaultFor(dutyCyclePeriod, 1000);
    this._maxBoost = defaultFor(maxBoost, 10.0);
    this._spVerbosity = defaultFor(spVerbosity, 0);
    
    // More input checking
    console.assert((this._numActiveColumnsPerInhArea > 0 ||
                    (this._localAreaDensity > 0 &&
                     this._localAreaDensity <= .5)));
    
    // Should noise be added to column activation scores to break ties?
    this._addNoise = defaultFor(addNoise, true);

    // Extra parameter settings
    this._synPermMin = 0.0;
    this._synPermMax = 1.0;
    this._synPermTrimThreshold = this._synPermActiveInc / 2.0;
    console.assert(this._synPermTrimThreshold < this._synPermConnected,
		   "Bad paramaters passed. synPermTrimThreshold must be less " +
		   "than half of synPermConnected" );
    this._updatePeriod = 1;
    
    initConnectedPct = 1;

    // Internal state
    this._version = 1.0;
    this._iterationNum = 0;
    this._iterationLearnNum = 0;

    // Store the set of all inputs that are within each column's potential pool.
    // 'potentialPools' is a matrix, whose rows represent cortical columns, and 
    // whose columns represent the input bits. if potentialPools[i][j] == 1,
    // then input bit 'j' is in column 'i's potential pool. A column can only be 
    // connected to inputs in its potential pool. The indices refer to a 
    // falttenned version of both the inputs and columns. Namely, irrespective 
    // of the topology of the inputs and columns, they are treated as being a 
    // one dimensional array. Since a column is typically connected to only a 
    // subset of the inputs, many of the entries in the matrix are 0. Therefore 
    // the the potentialPool matrix is stored using the SparseBinaryMatrix 
    // class, to reduce memory footprint and compuation time of algorithms that 
    // require iterating over the data strcuture.
    
    //TODO find out if fixed array size is needed
    this._potentialPools = [];

    // Initialize the permanences for each column. Similar to the 
    // 'this._potentialPools', the permances are stored in a matrix whose rows
    // represent the cortial columns, and whose columns represent the input 
    // bits. if this._permanences[i][j] = 0.2, then the synapse connecting 
    // cortical column 'i' to input bit 'j'  has a permanence of 0.2. Here we 
    // also use the SparseMatrix class to reduce the memory footprint and 
    // computation time of algorithms that require iterating over the data 
    // structure. This permanence matrix is only allowed to have non-zero 
    // elements where the potential pool is non-zero.
    
    this._permanences = [];

    // 'this._connectedSynapses' is a similar matrix to 'this._permanences' 
    // (rows represent cortial columns, columns represent input bits) whose 
    // entries represent whether the cortial column is connected to the input 
    // bit, i.e. its permanence value is greater than 'synPermConnected'. While 
    // this information is readily available from the 'this._permanence' matrix, 
    // it is stored separately for efficiency purposes.
    
    this._connectedSynapses = [];
    for (var i = 0; i < this._numColumns; i++) {
      this._connectedSynapses.push([]);
    }

    // Stores the number of connected synapses for each column. This is simply
    // a sum of each row of 'this._connectedSynapses'. again, while this 
    // information is readily available from 'this._connectedSynapses', it is
    // stored separately for efficiency purposes.
    
    this._connectedCounts = [];
    for (var i = 0; i < this._numColumns; i++); {
      this._connectedCounts.push(0.0);
    }

    // Initialize the set of permanence values for each column. Ensure that 
    // each column is connected to enough input bits to allow it to be 
    // activated.
    
    for (var i = 0; i < this._numColumns; i++) {
      var potential = parent._mapPotential( i, wrapAround = true );
      this._potentialPools.push(potential);
      perm = this._initPermanence(potential, initConnectedPct)
      if (i == 0) {
        //console.log("In init ...");
        //console.log("Potential:");
        //console.log(potential);
        //console.log(potential.length);
        //console.log("Perms:");
        //console.log(perm);
        //console.log(perm.length);
      }
      this._updatePermanencesForColumn(perm, i, raisePerm = true) 
    };

    this._overlapDutyCycles = [];
    this._activeDutyCycles = [];
    this._minOverlapDutyCycles = [];
    this._minActiveDutyCycles = [];
    this._boostFactors = [];
    for (var i = 0; i < this._numColumns; i++) {
        this._overlapDutyCycles.push(0.0);
        this._activeDutyCycles.push(1e-5);
        this._minOverlapDutyCycles.push(1e-6);
        this._minActiveDutyCycles.push(1e-6);
        this._boostFactors.push(1.0);
    };

    // The inhibition radius determines the size of a column's local 
    // neighborhood. A cortical column must overcome the overlap 
    // score of columns in his neighborhood in order to become active. This 
    // radius is updated every learning round. It grows and shrinks with the 
    // average number of connected synapses per column.
    this._inhibitionRadius = 0;
    this._updateInhibitionRadius();
    //console.log("In init. Inhibition radius:");
    //console.log(this._inhibitionRadius);
};

SpatialPooler.prototype.compute = function(inputVector, learn, activeArray){
    /*
    This is the primary public method of the SpatialPooler class. This 
    function takes a input vector and outputs the indices of the active columns 
    along with the anomaly score for the that input. If 'learn' is set to True,
    this method also updates the permanences of the columns.

    Parameters:
    ----------------------------
    inputVector:    a numpy array of 0's and 1's that comprises the input to 
                    the spatial pooler. The array will be treated as a one
                    dimensional array, therefore the dimensions of the array
                    do not have to match the exact dimensions specified in the 
                    class constructor. In fact, even a list would suffice. 
                    The number of input bits in the vector must, however, 
                    match the number of bits specified by the call to the 
                    constructor. Therefore there must be a '0' or '1' in the
                    array for every input bit.
    learn:          a boolean value indicating whether learning should be 
                    performed. Learning entails updating the  permanence 
                    values of the synapses, and hence modifying the 'state' 
                    of the model. setting learning to 'off' might be useful
                    for indicating separate training vs. testing sets. 
    activeArray:    an array whose size is equal to the number of columns. 
                    Before the function returns this array will be populated 
                    with 1's at the indices of the active columns, and 0's 
                    everywhere else.
    */

    
    this._updateBookeepingVars(learn);
    // Convert to 1D array
    var oneDInputVector = nDto1D(inputVector, this._inputDimensions.length);
    
    // Make sure our input is as defined during init
    console.assert(oneDInputVector.length == this._numInputs,
                   "Input does not match specified input dimensions");
    //console.log(oneDInputVector);
    
    var overlaps = this._calculateOverlap(oneDInputVector);
    
    // Store this as an accessible property
    this.overlaps = overlaps;
    
    var overlapsPct = this._calculateOverlapPct(this.overlaps);
    //console.log("Connected counts for each column: ");
    //console.log(this._connectedCounts);
    //console.log("Percent of that count that overlaps the input:");
    //console.log(overlapsPct);
    
    // Apply boosting when learning is on
    var boostedOverlaps = [];
    if ( learn === true ) {
        for (var i = 0; i < this.overlaps.length; i++) {
            boostedOverlaps.push(this.overlaps[i] * this._boostFactors[i]);
        };
    } else {
      boostedOverlaps = this.overlaps;
    }
    
    // Store this as an accessible property
    this.boostedOverlaps = boostedOverlaps
    //console.log("Boosted overlaps: ");
    //console.log(this.boostedOverlaps);
    
    var activeColumns = this._inhibitColumns(this.boostedOverlaps,
                                             this._addNoise);
    
    //console.log("Active Columns after inhibition");
    //console.log(activeColumns);
    if ( learn === true) {
        this._adaptSynapses(oneDInputVector, activeColumns);
        //this._updateDutyCycles(overlaps, activeColumns);
        //this._bumpUpWeakColumns();
        //this._updateBoostFactors();
        //if ( this._isUpdateRound() ) {
        //    this._updateInhibitionRadius()
        //    this._updateMinDutyCycles()
        //};
    } else {
        activeColumns = this._stripNeverLearned(activeColumns);
    };
    
    // Clear out the active array so we can refill it
    for (var i = 0; i < activeArray.length; i++) {
        activeArray[i] = 0;
    };
    // Set new values
    for (var i = 0; i < activeColumns.length; i++) {
        activeArray[activeColumns[i]] = 1;
    }
};


SpatialPooler.prototype._stripNeverLearned = function(){
        console.log("Not implemented.")
};

    
SpatialPooler.prototype._updateMinDutyCycles = function(){
        console.log("Not implemented.")
};
    
SpatialPooler.prototype._updateMinDutyCyclesGlobal = function(){
        console.log("Not implemented.")
};
    
SpatialPooler.prototype._updateDutyCycles = function(overlaps, activeColumns){
    /*
    Updates the duty cycles for each column. The OVERLAP duty cycle is a moving
    average of the number of inputs which overlapped with the each column. The
    ACTIVITY duty cycles is a moving average of the frequency of activation for 
    each column.

    Parameters:
    ----------------------------
    overlaps:       an array containing the overlap score for each column.
    activeColumns:  An array containing the indices of the active columns, 
                    the sprase set of columns which survived inhibition.
    */
    
    overlapArray = [];
    var activeArray = [];
    for (var i = 0; i < this._numColumns; i++) {
        overlapArray.push(0.0);
        activeArray.push(0.0);
    };
    //overlapArray[overlaps > 0] = 1
    //if activeColumns.size > 0:
    //  activeArray[activeColumns] = 1
    //
    //period = self._dutyCyclePeriod
    //if (period > self._iterationNum):
    //  period = self._iterationNum
    //
    //self._overlapDutyCycles = self._updateDutyCyclesHelper(
    //                            self._overlapDutyCycles, 
    //                            overlapArray, 
    //                            period
    //                          )
    //
    //self._activeDutyCycles = self._updateDutyCyclesHelper(
    //                            self._activeDutyCycles, 
    //                            activeArray,
    //                            period
    //                          )
};
    
SpatialPooler.prototype._updateInhibitionRadius = function(){
    /*
    Update the inhibition radius. The inhibition radius is a meausre of the
    square (or hypersquare) of columns that each a column is "conencted to"
    on average. Since columns are are not connected to each other directly, we 
    determine this quantity by first figuring out how many *inputs* a column is 
    connected to, and then multiplying it by the total number of columns that 
    exist for each input. For multiple dimensions the aforementioned 
    calculations are averaged over all dimensions of inputs and columns. This 
    value is meaningless if global inhibition is enabled.
    */
    if (this._globalInhibition) {
        // Math.max can't handle arrays directly, use .apply() to explode
        this._inhibitionRadius = Math.max.apply(null, this._columnDimensions);
        return;
    } else {
      // NOTE: This pathway is not fully implemented!!! Values cannot be
      // trusted!!
      var avgConnectedSpansForColumns = [];
      for (var i = 0; i < this._numColumns; i++) {
        avgConnectedSpansForColumns.push(this._avgConnectedSpanForColumnND(i));
      };
      var avgConnectedSpan = arrayMean(avgConnectedSpansForColumns);
      var columnsPerInput = this._avgColumnsPerInput();
      var diameter = avgConnectedSpan * columnsPerInput;
      //console.log(diameter);
      var radius = (diameter - 1) / 2.0;
      //console.log(radius);
      var radius = Math.max(1.0, radius);
      //console.log(radius);
      this._inhibitionRadius = Math.round(radius);
      //console.log(this._inhibitionRadius);
    }
};
    
SpatialPooler.prototype._avgColumnsPerInput = function(){
    /*
    The average number of columns per input, taking into account the topology 
    of the inputs and columns. This value is used to calculate the inhibition 
    radius. This function supports an arbitrary number of dimensions. If the 
    number of column dimensions does not match the number of input dimensions, 
    we treat the missing, or phantom dimensions as 'ones'.
    */
    //TODO: extend to support different number of dimensions for inputs and 
    // columns
    // TODO: implement this properly
    
    return this._numColumns / this._numInputs;
};
    
SpatialPooler.prototype._avgConnectedSpanForColumn1D = function(){
        console.log("Not implemented.")
};
    
SpatialPooler.prototype._avgConnectedSpanForColumn2D = function(){
        console.log("Not implemented.")
};
    
SpatialPooler.prototype._avgConnectedSpanForColumnND = function(){
    /*
    The range of connectedSynapses per column, averaged for each dimension. 
    This value is used to calculate the inhibition radius. This variation of 
    the function supports arbitrary column dimensions.

    Parameters:
    ----------------------------
    index:          The index identifying a column in the permanence, potential 
                    and connectivity matrices.
    */
    var dimensions = this._columnDimensions;
    // [1]
    // [4, 4]
    // [12, 12, 12]
    // Reverse the dimensions
    // Get all but the last one
    // Append that to the array [1]
    // Calculate an array of cumulative products for that array
    // Reverse that resulting array
    // TODO implement this properly
    
    return .7 * this._numInputs; // BS FOR NOW
    
    
};
    
SpatialPooler.prototype._adaptSynapses = function(inputVector, activeColumns){
    /*
    The primary method in charge of learning. Adapts the permanence values of 
    the synapses based on the input vector, and the chosen columns after 
    inhibition round. Permanence values are increased for synapses overlapping 
    input bits that are turned on, and decreased for synapses overlapping 
    inputs bits that are turned off.

    Parameters:
    ----------------------------
    inputVector:    a numpy array of 0's and 1's thata comprises the input to 
                    the spatial pooler. There exists an entry in the array 
                    for every input bit.
    activeColumns:  an array containing the indices of the columns that 
                    survived inhibition.
    */
    
    //console.log("Input vector:");
    //console.log(inputVector);
    
    var inputIndices = [];
    for (var i = 0; i < inputVector.length; i++) {
        if (inputVector[i] > 0) {
            inputIndices.push(i);
        };
    };
    
    //console.log("Active input indices: ")
    //console.log(inputIndices);
    
    var permChanges = [];
    for (var i = 0; i < this._numInputs; i++) {
        permChanges.push(-1 * this._synPermInactiveDec);
    };    
    for (var i = 0; i < inputIndices.length; i++) {
        permChanges[inputIndices[i]] = this._synPermActiveInc;
    };

    //console.log("Perm Changes");
    //console.log(permChanges);
    for (var i = 0; i < activeColumns.length; i++) {
        var activeColIndex = activeColumns[i];
        //console.log("Active Col:");
        //console.log(activeColIndex);
        var perm = this._permanences[activeColIndex];
        //console.log("Perms before updating:");
        //console.log(perm);
        var maskPotential = [];
        var activeColPotPool = this._potentialPools[activeColIndex];
        //console.log("Active Column Potential Pool");
        //console.log(activeColPotPool);
        for (var j = 0; j < activeColPotPool.length; j++) {
            if (activeColPotPool[j] > 0) {
                maskPotential.push(j);
            }
        }
        for (var j = 0; j < maskPotential.length; j++) {
            perm[maskPotential[j]] += permChanges[maskPotential[j]];
        };
        //console.log("Perms after updating:");
        //console.log(perm)
        //console.log("Index")
        //console.log(i)
        this._updatePermanencesForColumn(perm, activeColIndex, raisePerm = true)
    };
};
    
SpatialPooler.prototype._bumpUpWeakColumns = function(){
        console.log("Not implemented.")
};

SpatialPooler.prototype._raisePermanenceToThreshold = function(perm, mask){
    /*
    This method ensures that each column has enough connections to input bits
    to allow it to become active. Since a column must have at least 
    'this._stimulusThreshold' overlaps in order to be considered during the 
    inhibition phase, columns without such minimal number of connections, even
    if all the input bits they are connected to turn on, have no chance of 
    obtaining the minimum threshold. For such columns, the permanence values
    are increased until the minimum number of connections are formed.


    Parameters:
    ----------------------------
    perm:           An array of permanence values for a column. The array is 
                    "dense", i.e. it contains an entry for each input bit, even
                    if the permanence value is 0.
    mask:           the indices of the columns whose permanences need to be 
                    raised. (The potential pool)
    */
    
    // TODO - Figure out if this should go within the while loop
    // Clip perms
    for (var i = 0; i < perm.length; i++) {
        // Raise numbers below min to min
        if (perm[i] < this._synPermMin) {
            perm[i] = this._synPermMin;
        // Lower perms above max back down to max
        } else if (perm[i] > this._synPermMax) {
            perm[i] = this._synPermMax;
        };
    };
    
    var counter = 0;
    while (true) {
      
        if (counter > 40) {
            throw "Possible infinite loop! Attempting to raise enough " +
            "permanences to meet _stimulusThreshold failed.";
            return
        }
      
        // See if we have enough connected synapses
        var conIndices = [];
        for (var i = 0; i < perm.length; i++) {
            if (perm[i] >= this._synPermConnected) {
                conIndices.push(i);
            };
        };
        //console.log(conIndices);
        var numConnected = conIndices.length;
        if (numConnected >= this._stimulusThreshold) {
            //console.log("Good to go!");
            return
        } else {
            // If not then bump them all up a bit
            for (var i = 0; i < mask.length; i++) {
              perm[mask[i]] += this._synPermBelowStimulusInc;
            };
            
            counter++;
        };
    };
};
  
SpatialPooler.prototype._updatePermanencesForColumn = function(perm,
                                                               index,
                                                               raisePerm){
    /*
    This method updates the permanence matrix with a column's new permanence
    values. The column is identified by its index, which reflects the row in
    the matrix, and the permanence is given in 'dense' form, i.e. a full 
    arrray containing all the zeros as well as the non-zero values. It is in 
    charge of implementing 'clipping' - ensuring that the permanence values are
    always between 0 and 1 - and 'trimming' - enforcing sparsity by zeroing out
    all permanence values below '_synPermTrimThreshold'. It also maintains
    the consistency between 'self._permanences' (the matrix storeing the 
    permanence values), 'self._connectedSynapses', (the matrix storing the bits
    each column is connected to), and 'self._connectedCounts' (an array storing
    the number of input bits each column is connected to). Every method wishing 
    to modify the permanence matrix should do so through this method.

    Parameters:
    ----------------------------
    perm:           An array of permanence values for a column. The array is 
                    "dense", i.e. it contains an entry for each input bit, even
                    if the permanence value is 0.
    index:          The index identifying a column in the permanence, potential 
                    and connectivity matrices
    raisePerm:      a boolean value indicating whether the permanence values 
                    should be raised until a minimum number of synapses are in 
                    a connected state. Should be set to 'false' when a direct 
                    assignment is required.
    */
    raisePerm = defaultFor(raisePerm, true);
    
    // Get a list of indices where potential pool is not 0
    var maskPotential = [];
    for (var i = 0; i < this._potentialPools[index].length; i++) {
        if (this._potentialPools[index][i] > 0) {
            maskPotential.push(i);
        };
    };
    
    if (raisePerm == true) {
        if (index == 0) {
          //console.log("Mask Potential:");
          //console.log(maskPotential);
        };
        this._raisePermanenceToThreshold(perm, maskPotential);
    };
    
    // Remove perms below threshold and clip those above
    for (var i = 0; i < perm.length; i++) {
        // This will also raise numbers below 0 to 0.
        if (perm[i] < this._synPermTrimThreshold) {
            perm[i] = 0;
        // Lower perms above max back down to max
        } else if (perm[i] > this._synPermMax) {
            perm[i] = this._synPermMax;
        };
    };
      
    var newConnected = [];
    for (var i = 0; i < perm.length; i++) {
        if (perm[i] >= this._synPermConnected) {
            newConnected.push(i);
        };
    };
    
    if (index == 0) {
      //console.log("Old Connected:");
      //console.log(this._connectedSynapses[index]);
      //console.log("New Connected:");
      //console.log(newConnected);
    };
    
    this._permanences[index] = perm;
    this._connectedSynapses[index] = newConnected;
    this._connectedCounts[index] = newConnected.length;
};
    
SpatialPooler.prototype._initPermConnected = function(){
    /*
    Returns a randomly generated permanence value for a synapse that is
    initialized in a connected state
    */
    return this._synPermConnected +
            ((Math.random() * this._synPermActiveInc) / 4.0);
};

SpatialPooler.prototype._initPermNotConnected = function(){
    /*
    Returns a randomly generated permanence value for a synapse that is
    initialized in a non-connected state
    */
    return this._synPermConnected * Math.random();
};
    
SpatialPooler.prototype._initPermanence = function(potential, connectedPct){
    
    var permanences = [];
    for (var i = 0; i < this._numInputs; i++) {
        if (potential[i] < 1.0) {
            //console.log("Not a potential connection: " + i);
            permanences.push(0.0);
            continue;
        };
        
        if (Math.random() <= connectedPct) {
            permanences.push(this._initPermConnected());
        } else {
            var permVal = this._initPermNotConnected();
            // Clip off low values. NOTE: This won't help reduce mem footprint
            // until a sparse matrix is used in JS implementation.
            // Kept here to produce similar value distribution to other
            // implementations.
            if (permVal < this._synPermTrimThreshold) {
                //console.log("Potential connection: " + i);
                //console.log("Clipping one perm val (too low):" + permVal);
                permanences.push(0.0);
            } else {
                permanences.push(permVal);
            };
        };
    };
    
    return permanences
};

SpatialPooler.prototype._mapPotential = function(index, wrapAround){
    /*
    Maps a column to its input bits. This method encapsultes the topology of 
    the region. It takes the index of the column as an argument and determines 
    what are the indices of the input vector that are located within the 
    column's potential pool. The return value is a list containing the indices 
    of the input bits. The current implementation of the base class only 
    supports a 1 dimensional topology of columsn with a 1 dimensional topology 
    of inputs. To extend this class to support 2-D topology you will need to 
    override this method. Examples of the expected output of this method:
    * If the potentialRadius is greater than or equal to the entire input 
      space, (global visibility), then this method returns an array filled with 
      all the indices
    * If the topology is one dimensional, and the potentialRadius is 5, this 
      method will return an array containing 5 consecutive values centered on 
      the index of the column (wrapping around if necessary).
    * If the topology is two dimensional (not implemented), and the 
      potentialRadius is 5, the method should return an array containing 25 
      '1's, where the exact indices are to be determined by the mapping from 
      1-D index to 2-D position.

    Parameters:
    ----------------------------
    index:          The index identifying a column in the permanence, potential 
                    and connectivity matrices.
    wrapAround:     A boolean value indicating that boundaries should be 
                    region boundaries ignored.
    */
    
    // Create an array twice as long, plus one, as the potential radius
    // e.g. 16 bits - 1 bit - 16 bits
    var diameter = 2 * (this._potentialRadius + 1)
    var indices = [];
    // Fill it with the first indices i.e. 0, 1, 2, 3 etc.
    for (var i = 0; i < diameter; i++) {
        indices.push(i);
    };
    // Shift over so index 0 of that array is the value of the column index
    // e.g. Column index 1000 - 1000, 1001, 1002 etc.
    for (var i = 0; i < diameter; i++) {
        indices[i] += index;
    };
    // Shift back so the column index is centered
    for (var i = 0; i < diameter; i++) {
        indices[i] -= this._potentialRadius;
    };
    // We may want column receptive fields to wrap
    if (wrapAround === true) {
        for (var i = 0; i < diameter; i++) {
          indices[i] = indices[i].mod(this._numInputs);
        };
    } else {
        // Otherwise remove indices that are outside the range of the input
        var cleanedIndices = [];
        for (var i = 0; i < diameter; i++) {
          if (indices[i] >= 0 && indices[i] < this._numInputs) {
            cleanedIndices.push(indices[i]);
          }
        };
        indices = cleanedIndices;
    };
    // Remove duplicate indices
    indices = new Set(indices).array();
    
    // Select a subset of the receptive field to serve as the potential pool
    // Because we are seeding the random number generator these selections
    // will be the same across runs.
    var mask = [];
    for (var i = 0; i < this._numInputs; i++) {
        mask.push(0);
    };
    // Shuffle our indices and then take the first n
    shflIndices = shuffle(indices);
    sampleSize = Math.round(this._potentialPct * indices.length);
    for (var i = 0; i < sampleSize; i++) {
        mask[shflIndices[i]] = 1;
    };
    
    return mask
};
    
SpatialPooler.prototype._updateDutyCyclesHelper = function(){
    console.log("Not implemented.")
};
    
SpatialPooler.prototype._updateBoostFactors = function(){
    console.log("Not implemented.")
};
    
SpatialPooler.prototype._updateBookeepingVars = function(learn){
    /*
    Updates counter instance variables each round.

    Parameters:
    ----------------------------
    learn:          a boolean value indicating whether learning should be 
                    performed. Learning entails updating the  permanence 
                    values of the synapses, and hence modifying the 'state' 
                    of the model. setting learning to 'off' might be useful
                    for indicating separate training vs. testing sets. 
    */
    this._iterationNum++;
    if ( learn === true ){
      this._iterationLearnNum++;
    };
};
    
SpatialPooler.prototype._calculateOverlap = function(inputVector){
    /*
    This function determines each column's overlap with the current input 
    vector. The overlap of a column is the number of synapses for that column
    that are connected (permance value is greater than '_synPermConnected') 
    to input bits which are turned on. Overlap values that are lower than
    the 'stimulusThreshold' are ignored. The implementation takes advantage of 
    the SpraseBinaryMatrix class to perform this calculation efficiently.

    Parameters:
    ----------------------------
    inputVector:    an array that comprises the input to the spatial pooler.
    */
    var overlaps = [];
    for (var i = 0; i < this._numColumns; i++) {
        // Look up the connected synapses for each column. These values
        // correspond to indices in the input.
        //console.log("Input: ");
        //console.log(inputVector);
        //console.log("Column " + i + ":");
        //console.log(this._connectedSynapses[i]);
        var overlap = 0;
        for (var j = 0; j < this._connectedSynapses[i].length; j++){
            //console.log("Is input bit " +
            //            this._connectedSynapses[i][j] + " on?");
            // Add up the input values to get the overlap
            // NOTE: This is a divergence from the cpp/python code as it
            // supports scalar inputs between 0.0 and 1.0
            var inVal = inputVector[this._connectedSynapses[i][j]];
            if (inVal < 0 || inVal > 1) {
                throw "Input Error: Values in the input vector must be " +
                "between 0.0 and 1.0";
            };
            overlap += inVal;
        };
        overlaps.push(overlap);
    };
    
    //console.log("Overlaps before thresholding:")
    //console.log(overlaps);
    
    // Zero out columns that didn't meet _stimulusThreshold
    for (var i = 0; i < overlaps.length; i++) {
        if (overlaps[i] < this._stimulusThreshold) {
            overlaps[i] = 0;
        };
    }
    //console.log("Overlaps after thresholding:")
    //console.log(overlaps);

    return overlaps;
};
    
SpatialPooler.prototype._calculateOverlapPct = function(overlaps){
    overlapPercents = [];
    for (var i = 0; i < overlaps.length; i++) {
        overlapPercents.push(overlaps[i] / this._connectedCounts[i]);
    };
    return overlapPercents;
};
  
SpatialPooler.prototype._inhibitColumns = function(overlaps, addNoise){
    /*
    Performs inhibition. This method calculates the necessary values needed to
    actually perform inhibition and then delegates the task of picking the 
    active columns to helper functions.

    Parameters:
    ----------------------------
    overlaps:       an array containing the overlap score for each  column. 
                    The overlap score for a column is defined as the number 
                    of synapses in a "connected state" (connected synapses) 
                    that are connected to input bits which are turned on.
    addNoise:       A boolean value which controls whether or not we add
                    extra noise to overlap scores prior to determining winners.
                    NOTE: This is a divergence from the cpp/py implementation.
    */
    
    // Determine how many columns should be selected in the inhibition phase. 
    // This can be specified by either setting the 'numActiveColumnsPerInhArea' 
    // parameter of the 'localAreaDensity' parameter when initializing the class
    
    var overlapsCopy = overlaps.slice();
    if (this._localAreaDensity > 0) {
      var density = this._localAreaDensity;
    } else {
        //console.log(this._inhibitionRadius);
        var inhibitionArea = Math.pow( (2 * this._inhibitionRadius + 1), 
                                      this._columnDimensions.length);
        //console.log(inhibitionArea);
        inhibitionArea = Math.min(this._numColumns, inhibitionArea);
        //console.log(inhibitionArea);
        //console.log(this._numActiveColumnsPerInhArea);
        var density = this._numActiveColumnsPerInhArea / inhibitionArea;
        //console.log(density);
        density = Math.min(density, 0.5);
        //console.log(density);
    };

    // Add a little bit of random noise to the scores to help break ties.
    if (addNoise === true) {
        for (var i = 0; i < overlapsCopy.length; i++) {
            overlapsCopy[i] += Math.random() * 0.1;
        };
    };
    
    if (this._globalInhibition ||
        this._inhibitionRadius > Math.max.apply(null,
                                                this._columnDimensions)) {
        return this._inhibitColumnsGlobal(overlapsCopy, density);
    } else {
        // TODO implement this path
        return this._inhibitColumnsLocal(overlapsCopy, density);
    };
};
    
SpatialPooler.prototype._inhibitColumnsGlobal = function(overlaps, density){
    /*
    Perform global inhibition. Performing global inhibition entails picking the 
    top 'numActive' columns with the highest overlap score in the entire 
    region. At most half of the columns are allowed to be active.

    Parameters:
    ----------------------------
    overlaps:       an array containing the overlap score for each column. 
                    The overlap score for a column is defined as the number 
                    of synapses in a "connected state" (connected synapses) 
                    that are connected to input bits which are turned on.
    density:        The fraction of columns to survive inhibition.
    */
    
    // Calculate num active total

    var numActive = Math.round(density * this._numColumns);
    var activeColumns = [];
    for (var i = 0; i < this._numColumns; i++) {
        activeColumns.push(0.0);
    };
    
    //console.log("Overlaps:");
    //console.log(overlaps);
    //console.log("Density:");
    //console.log(density); 
    // We want to retain the index for later use
    var winners = [];
    for (var j = 0; j < overlaps.length; j++) {
      winners.push([j, overlaps[j]]);
    };
    
    winners = winners.sort(ComparatorReversed)
    //console.log("Winners sorted:")
    //console.log(winners);

    // Get the top numActive columns
    var finalWinners = winners.slice(0, numActive);
    //console.log("Final Winners");
    //console.log(finalWinners);
    var winningIndices = [];
    for (var i = 0; i < finalWinners.length; i++) {
        winningIndices.push(finalWinners[i][0]);
    }
    return winningIndices
};
    
SpatialPooler.prototype._inhibitColumnsLocal = function(){
    console.log("Not implemented.");
};
    
SpatialPooler.prototype._getNeighbors1D = function(){
    console.log("Not implemented.");
};
    
SpatialPooler.prototype._getNeighbors2D = function(){
    console.log("Not implemented.");
};
    
SpatialPooler.prototype._getNeighborsND = function(){
    console.log("Not implemented.");
};
    
SpatialPooler.prototype._isUpdateRound = function(){
    console.log("Not implemented.");
};
    
SpatialPooler.prototype._seed = function(){
    console.log("Not implemented.");
};

SpatialPooler.prototype.constructor = SpatialPooler;
