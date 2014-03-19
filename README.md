nupic-js
========
[![Build Status](https://travis-ci.org/iandanforth/nupic-js.png?branch=master)](https://travis-ci.org/iandanforth/nupic-js)

A port of NuPIC to JavaScript

Usage:

  git clone git@github.com:iandanforth/nupic-js.git
  cd nupic-js
  npm install .
  npm start
  [In Chrome]
  http://localhost:8000/examples/index.html

Things to play with:

Local vs Global Topologies

The example (examples/index.html) defaults to using small receptive fields for each column. Modify the instantiation of the spatial pooler so that the receptive fields cover the whole input.

Local vs Global Inhibition

The default is local inhibition, turn on global inhibition and increase the numActiveColumnsPerInhArea to something like 5.

Alternate input image

Find another 128x128 image and use it instead of examples/images/Image2.png. The example uses the red channel of the image only.

Development Notes:

  - The temporal pooler is not implemented.
  - The code is in no way optimized. It is intended primarily for explanitory visualizations which only require small networks.
  - The code is not well tested and where tested only in Chrome.
  - The spatial pooler is a direct port but has modifications
  -- Where modifications were made a note about the divergence was added to the source.
  - 2D Topology is supported, which is not true in either the cpp or py versions.

Major Divergences from CPP/PY

  - New constructor parameters expose previously internal variables and control points
  - 2D Topology is supported
  - Boosting is now a purely local column property
  - Bump up weak columns is not used, it doesn't make sense biologically.
  - The percentage of connected synapses on init is definite rather than an average
  - When you only have a few columns we spread them to evenly cover the input
  -- Note: There can still be gaps in coverage if your radius is too small.
  - Overlap scores support scalar inputs.
