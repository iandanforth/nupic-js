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
    // Returns the average of an array of numbers
    var sum = arraySum(arr);
    
    return sum / arr.length;
}

function arraySum(arr) {
    // Returns the sum of an array of numbers
    var sum = 0;
    for(var i = 0; i < arr.length; i++){
        sum += arr[i];
    };
    
    return sum;
}

function arrayProduct(arr) {
    // Returns the product of the values in an array
    var prod = 1
    for (var i = 0; i < arr.length; i += 1) {
        prod *= arr[i];
    };
    return prod;
};

function arrayCumProduct(arr) {
    // Returns the cumulative product of the values in an array
    var result = [];
    for (var i = 0; i < arr.length; i += 1) {
        result.push(arrayProduct(arr.slice(0, i + 1)));
    };
    return result;
};

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
    // Sorts an array by its second element. The first element must be
    // the original element index to provide stable sorting.
    
    if (a[1] == b[1]) {
        return a[0] - b[0];
    }
    
    return a[1] - b[1];
};

function ComparatorReversed( a, b ) {
    // Reverse sorts an array by its second element. The first element must be
    // the original element index to provide stable sorting.
    if (a[1] == b[1]) {
        return a[0] - b[0];
    }
    
    return b[1] - a[1];
};


function cartesianProductOf() {
    // From http://cwestblog.com/2011/05/02/cartesian-product-of-multiple-arrays/
    return Array.prototype.reduce.call(arguments, function(a, b) {
        var ret = [];
        a.forEach(function(a) {
            b.forEach(function(b) {
                ret.push(a.concat([b]));
            });
        });
        return ret;
    }, [[]]);
}

function zeros1D(x) {
    // Returns a 1D array populated with zeros
    var arr = [];
    for (var i = 0; i < x; i++) {
        arr.push(0.0);
    };
    return arr;
}

function zeros2D(x, y) {
    // Returns a 2D matrix populated with zeros
    var arr = [];
    for (var i = 0; i < x; i++) {
        arr.push([]);
        for (var j = 0; j < y; j++) {
            arr[i].push(0.0);
        };
    };
    return arr;
}




/******************************************************************************
 *
 * TEMPORAL POOLER
 */
