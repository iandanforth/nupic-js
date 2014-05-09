#!/usr/bin/env python

# import array
import os
import numpy
from PIL import Image

import idx2numpy

def isint(x):
  try: int(x)
  except: return False
  else: return True

if __name__ == "__main__":
  trainingImages =  idx2numpy.convert_from_file("train-images-idx3-ubyte")
  trainingLabels =  idx2numpy.convert_from_file("train-labels-idx1-ubyte")
  testImages =  idx2numpy.convert_from_file("t10k-images-idx3-ubyte")
  testLabels =  idx2numpy.convert_from_file("t10k-labels-idx1-ubyte")

  labelSet = set()
  labelSet.update(set(trainingLabels))
  labelSet.update(set(testLabels))

  # ints = [i for i in labelSet if isint(i)]
  # labelSet.difference_update(ints)
  # labelSet = [str(j) for j in (sorted([int(i) for i in ints]) + sorted(labelSet))]
  labelSet = [str(j) for j in sorted(labelSet)]

  extension = "png"

  format = "%%s-%%0%dd.%%s" % numpy.ceil(
    numpy.log10(len(trainingImages) + len(testImages)))

  os.mkdir("train")
  for i in labelSet:
    os.mkdir(os.path.join("train", i))
    
  labelInstanceCounters = {}
  for i, (label, data) in enumerate(zip(trainingLabels, trainingImages)):
    if not label in labelInstanceCounters:
      labelInstanceCounters[label] = 1
    else:
      labelInstanceCounters[label] += 1
    path = os.path.join("train", str(label), (format % (label, labelInstanceCounters[label], extension)))
    image = Image.fromstring("L", (data.shape[1], data.shape[0]), data.tostring())
    image.save(path)

  os.mkdir("test")
  for i in labelSet:
    os.mkdir(os.path.join("test", i))
  for i, (label, data) in enumerate(zip(testLabels, testImages)):
    path = os.path.join("test", str(label), (format % (label, i, extension)))
    image = Image.fromstring("L", (data.shape[1], data.shape[0]), data.tostring())
    image.save(path)


