module( "SpatialPooler" );

test( "constructor", function() {
    sp = new SpatialPooler(inputDimensions = [32],
                           columnDimensions = [10]);
    ok( 1 == "1", "Passed!" );
});