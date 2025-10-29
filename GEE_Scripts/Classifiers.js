// ============================================================================
// Project: Integrated Remote Sensing and Climate–Hydrology Modelling for
//          Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve
// Author: Michael Mugarura (2025)

// THIRD-PARTY ATTRIBUTIONS (retain when reusing):
//  • Google Earth Engine Docs & USGS Landsat L2 examples (Public Domain/USGS):
//    QA_PIXEL/CFMask usage and scaling factors.
//    (Foga et al., 2017; USGS/EE examples). Adapted & parameterized for this study.
//  • Please retain this notice when reusing.

// Thesis citation:
//  Mugarura, M. (2025). Integrated Remote Sensing and Climate–Hydrology Modelling for
//  Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve. MSc Thesis, HNEE.
// ============================================================================


////******Part 1: Adding imagery, filtering to area and date range, masking out clouds, and making a composite.******
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Insert Landsat Image Collection and filter by area using an imported shapefile
var image = ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")
  .filterBounds(CCmaine);

Map.centerObject(image,10);

// // Function to cloud mask from the pixel_qa band of Landsat 8 SR data. Bits 3 and 5 are cloud shadow and cloud, respectively.
// function maskL8sr(image) {
//   var cloudShadowBitMask = 6 << 4;
//   var cloudsBitMask = 6 << 3;

//   var qa = image.select('QA_PIXEL')
//   var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
//       .and(qa.bitwiseAnd(cloudsBitMask).eq(0));

//   return image.updateMask(mask).divide(10000)
//       .select("B[0-9]*")
//       .copyProperties(image, ["system:time_start"]);
// }

// // Filter imagery for 2019 and 2020 summer date ranges. 
// // Create joint filter and apply it to Image Collection.
// var sum20 = ee.Filter.date('1990-06-01','1990-09-30');
// var sum19 = ee.Filter.date('1991-06-01','1991-09-30');

// var SumFilter = ee.Filter.or(sum20, sum19);

// var allsum = image.filter(SumFilter);

var sum19 = ee.Filter.date('1990-01-01','1990-12-31');

var SumFilter = ee.Filter.or(sum19);

var allsum = image.filter(SumFilter);

// //Make a Composite: Apply the cloud mask function, use the median reducer, 
// //and clip the composite to our area of interest
var composite = allsum
//             .map(maskL8sr)
               .median()
               .clip(CCmaine);

//Display the Composite
Map.addLayer(composite, {bands: ['B4','B3','B2'],min: 0, max: 0.3},'Cumberland Color Image', 0);

// ////******Part 2: Add Developed Land Data******
// ///////////////////////////////////////////////

// // //Add the impervious surface layer
// var impervious = ee.ImageCollection("COPERNICUS/Landcover/100m/Proba-V-C3/Global")
//                 .select('discrete_classification')
//                 .filterDate('2018-01-01', '2019-01-01')
//                 .filterBounds(CCmaine)
//                 // .select('impervious')
//                 .map(function(image){return image.clip(CCmaine)});

// // //Reduce the image collection to 
// var reduced = impervious.reduce('median');

// // //Mask out the zero values in the data
// var masked = reduced.selfMask();

// ////******Part 3: Prepare for the Random Forest model******
// ////////////////////////////////////////////////

// //// In this example, we use land cover classes: 
// //// 1-100 = Percent Impervious Surfaces
// //// 101 = coniferous  
// //// 102 = mixed forest
// //// 103 = deciduous
// //// 104 = cultivated
// //// 105 = water
// //// 106 = cloud

// //// In this example, we use land cover classes: (my work)
// //// 1-100 = Percent Impervious Surfaces
// //// 80 = water                           0032C8
// //// 50 = Builtup                         FA0000	
// //// 60 = Barren                          B4B4B4
// //// 40 = Modified_Fields                 F096FF
// //// 90 = Wetlands_Mires                  0096A0
// //// 125 = Mixed_Forests                  929900

// //Merge land cover classifications into one feature class
// var newfc = coniferous.merge(mixedforest).merge(deciduous).merge(cultivated).merge(water);
var newfc = Water.merge(Builtup).merge(Mixed_Forests).merge(Barren).merge(Modified_Fields).merge(Wetlands_Mires);

// var newfc = Water.merge(Builtup).merge(Barren).merge(Modified_Fields).merge(Wetlands_Mires).merge(Mixed_Forests);

// //Specify the bands to use in the prediction.
var bands = ['B3', 'B4', 'B5', 'B6', 'B7'];

// //Make training data by 'overlaying' the points on the image.
var points = composite.select(bands).sampleRegions({
  collection: newfc, 
  properties: ['Class'], 
  scale: 30
}).randomColumn();