var TemporalPooler = function( numColumns,
			      cellsPerColumn,
			      initialPerm,
			      connectedPerm,
			      minThreshold,
			      newSynapseCount,
			      permanenceInc,
			      permanenceDec,
			      permanenceMax,
			      globalDecay,
			      activationThreshold,
			      doPooling,
			      segUpdateValidDuration,
			      burnIn,
			      collectStats,
			      seed,
			      verbosity,
                  pamLength,
                  maxInferBacktrack,
                  maxLearnBacktrack,
                  maxAge,
                  maxSequenceLength,
                  maxSegmentsPerCell,
                  maxSynapsesPerSegment,
                  outputType) {
    /*************************************************************
    Parameters:
    ----------------------------
    numColumns:             Number of columns to instantiate.
    cellsPerColumn:         Number of cells per column.
    initialPerm:            TODO: DOCUMENT
    connectedPerm:          The permanence value above which synapses are
                            considered connected.
    minThreshold:           TODO: DOCUMENT
    newSynapseCount:        TODO: DOCUMENT
    permanenceInc:          TODO: DOCUMENT
    permanenceDec:          TODO: DOCUMENT
    permanenceMax:          The maximum value of synaptic permanence.
    globalDecay:            A value by which all permanences decrement over
                            time.
    activationThreshold:    TODO: DOCUMENT
    doPooling:              If True, pooling is enabled. Otherwise this is just
                            a sequence learner.
    segUpdateValidDuration: TODO: DOCUMENT
    burnIn:                 Used for evaluating the prediction score.
    collecStats:            If True, collect training / inference stats.
    seed:                   A seed for our pseudo-random number generator.
    verbosity:              Determines the level of detail in output during
                            execution.
    NOTE: This is a divergence. We ommit "checkSynapseConsistency" and
          "trivialPredictionMethods"
    pamLength:              Number of time steps to remain in "Pay Attention
                            Mode" after we detect we've reached the end of a
                            learned sequence. Setting this to 0 disables PAM
                            mode. When we are in PAM mode, we do not burst
                            unpredicted columns during learning, which in turn
                            prevents us from falling into a previously learned
                            sequence for a while (until we run through another
                            'pamLength' steps). The advantge of PAM mode is that
                            it requires fewer presentations to learn a set of
                            sequences which share elements. The disadvantage of
                            PAM mode is that if a learned sequence is
                            immediately followed by set set of elements that
                            should be learned as a 2nd sequence, the first
                            pamLength elements of that sequence will not be
                            learned as part of that 2nd sequence.
    maxInferBacktrack:      TODO: DOCUMENT
    maxLearnBacktrack:      TODO: DOCUMENT
    maxAge:                 Controls global decay. Global decay will only decay
                            segments that have not been activated for maxAge
                            iterations, and will only do the global decay loop
                            every maxAge iterations. The default (maxAge=1)
                            reverts to the behavior where global decay is
                            applied every iteration to every segment. Using
                            maxAge > 1 can significantly speed up the TP when
                            global decay is used.
    maxSeqLength:           If not 0, we will never learn more than maxSeqLength
                            inputs in a row without starting over at start
                            cells. This sets an upper bound on the length of
                            learned sequences and thus is another means (besides
                            maxAge and globalDecay) by which to limit how much
                            the TP tries to learn.
    maxSegmentsPerCell:     The maximum number of segments allowed on a cell.
                            This is used to turn on "fixed size CLA" mode. When
                            in effect, globalDecay is not applicable and must be
                            set to 0 and maxAge must be set to 0. When this is
                            used (> 0), maxSynapsesPerSegment must also be > 0.
    maxSynapsesPerSegment   The maximum number of synapses allowed in a segment.
                            This is used to turn on "fixed size CLA" mode. When
                            in effect, globalDecay is not applicable and must be
                            set to 0 and maxAge must be set to 0. When this is
                            used (> 0), maxSegmentsPerCell must also be > 0.
                          
    *******************************************************************/
    
    var parent = this
    

        
    // Save arguments
    this._numColumns = defaultFor(numColumns, 500);
    this._cellsPerColumn = defaultFor(cellsPerColumn, 10);
    
    // Check input is valid   
    console.assert(this._numColumns > 0,
                   "Number of columns must be greater than 0");
    console.assert(this._cellsPerColumn > 0,
                   "Number of cells per column must be greater than 0");
    this._numCells = this._numColumns * this._cellsPerColumn;
    
    this._initialPerm = defaultFor(initialPerm, 0.11);
    this._connectedPerm = defaultFor(connectedPerm, 0.50);
    this._minThreshold = defaultFor(minThreshold, 8);
    this._newSynapseCount = defaultFor(newSynapseCount, 15);
    this._permanenceInc = defaultFor(permanenceInc, 0.10);
    this._permanenceDec = defaultFor(permanenceDec, 0.10);
    this._permanenceMax = defaultFor(permanenceMax, 1.0);
    this._globalDecay = defaultFor(globalDecay, 0.10);
    this._activationThreshold = defaultFor(activationThreshold, 12);
    this._doPooling = defaultFor(doPooling, false);
    this._segUpdateValidDuration = defaultFor(segUpdateValidDuration, 5);
    this._burnIn = defaultFor(burnIn, 2);
    this._collectStats = defaultFor(collectStats, false);
    this._seed = defaultFor(seed, 42);
    this._verbosity = defaultFor(verbosity, 0);
    this._pamLength = defaultFor(pamLength, 1);
    this._maxInferBacktrack = defaultFor(maxInferBacktrack, 10);
    this._maxLearnBacktrack = defaultFor(maxLearnBacktrack, 5);
    this._maxAge = defaultFor(maxAge, 100000);
    this._maxSequenceLength = defaultFor(maxSequenceLength, 32);
    this._maxSegmentsPerCell = defaultFor(maxSegmentsPerCell, -1);
    this._maxSynapsesPerSegment = defaultFor(maxSynapsesPerSegment, 20);
    this._outputType = defaultFor(outputType, 'normal');
    
    // More input checking
    console.assert(this._pamLength > 0, "Pam Length cannot be 0");
    console.assert(this._maxSynapsesPerSegment >= this._newSynapseCount,
                   "TP requires that maxSynapsesPerSegment >= newSynapseCount.");
    var validOutputTypes = ['normal', 'activeState', 'activeState1CellPerCol'];
    if (validOutputTypes.indexOf(this._outputType) === -1) {
        console.log("ERROR: Valid output types are " + validOutputTypes);
    }
                   
    // Initialize our pseudo-random number generator
    Math.seedrandom(this._seed);
    
    // Internal state
    this._version = 1.0;
    // NOTE: This is a divergence. These variable names map to those used in
    // the SP, but in the original TP code these are called self.lrnIterationIdx
    // and self.iterationIdx
    this.iterationNum = 0;
    this.iterationLearnNum = 0;
    this._currentOutput = null;
    // pamCounter gets reset to pamLength whenever we detect that the learning
    // state is making good predictions (at least half the columns predicted).
    // Whenever we do not make a good prediction, we decrement pamCounter.
    // When pamCounter reaches 0, we start the learn state over again at start
    // cells.
    this._pamCounter = this._pamLength;
    this._collectSequenceStats = false;
    this._avgInputDensity = null;
    // Keeps track of the length of the sequence currently being learned.
    this._learnedSequenceLength = 0;
    // Keeps track of the moving average of all learned sequence length.
    this._avgLearnedSeqLength = 0;
    this._segmentUpdates = null;
    this._stats = {};
    this._internalStats = {};
    
    // Allocate and reset all stats;
    this._resetStats();
    
    /*************************************************************************
     * Create Data Structures
     */

    // A list of indices of active columns
    this._activeColumns = [];


    // Cells are indexed by column and index in the column
    // Every this._cells[column][index] contains a list of segments
    // Each segment is a structure of class Segment
    this._cells = [];
    for (var i = 0; i < this._numColumns; i++) {
        this._cells.push([]);
        for (var j = 0; j < this._cellsPerColumn; j++) {
            this._cells[i].push([]);
        };
    };
    
    // NOTE: This is a divergence. We do not have a separate concept of
    // "ephemerals" and so do not have an _initEphemerals method. That concept
    // is most useful when you are trying to reduce the size of a serialized
    // instance. We 1. don't plan on serializing instances and 2. don't want to
    // leave anything out if we do.
    
    // We store the lists of segments updates, per cell, so that they can be
    // applied later during learning, when the cell gets bottom-up activation.
    // We store one list per cell. The lists are identified with a hash key
    // which is a tuple (column index, cell index).
    this._segmentUpdates = {};
    
    // NOTE: We don't use the same backtrack buffer for inference and learning
    // because learning has a different metric for determining if an input from
    // the past is potentially useful again for backtracking.
    //
    // Our inference backtrack buffer. This keeps track of up to
    // this._maxInferBacktrack of previous input. Each entry is a list of active
    // column inputs.
    this._prevInferPatterns = [];
    
    // Our learning backtrack buffer. This keeps track of up to
    // this._maxLearnBacktrack of previous input. Each entry is a list of active
    // column inputs.
    this._prevLearnPatterns = [];
    
    this._learnActiveState = {};
    this._learnActiveState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._learnActiveState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    
    this._learnPredictedState = {};
    this._learnPredictedState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._learnPredictedState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);

    this._inferActiveState = {};
    this._inferActiveState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferActiveState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferActiveState["backup"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferActiveState["candidate"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    
    this._inferPredictedState = {};
    this._inferPredictedState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferPredictedState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferPredictedState["backup"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferPredictedState["candidate"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    
    this._cellConfidence = {};
    this._cellConfidence["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._cellConfidence["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._cellConfidence["candidate"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    
    this._columnConfidence = {};
    this._columnConfidence["t"] = zeros1D(this._numColumns);
    this._columnConfidence["t-1"] = zeros1D(this._numColumns);
    this._columnConfidence["candidate"] = zeros1D(this._numColumns);

};

TemporalPooler.prototype.__del__ = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.__getstate__ = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.__setstate__ = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.__getattr__ = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.__ne__ = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.__eq__ = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.diff = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.getLearnActiveStateT = function() {
    return this._learnActiveState['t'];
}

TemporalPooler.prototype.getRandomState = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.loadFromFile = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.reset = function() {
    /* Reset the state of all cells.
     *
     * This is normally used betweens equences while training. All internal
     * states are reset to 0
     */
    this._learnActiveState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._learnActiveState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._learnPredictedState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._learnPredictedState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferActiveState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferActiveState["t-1"] = zeros2D(this._numColumns,
                                            this._cellsPerColumn);
    this._inferPredictedState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._inferPredictedState["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._cellConfidence["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._cellConfidence["t-1"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    
    // Flush the segment update queue
    this._segmentUpdates = {};
    
    this._internalStats['nInfersSinceReset'] = 0;
    this._internalStats['curPredictionScore'] = 0;

    this._internalStats['curPredictionScore2']   = 0;
    this._internalStats['curFalseNegativeScore'] = 0;
    this._internalStats['curFalsePositiveScore'] = 0;

    this._internalStats['curMissing'] = 0;
    this._internalStats['curExtra'] = 0;
    
    // When a reset occurs, set prevSequenceSignature to signature of the
    // just-completed sequence and start accumulating histogram for the next
    // sequence.
    this._internalStats['prevSequenceSignature'] = null;
    if (this._collectSequenceStats) {
        if (arraySum(this._internalStats['confHistogram']) > 0) {
            var signature = this._internalStats['confHistogram'].slice();
            signature = nDto1D(signature, 2);
            this._internalStats['prevSequenceSignature'] = signature;
        };
        this._internalStats['confHistogram'] = zeros2D(this._numColumns,
                                                       this._cellsPerColumn);
    };
    
    this._resetCalled = true;
    
    // Clear out input history
    this._prevInferPatterns = [];
    this._prevLearnPatterns = [];
    
};


TemporalPooler.prototype.saveToFile = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.setRandomSeed = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype.setRandomState = function() {
    console.log("Not implemented.")
};


TemporalPooler.prototype._resetStats = function(){
    /*
    Reset the learning and inference stats. This will usually be called by
    user code at the start of each inference run (for a particular data set).
    */

    this._internalStats['nInfersSinceReset']       = 0;
    this._internalStats['nPredictions']            = 0;

    // New prediction score
    this._internalStats['curPredictionScore2']     = 0;
    this._internalStats['predictionScoreTotal2']   = 0;
    this._internalStats['curFalseNegativeScore']   = 0;
    this._internalStats['falseNegativeScoreTotal'] = 0;
    this._internalStats['curFalsePositiveScore']   = 0;
    this._internalStats['falsePositiveScoreTotal'] = 0;

    this._internalStats['pctExtraTotal']    = 0;
    this._internalStats['pctMissingTotal']  = 0;
    this._internalStats['curMissing']       = 0;
    this._internalStats['curExtra']         = 0;
    this._internalStats['totalMissing']     = 0;
    this._internalStats['totalExtra']       = 0;

    // Sequence signature statistics. Note that we don't reset the sequence
    // signature list itself.
    this._internalStats['prevSequenceSignature'] = null;
    if (this._collectSequenceStats === true) {
        // TODO: IMPLEMENT THIS
        this._internalStats['confHistogram'] = (
            numpy.zeros((this.numberOfCols, this.cellsPerColumn),
                        dtype="float32"))
    };
};


TemporalPooler.prototype.getStats = function() {
    console.log("Not implemented.")
};

TemporalPooler.prototype._updateStatsInferEnd = function(stats,
                                                         bottomUpNZ,
                                                         predictedState,
                                                         colConfidence) {
    /*
    Called at the end of learning and inference, this routine will update
    a number of stats in our _internalStats dictionary, including our computed 
    prediction score.
    
    @param stats            internal stats dictionary
    @param bottomUpNZ       list of the active bottom-up inputs
    @param predictedState   The columns we predicted on the last time step (should
                            match the current bottomUpNZ in the best case)
    @param colConfidence    Column confidences we determined on the last time step
    */
    
    // Return if not collecting stats
    if (this._collectStats === false) {
        return;
    };
    
    stats['nInfersSinceReset']++;
    
    // Compute the prediction score; how well the prediction from the last time
    // step predicted the current bottom-up input
    var scores = this.checkPrediction(patternNZs = [bottomUpNZ],
                                      output = predictedState,
                                      colConfidence = colConfidence);
    // Unpack the scores
    var numExtra = scores[0];
    var numMissing = scores[1];
    var confidences = scores[2];
    var predictionScore = confidences[0][0];
    var positivePredictionScore = confidences[0][1];
    var negativePredictionScore = confidences[0][2];
    
    stats['curPredictionScore'] = predictionScore;
    stats['curFalseNegativeScore'] = 1.0 - positivePredictionScore;
    stats['curFalsePositiveScore'] = negativePredictionScore;
    stats['curMissing'] = numMissing;
    stats['curExtra'] = numExtra;
    
    /* If we are past the burn-in period, update the accumulated stats
     * Here's what the various burn-in values mean:
     *  0: try to predict the first element of each sequence and all subsequent
     *  1: try to predict the second element of each sequence and all subsequent
     *  etc.
     */
    if (stats['nInfersSinceReset'] <= this._burnIn) {
        return;
    };
    
    // Burn-in related stats
    stats['nPredictions'] += 1;
    var numExpected = Math.max(1.0, bottomUpNZ.length);
    
    stats['totalMissing'] += numMissing;
    stats['totalExtra'] += numExtra;
    stats['pctExtraTotal'] += 100.0 * numExtra / numExpected;
    stats['pctMissingTotal'] += 100.0 * numMissing / numExpected;
    stats['predictionScoreTotal'] += predictionScore;
    stats['falseNegativeScoreTotal'] += 1.0 - positivePredictionScore;
    stats['falsePositiveScoreTotal'] += negativePredictionScore;
    
    if (this._collectSequenceStats) {
        // Collect cell confidences for every cell that correctly predicted
        // current bottom up input. Normalizat confidence across each column.
        var cc = this._cellConfidence['t-1'] * this._inferActiveState['t'];
    }
    
};

TemporalPooler.prototype.compute = function(bottomUpInput,
                                            learn,
                                            computeInfOutput){
    /*
    Handle one compute, possible learning.
    
    bottomUpInput     The bottom-up input, typically from a spatial pooler
    enableLearn       If true, perform learning
    computeInfOutput  If None, default behavior is to disable the inference
                             output when enableLearn is on.
                             If true, compute the inference output
                             If false, do not compute the inference output

    returns           The active and predicted state of the TP

    It is an error to have both enableLearn and computeInfOutput set to False

    By default, we don't compute the inference output when learning because it
    slows things down, but you can override this by passing in True for
    computeInfOutput
    */
    computeInfOutput = defaultFor(computeInfOutput, null);
    
    if (computeInfOutput === null) {
        if (learn === true) {
            computeInfOutput = false;
        } else {
            computeInfOutput = true;
        };
    };
    
    if (learn === false && computeInfOutput === false) {
        console.assert("learn and computeInfOutput cannot both be false. You " +
                       "want to do *something* right?");
        return;
    };
    
    // Get the list of columns that have bottom up input
    var activeColumns = [];
    //console.log("Bottom Up Input");
    //console.log(bottomUpInput);
    for (var i = 0; i < bottomUpInput.length; i++) {
        if (bottomUpInput[i] > 0) {
            // Store the index of the active column
            // TODO: Revisit and see if we need to store a value
            activeColumns.push(i);
        };
    };
    
    console.log("Active Columns");
    console.log(activeColumns);
    
    if (learn === true) {
        this.iterationLearnNum++;
    }
    this.iterationNum++;
    
    /* Update segment duty cycles if we are crossing a "tier"
    We determine if it's time to update the segment duty cycles. Since the
    duty cycle calculation is a moving average based on a tiered alpha, it is
    important that we update all segments on each tier boundary
    */
    if (learn === true) {
        if (Segment.dutyCycleTiers.indexOf(this.iterationLearnNum) != -1) {
            for (var i = 0; i < this._numColumns; i++) {
                for (var j = 0; j < this._cellsPerColumn; j++) {
                    for (var k = 0; k < this._cells[i][j]; k++) {
                        var segment = this._cells[i][j][k];
                        segment.dutyCycle();//TODO: Implement this
                    };
                };
            };
        };
    };
    
    // Update average input density
    if (this._avgInputDensity == null) {
        this._avgInputDensity = activeColumns.length;
    } else {
        this._avgInputDensity = (0.99 * this._avgInputDensity +
                                 0.01 * activeColumns.length);
    };
    
    // Update inference state
    if (computeInfOutput === true) {
        this.updateInferenceState(activeColumns);
    }
    
    // Next, update learning state
    if (learn === true) {
        this.updateLearningState(activeColumns);
        
        /*
        Apply global decay, and remove synapses and/or segments.
        Synapses are removed if their permanence value is <= 0.
        Segments are removed when they don't have synapses anymore.
        Removal of synapses can trigger removal of whole segments!
        todo: isolate the synapse/segment retraction logic so that
        it can be called in adaptSegments, in the case where we
        do global decay only episodically.
        */
        if (this._globalDecay > 0 && ((this.iterationNum %
                                       this._maxAge) == 0)) {
            for (var i = 0; i < this._numColumns; i++) {
                for (var j = 0; j < this._cellsPerColumn; j++) {
                    var segsToDel = [];
                    for (var k = 0; k < this._cells[i][j]; k++) {
                        var segment = this._cells[i][j][k];
                        var age = (this.iterationLearnNum -
                                   segment.lastActiveIteration);
                        if (age <= this._max) {
                            continue
                        };
                        
                        var synsToDel = [];
                        for (var l = 0; l < segment.syns.length; l++) {
                            var synapse = segment.syns[l];
                            // Decrease permanence
                            synapse[2] = synapse[2] - this._globalDecay;
                            
                            if (synapse[2] <= 0) {
                                // Add this low perm synapse to list to delete
                                synsToDel.push(synapse);
                            };
                        };
                        
                        if (synsToDel.length == segment.getNumSynapses()){
                            // Remove the whole segment
                            segsToDel.push(segment);
                        } else if (synsToDel.length > 0 ) {
                            for (var m = 0; m < synsToDel.length; m++) {
                                segment.syns.remove(synsToDel[m]);
                            };
                        };
                    };
                };
            };
        };
    };
    
    // Update the prediction score stats
    // Learning always includes inference
    if (this._collectStats === true) {
        if (computeInfOutput === true) {
            var predictedState = this._inferPredictedState['t-1'];
        } else {
            var predictedState = this._learnPredictedState['t-1'];
        };
        
        this._updateStatsInferEnd(this._internalStats,
                                  activeColumns,
                                  predictedState,
                                  this._columnConfidence['t-1']);
        
        // NOTE: Another place we don't do trivial predictions
        
    };
    
    // Finally return the TP output
    var output = this.computeOutput();
    
    // Print diagnostic information based on the current verbosity level
    this.printComputeEnd(output, learn);
    
    this._resetCalled = false;
    
    return output;
};

TemporalPooler.prototype.computeOutput = function(){
    
    output = [];
    for (var i = 0; i < this._numColumns; i++) {
        output.push([]);
        for (var j = 0; j < this._cellsPerColumn; j++) {
            output[i].push(Math.random());
        };
    };
    
    return output
};

TemporalPooler.prototype.getSegmentActivityLevel = function(seg,
                                                        activeState,
                                                        connectedSynapsesOnly){
    /*
    This routine computes the activity level of a segment given activeState.
    It can tally up only connected synapses (permanence >= connectedPerm), or
    all the synapses of the segment, at either t or t-1.
    
    NOTE: This is an extreme inner loop. All optimizations are go.

    seg                      Segment object instance
    activeState              Current activity state of all cells
    connectedSynapsesOnly    Bool
    */
    var n = seg.getCount();
    var activity = 0;
    
    if (connectedSynapsesOnly === true){
        for (var i = 0; i < n; i++) {
            if (seg[i][2] >= this._connectedPerm) {
                activity += activeState[seg[i][0]][seg[i][1]];
            };
        };
    } else if (connectedSynapsesOnly === false) {
        for (var i = 0; i < n; i++) {
            activity += activeState[seg[i][0]][seg[i][1]];
        };
    };
        
    return activity;

};

TemporalPooler.prototype.inferBacktrack = function(activeColumns) {
    console.log("Not implemented.");
};

TemporalPooler.prototype.inferPhase1 = function(activeColumns,
                                                useStartCells) {
    /*
    Update the inference active state from the last set of predictions
    and the current bottom-up.

    This looks at:
        - @ref infPredictedState['t-1']
    This modifies:
        - @ref infActiveState['t']

    activeColumns  list of active bottom-ups
    useStartCells  If true, ignore previous predictions and simply turn on
                      the start cells in the active columns
    returns        True if the current input was sufficiently predicted, OR
                    if we started over on startCells.
                    False indicates that the current input was NOT predicted,
                    and we are now bursting on most columns.
    */
    // Set zeros to start
    this._inferActiveState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    
    // Phase 1 - Turn on predicted cells in each column receiving bottom-up
    // If we are following a reset, activate only the start cell in each
    // column that has bottom-up.
    
    var numPredictedColumns = 0;
    if (useStartCells === true) {
        for (var i = 0; i < activeColumns.length; i++) {
            this._inferActiveState['t'][i][0] = 1;
        };
    } else {
        // Otherwise turn on any predicted cells in each column. If there are
        // none, then turn on all cells. (Burst the column)
        for (var i = 0; i < activeColumns.length; i++) {
            var col = activeColumns[i];
            var predictingCells = [];
            for (var j = 0; j < this._cellsPerColumn; j++) {
                if (this._inferPredictedState['t-1'][col][j] > 0) {
                    predictingCells.push(j);
                };
            };
            var numPredictingCells = predictingCells.length;
            
            if (numPredictingCells > 0) {
                for (var j = 0; j < numPredictingCells; j++) {
                    var ind = predictingCells[j];
                    // Cell was in a predicted state at t-1, now in an active
                    // column. Turn it on.
                    this._inferPredictedState['t'][col][ind] = 1;
                    numPredictedColumns++;
                };
            } else {
                // No cells were in a predicted state. Burst the column.
                for (var j = 0; j < this._cellsPerColumn; j++) {
                    this._inferPredictedState['t'][col][j] = 1;
                };
            };
        };
    };
    
    // Did we predict this input "well enough"?
    // TODO: Figure out what 'well enough' means
    if (useStartCells === true ||
        numPredictedColumns >= (0.5 * activeColumns.length)) {
        return true;
    } else {
        return false;
    };
};

TemporalPooler.prototype.inferPhase2 = function(activeColumns) {
    /*
    Phase 2 for the inference state. This computes the predicted state, then
    checks to insure that the predicted state is not over-saturated, i.e.
    look too close like a burst. This indicates that there were so many
    separate paths learned from the current input columns to the predicted
    input columns that bursting on the current input columns is most likely
    generated mix and match errors on cells in the predicted columns. If
    we detect this situation, we instead turn on only the start cells in the
    current active columns and re-generate the predicted state from those.

    @returns True if we have a decent guess as to the next input.
             Returing False from here indicates to the caller that we have
             reached the end of a learned sequence.

    This looks at:
        - @ref infActiveState['t']

    This modifies:
        - @ref infPredictedState['t']
        - @ref colConfidence['t']
        - @ref cellConfidence['t']
    */
    this._inferPredictedState["t"] = zeros2D(this._numColumns,
                                          this._cellsPerColumn);
    this._cellConfidence["t"] = zeros2D(this._numColumns,
                                        this._cellsPerColumn);
    this._columnConfidence["t"] = zeros1D(this._numColumns);
    
    // Phase 2 - Compute new predicted state and update cell and column
    // confidences
    
    var numPredictedCols = 0;
    for (var i = 0; i < this._numColumns; i++) {
        // For each cell in the column
        var colPredicted = false;
        for (var j = 0; j < this._cellsPerColumn; j++) {
            
            // For each segment in the cell
            for (var k = 0; k < this._cells[i][j].length; k++) {
                var seg = this._cells[i][j][k];
                
                // See if it has the min number of active synapses
                // NOTE: This is a 
                var numActiveSynapses = this.getSegmentActivityLevel(seg,
                                                this._inferActiveState['t'],
                                                connectedSynapsesOnly = false);
                
                if (numActiveSynapses < this._activationThreshold) {
                    continue;
                }
                
                // Incorporate the confidence into the owner cell and column
                var dc = seg.dutyCycle();
                
                this._cellConfidence['t'][i][j] += dc;
                this._columnConfidence['t'][i] += dc;
                
                // If we reach threshold on the segment turn on the cell
                var active = this.isSegmentActive(seg,
                                                  this._inferActiveState['t']);
                if (active) {
                    this._inferPredictedState['t'][c][i] = 1;
                    // If we haven't counted this column yet do so.
                    if (colPredicted === false) {
                        numPredictedCols++;
                        colPredicted = true;
                    }
                };
            };
        };
    };
    
    // Normalize column and cell confidences
    var sumConfidences = arraySum(this._columnConfidence);
    if (sumConfidences > 0) {
        for (var i = 0; i < this._numColumns; i++) {
            this._columnConfidence['t'][i] /= sumConfidences;
            for (var j = 0; j < this._cellsPerColumn; j++) {
                this._cellConfidence['t'][i][j] /= sumConfidences;
            };
        };
    };
    
    // Are we predicting the required minimum number of columns?
    if (numPredictedCols >= (0.5 * this._avgInputDensity)) {
        return true;
    } else {
        return false;
    }
    
};

TemporalPooler.prototype.isSegmentActive = function(seg, activeState) {
    /*
    A segment is active if it has >= activationThreshold connected
    synapses that are active due to activeState.

    seg             A Segment instance
    activeState     The current activity of all cells
    */
    var n = seg.getCount();
    var numActiveSynapses = 0;
    
    // Loop over all synapses on the segment
    for (var i = 0; i < n; i++) {
        // If the synapse is connected, proceed
        if (seg[i][2] >= this._connectedPerm) {
            // If the connected cell is active increment our count
            if (activeState[seg[i][0]][seg[i][1]] > 0) {
                numActiveSynapses++;
                if (numActiveSynapses >= this._activationThreshold) {
                    // The segment is active, stop early.
                    return true;
                }
            };
        };
    };
    
    // If we never made it to threshold return false.
    return false;
}

TemporalPooler.prototype.learnBacktrack = function() {
    console.log("Not implemented.");
    return 0;
};

TemporalPooler.prototype.learnPhase1 = function() {
    console.log("Not implemented.");
};

TemporalPooler.prototype.learnPhase2 = function() {
    console.log("Not implemented.");
};

TemporalPooler.prototype.printComputeEnd = function(output, learn) {
    console.log("Not implemented.");
};

TemporalPooler.prototype.processSegmentUpdates = function() {
    console.log("Not implemented.");
};

TemporalPooler.prototype.updateInferenceState = function(activeColumns) {
    /*
    Update the inference state. Called from compute() on every iteration.
    
    activeColumns The list of active column indices.
    */
    
    // Copy t to t-1
    this._inferActiveState['t-1'] = this._inferActiveState['t'].slice();
    this._inferPredictedState['t-1'] = this._inferPredictedState['t'].slice();
    this._cellConfidence['t-1'] = this._cellConfidence['t'].slice();
    this._columnConfidence['t-1'] = this._columnConfidence['t'].slice();
    
    // Each phase will zero/initialize the 't' states that it affects
    
    // Update our inference input history
    if (this._maxInferBacktrack > 0) {
        if (this._prevInferPatterns.length > this._maxInferBacktrack) {
            this._prevInferPatterns.shift();
        };
        this._prevInferPatterns.push(activeColumns);
    }
    
    // Compute the active state given the predictions from last time step and
    // the current bottom-up
    var inSequence = this.inferPhase1(activeColumns, this._resetCalled);
    
    // If this input was considered unpredicted, let's go back in time and
    // replay the recent inputs from start cells and see if we can lock onto
    // this current set of inputs that way.
    if (inSequence === false) {
        this.inferBacktrack(activeColumns);
        return
    };
        
    // Compute the predicted cells and the cell and column confidences
    var inSequence = this.inferPhase2();
    
    if (inSequence === false) {
        this.inferBacktrack(activeColumns);
    };
};

TemporalPooler.prototype.updateLearningState = function(activeColumns) {
    /*
    Update the learning state. Called from compute() on every iteration
    
    activeColumns   List of active column indices
    */
    // Copy predicted and active states into t-1
    this._learnPredictedState['t-1'] = this._learnPredictedState['t'].slice();
    this._learnActiveState['t-1'] = this._learnActiveState['t'].slice();

    // Update our learning input history
    if (this._maxLearnBacktrack > 0) {
        if (this._prevLearnPatterns.length > this._maxLearnBacktrack) {
            this._prevLearnPatterns.shift();
        };
        this._prevLearnPatterns.push(activeColumns);
    };
    // Process queued up segment updates, now that we have bottom-up, we
    // can update the permanences on the cells that we predicted to turn on
    // and did receive bottom-up
    this.processSegmentUpdates(activeColumns);

    // Decrement the PAM counter if it is running and increment our learned
    // sequence length
    if (this._pamCounter > 0) {
        this.pamCounter--;
    };
    this._learnedSequenceLength++;

    // Phase 1 - Turn on the predicted cell in each column that received
    // bottom-up. If there was no predicted cell, pick one to learn to.
    if (this._resetCalled === false) {
        // Uses lrnActiveState['t-1'] and lrnPredictedState['t-1']
        // computes lrnActiveState['t']
        inSequence = this.learnPhase1(activeColumns);
  
        // Reset our PAM counter if we are in sequence
        if (inSequence === true) {
            this._pamCounter = this._pamLength;
        };
    };

    /*
    Start over on start cells if any of the following occur:
     1.) A reset was just called
     2.) We have been loo long out of sequence (the pamCounter has expired)
     3.) We have reached maximum allowed sequence length.
    
    Note that, unless we are following a reset, we also just learned or
    re-enforced connections to the current set of active columns because
    this input is still a valid prediction to learn.
    
    It is especially helpful to learn the connections to this input when
    you have a maxSeqLength constraint in place. Otherwise, you will have
    no continuity at all between sub-sequences of length maxSeqLength.
    */
    if (this._resetCalled === true || this._pamCounter == 0 ||
        (this._maxSequenceLength != 0 &&
         this._learnedSequenceLength >= this._maxSequenceLength)) {
        
        // Update average learned sequence length
        // NOTE: This seems like a pointless if/else
        if (this._pamCounter == 0) {
            sequenceLength = this.learnedSequenceLength;
        } else {
            sequenceLength = this._learnedSequenceLength - this._pamLength;
        };

        this._updateAvgLearnedSeqLength(sequenceLength);
  
        // Backtrack to an earlier starting point, if we find one
        var backSteps = 0;
        if (this._resetCalled === false) {
            backSteps = this.learnBacktrack();
        };
  
        // Start over in the current time step if reset was called, or we couldn't
        // backtrack.
        if (this._resetCalled || backSteps == 0) {
            this._learnActiveState['t'] = zeros2D(this._numColumns,
                                                  this._cellsPerColumn);
            for (var i = 0; i < activeColumns.length; i++) {
                  this.lrnActiveState['t'][activeColumns[i]][0] = 1;
            };
    
            // Remove any old input history patterns
            this._prevLearnPatterns = [];
        };
        
        // Reset PAM counter
        this._pamCounter =  this._pamLength;
        this._learnedSequenceLength = backSteps;
  
        // Clear out any old segment updates from prior sequences
        this._segmentUpdates = {};
    };
        
    // Phase 2 - Compute new predicted state. When computing predictions for
    // phase 2, we predict at  most one cell per column (the one with the best
    // matching segment).
    this.learnPhase2();
};

TemporalPooler.prototype.constructor = TemporalPooler;

/******************************************************************************
 *
 * SEGMENT
 */

var Segment = function(tp, isSequenceSeg) {
    this.tp = tp;
    this.segID = tp.segID;
    tp.segID++;
    
    this.isSequenceSeg = isSequenceSeg;
    self.lastActiveIteration = tp.iterationNum;

    this.positiveActivations = 1;
    this.totalActivations = 1;
    
    // These internal variables are used to compute the positive activations
    // duty cycle.
    // Callers should use dutyCycle()
    this._lastPosDutyCycle = 1.0 / tp.iterationLearnNum
    this._lastPosDutyCycleIteration = tp.iterationLearnNum
    
    // Each synapse is a list [srcCellCol, srcCellIdx, permanence]
    this.syns = [];
};

// These are iteration count tiers used when computing segment duty cycle.
Segment.dutyCycleTiers =  [0,       100,      320,    1000,
                           3200,    10000,    32000,  100000,
                           320000];

// This is the alpha used in each tier. dutyCycleAlphas[n] is used when
// iterationNum > dutyCycleTiers[n].
Segment.dutyCycleAlphas = [null,    0.0032,    0.0010,  0.00032,
                           0.00010, 0.000032,  0.00001, 0.0000032,
                           0.0000010];

Segment.prototype.dutyCycle = function(active, readOnly) {
    /*
    Compute/update and return the positive activations duty cycle of
    this segment. This is a measure of how often this segment is
    providing good predictions.

    @param active   True if segment just provided a good prediction
    
    @param readOnly If True, compute the updated duty cycle, but don't change
               the cached value. This is used by debugging print statements.

    @returns The duty cycle, a measure of how often this segment is
    providing good predictions.

    **NOTE:** This method relies on different schemes to compute the duty cycle
    based on how much history we have. In order to support this tiered
    approach **IT MUST BE CALLED ON EVERY SEGMENT AT EACH DUTY CYCLE TIER**
    (@ref dutyCycleTiers).

    When we don't have a lot of history yet (first tier), we simply return
    number of positive activations / total number of iterations

    After a certain number of iterations have accumulated, it converts into
    a moving average calculation, which is updated only when requested
    since it can be a bit expensive to compute on every iteration (it uses
    the pow() function).

    The duty cycle is computed as follows:

        dc[t] = (1-alpha) * dc[t-1] + alpha * value[t]

    If the value[t] has been 0 for a number of steps in a row, you can apply
    all of the updates at once using:

        dc[t] = (1-alpha)^(t-lastT) * dc[lastT]

    We use the alphas and tiers as defined in @ref dutyCycleAlphas and
    @ref dutyCycleTiers.
    */
    active = defaultFor(active, false);
    readOnly = defaultFor(readOnly, false);
    
    // For the initial tier, compute using the total number of activations
    if (this.tp._learnIterationIdx <= this.dutyCycleTiers[1]) {
        dutyCycle = this.positiveActivations / this.tp._learnIterationIdx;
        
        if (readOnly === false) {
            this._lastPosDutyCycleIteration = this.tp._learnIterationIdx;
            this._lastPosDutyCycle = dutyCycle;
        };
        
        return dutyCycle;
    };
    
    // How old is our update?
    var age = this.tp._learnIterationIdx - this._lastPosDutyCycleIteration;
    
    // If it's already up to date; we can return our cached value.
    if (age == 0 && active === false) {
        return this._lastPosDutyCycle;
    };
    
    // Figure out which alpha to use
    for (var i = 1; i < this.dutyCycleTiers.length; i++) {
        if (this.tp._learnIterationIdx >= this.dutyCycleTiers[i]){
            var alpha = this.dutyCycleAlphas[i];
            break;
        };
    };
    
    // Update duty cycle
    dutyCycle = Math.pow((1.0-alpha), age) * this._lastPosDutyCycle;
    if (active === true) {
        dutyCycle += alpha;
    };
    
    // Update cached values if not read-only
    if (readOnly === false) {
      this._lastPosDutyCycleIteration = this.tp._learnIterationIdx;
      this._lastPosDutyCycle = dutyCycle;
    };
    
    return dutyCycle;
    
};

Segment.prototype.debugPrint = function() {
    console.log("Not implemented.");
};

Segment.prototype.isSequenceSegment = function() {
    console.log("Not implemented.");
};

Segment.prototype.getNumSynapses = function() {
    console.log("Not implemented.");
};

Segment.prototype.freeNSynapses = function(numToFree,
                                           inactiveSynapseIndices,
                                           verbosity) {
    console.log("Not implemented.");
};

Segment.prototype.addSynapse = function(srcCellCol,
                                        srcCellIdx,
                                        perm) {
    console.log("Not implemented.");
};

Segment.prototype.updateSynapses = function(synapses,
                                            delta) {
    console.log("Not implemented.");
};

Segment.prototype.constructor = Segment;
