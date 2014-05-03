function extractMNIST() {
    /*
     * Populates image and patch containers with extracted sprites
     */ 
}

function genImageTextureAndPatches( imageSource,
                                   patchContainer,
                                   imageWidth,
                                   imageHeight,
                                   patchWidth,
                                   patchHeight,
                                   patchColsPerImage,
                                   patchRowsPerImage){

    var texture = PIXI.Texture.Draw(function (canvas) {
        // We are now in a 2D context 
        canvas.width = imageWidth;   
        canvas.height = imageHeight;
        
        // Get canvas 2D context
        var context = canvas.getContext('2d');  
        
        // Create a new image object.
        var img = new Image();
      
        // Define an on load handler for this image
        img.addEventListener('load', function () {
          
            // Where the image should be put on the canvas
            var x = 0, y = 0;
        
            // Draw the image on canvas.
            context.drawImage(this, x, y);
            
            // Extract and store image sections from canvas
            for (var i = 0; i < patchRowsPerImage * patchHeight; i += patchHeight) {
                for (var j = 0; j < patchColsPerImage * patchWidth; j += patchWidth) {
                    // Get the pixel data for this section
                    var imgd = context.getImageData(j, i, patchWidth, patchHeight);
                    var pix = imgd.data;
                    var redArray = [];
                    var r = -1;
                    // Now we have an array of length patchWidth*patchHeight*4
                    // Break that up into rows for later reconstruction
                    for (var k = 0; k < pix.length; k += 4) {
                        // Every patchWidth pixels we want a new row
                        if ((k % (patchWidth * 4)) == 0){
                          r++;
                          redArray.push([]);
                        };
                        if (pix[k] > 100) {
                          redArray[r].push(0);
                        } else {
                          redArray[r].push((pix[k]) / 255);
                        };
                    };
                    //console.log(redArray);
                    patchContainer.push(redArray);
                };
              };
        }, false);
      
        // Load the image
        img.src = imageSource;
    });
    
    return texture;
}

function createBorderedSprite(imageSprite, borderWidth) {
    
    var box = new PIXI.DisplayObjectContainer();
    
    // TODO - Make this a param
    var borderBoxColor = "black";
    
    // Creating the background for the box
    var borderBox = new PIXI.Sprite(getTexture(borderBoxColor));
    borderBox.width = imageSprite.width + borderWidth * 2;
    borderBox.height = imageSprite.height + borderWidth * 2;
    box.addChild(borderBox);
    
    // Add in the image texture layer
    imageSprite.position.x = borderWidth;
    imageSprite.position.y = borderWidth;
    box.addChild(imageSprite);
    
    return box;
}