print(points);

// //Randomly split the samples to set some aside for testing the model's accuracy
// //using the "random" column. Roughly 80% for training, 20% for testing.
var split = 0.8;
var training = points.filter(ee.Filter.lt('random', split));
var testing = points.filter(ee.Filter.gte('random', split));

//Print these variables to see how much training and testing data you are using
print('Samples n =', points.aggregate_count('.all'));
print('Training n =', training.aggregate_count('.all'));
print('Testing n =', testing.aggregate_count('.all'));

// // //******Part 4: Random Forest Classification and Accuracy Assessments******
// //////////////////////////////////////////////////////////////////////////


// // Run the RF model using 300 trees and 5 randomly selected predictors per split ("(300,5)"). 
// // Train using bands and land cover property and pull the land cover property from classes
var classifier = ee.Classifier.smileRandomForest(300,5).train({ 
features: training,
classProperty: 'Class',
inputProperties: bands
});

// ee.Classifier.smileCart(maxNodes, minLeafPopulation)
// ee.Classifier.libsvm(decisionProcedure, svmType, kernelType, shrinking, degree, gamma, coef0, cost, nu, terminationEpsilon, lossEpsilon, oneClass)
// //Test the accuracy of the model
////////////////////////////////////////

// //Print Confusion Matrix and Overall Accuracy
var confusionMatrix = classifier.confusionMatrix();
print('Confusion matrix: ', confusionMatrix);
print('Training Overall Accuracy: ', confusionMatrix.accuracy());
var kappa = confusionMatrix.kappa();
print('Training Kappa', kappa);
 
var validation = testing.classify(classifier);
var testAccuracy = validation.errorMatrix('Class', 'classification');
print('Validation Error Matrix RF: ', testAccuracy);
print('Validation Overall Accuracy RF: ', testAccuracy.accuracy());
var kappa1 = testAccuracy.kappa();
print('Validation Kappa', kappa1);

// ##################################################################################################
// Add a random value field to the sample and use it to approximately split 80%
// of the features into a training set and 20% into a validation set.
// sample =  points.randomColumn();
var sample = composite.select(bands).sampleRegions({
  collection: newfc, 
  properties: ['Class'], 
  scale: 30
}).randomColumn();

var trainingSample = sample.filter('random <= 0.8');
var validationSample = sample.filter('random > 0.8');

// Train a CART classifier (up to 10 leaf nodes in each tree) from the
// training sample.
var trainedClassifier = ee.Classifier.smileCart(10).train({
  features: training,
  classProperty: 'Class',
  inputProperties: bands
});

// Get information about the trained classifier.
print('Results of trained classifier', trainedClassifier.explain());

// Get a confusion matrix and overall accuracy for the training sample.
var trainAccuracy = trainedClassifier.confusionMatrix();
print('Training error matrix', trainAccuracy);
print('Training overall accuracy', trainAccuracy.accuracy());

// Get a confusion matrix and overall accuracy for the validation sample.
validationSample = validationSample.classify(trainedClassifier);
var validationAccuracy = validationSample.errorMatrix('Class', 'classification');
print('Validation error matrix', validationAccuracy);
print('Validation accuracy CART', validationAccuracy.accuracy());

// Classify the reflectance image from the trained classifier.
// var imgClassified = img.classify(trainedClassifier);

// ########################################################################################
// Add a random value field to the sample and use it to approximately split 80%
// of the features into a training set and 20% into a validation set.
var sample = composite.select(bands).sampleRegions({
  collection: newfc, 
  properties: ['Class'], 
  scale: 30
}).randomColumn();

var trainingSample = sample.filter('random <= 0.8');
var validationSample = sample.filter('random > 0.8');

// Train an SVM classifier (C-SVM classification, voting decision procedure,
// linear kernel) from the training sample.
var trainedClassifier = ee.Classifier.libsvm().train({
  features: trainingSample,
  classProperty: 'Class',
  inputProperties: bands
});

// Get information about the trained classifier.
print('Results of trained classifier', trainedClassifier.explain());

// Get a confusion matrix and overall accuracy for the training sample.
var trainAccuracy = trainedClassifier.confusionMatrix();
print('Training error matrix', trainAccuracy);
print('Training overall accuracy', trainAccuracy.accuracy());

// Get a confusion matrix and overall accuracy for the validation sample.
validationSample = validationSample.classify(trainedClassifier);
var validationAccuracy = validationSample.errorMatrix('Class', 'classification');
print('Validation error matrix', validationAccuracy);
print('Validation accuracy SVM', validationAccuracy.accuracy());

// // Classify the reflectance image from the trained classifier.
// var imgClassified = img.classify(trainedClassifier);
