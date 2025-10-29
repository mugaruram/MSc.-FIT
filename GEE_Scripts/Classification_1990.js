// ============================================================================
// Project: Integrated Remote Sensing and Climate–Hydrology Modelling for
//          Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve
// Author: Michael Mugarura (2025)

// THIRD-PARTY ATTRIBUTIONS (retain when reusing):
//  • Google Earth Engine Docs & USGS Landsat L2 examples (Public Domain/USGS):
//    QA_PIXEL/CFMask usage and scaling factors; Foga et al. (2017)

// Thesis citation:
//  Mugarura, M. (2025). Integrated Remote Sensing and Climate–Hydrology Modelling for
//  Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve. MSc Thesis, HNEE.

// Scripted replicated for the other target years with appropriate changes expected per // dataset used

// ============================================================================

// This example demonstrates the use of the Landsat 4, 5, 7 Collection 2,
// Level 2 QA_PIXEL band (CFMask) to mask unwanted pixels.

function maskL5sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Unused
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);

  // Replace the original bands with the scaled ones and apply the masks.
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true)
              .updateMask(qaMask)
              .updateMask(saturationMask);
}

// Map the function over one year of data.
var image = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
              .filterDate('1990-01-01','1990-12-31')
              .map(maskL5sr)
              .filterMetadata('CLOUD_COVER','less_than',1)
              .median()
              .clip(mm);


// var composite = collection.median();

print(image) 
// Map.addLayer(image)
Map.centerObject(mm,10)

Map.addLayer(image, {bands: ['SR_B3','SR_B2','SR_B1'],min: 0, max: 0.3},'first_Image', 0); // open them later
Map.addLayer(image, imageVisParam, 'True Color (321)');  //  to open them later

var training = Water.merge(Builtup).merge(Barren).merge(Modified_Fields).merge(Wetlands_Mires).merge(Riparian_Forests).merge(Rocky_Mountains).merge(Grassland).merge(Shrubs);                                                           
print(training)

// we need make training dataset using prediction bands pixel value 
//Specify the bands to use in the prediction.
var bands = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7']

var trainImage = image.select(bands).sampleRegions({
  collection:training , 
  properties: ['Class'], 
  scale: 30}).randomColumn();

print(trainImage);

// //******Part 2: Prepare for the Random Forest model******

//Randomly split the samples to set some aside for testing the model's accuracy
//using the "random" column. Roughly 70% for training, 30% for testing.
var split = 0.7;
var training = trainImage.filter(ee.Filter.lt('random', split));
var testing = trainImage.filter(ee.Filter.gte('random', split));

//Print these variables to see how much training and testing data you are using
print('Samples n =', trainImage.aggregate_count('.all'));
print('Training n =', training.aggregate_count('.all'));
print('Testing n =', testing.aggregate_count('.all'));

// //******Part 3: Random Forest Classification and Accuracy Assessments******

// Run the RF model using 300 trees and 5 randomly selected predictors per split ("(300,5)"). 
// Train using bands and land cover property and pull the land cover property from classes
var classifier = ee.Classifier.smileRandomForest(300,5).train({ 
features: training,
classProperty: 'Class',
inputProperties: bands
});

// //Test the accuracy of the model

//Print Confusion Matrix and Overall Accuracy
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

//Apply the trained classifier to the image
var classified = image.select(bands).classify(classifier);


////******Part 4: Display the Final Land Cover Classification and Provide Export Options******
//////////////////////////////////////////////////////////////////////////////////////////////

var finalmap = classified;

//Add final map to the display
// ############################## final romp map ###################################################
// Map.addLayer(classified , {min:0, max:4 , palette:['blue','red','green','yellow','DFFF00','228B22']},'CR_4')
Map.addLayer(classified , {min:0, max:4 , palette:['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F']},'CR_4')
// ####################################################################################################

Map.setCenter(68.43016208178636,37.226822308412004, 10);


Export.image.toDrive({
  image:classified, 
  description:'LULC3_1990_RD', 
  folder:'LULC_RD', 
  region: mm,
  crs: 'EPSG:4326',
  scale:30,  
  maxPixels: 1e13 })


// AAAALLLLLLLLLLLLLLLLLLLAAAAAAAAAAAAAAALLLLLLLLLLLLLLLPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP''''''''''''''''''''''''''

var training = Water.merge(Builtup).merge(Barren).merge(Modified_Fields).merge(Wetlands_Mires).merge(Riparian_Forests).merge(Rocky_Mountains).merge(Grassland).merge(Shrubs);                                                           
print(training)

// ######################## Export Point SHP to ... #############################################################
// // Links: https://developers.google.com/earth-engine/apidocs/export-table-todrive 
// // Links: https://open-mrv.readthedocs.io/en/latest/Tenneson_TrainingData_GEE.html

// Export the image sample feature collection to Drive as a shapefile.
var trainImage = image.select(bands).sampleRegions({
  collection: training, 
  properties: ['Class'], 
  scale: 30,
  geometries: true
})

Export.table.toDrive({
  collection: trainImage,
  description: 'Training3_1990RD',
  folder: 'SHP',
  fileFormat: 'SHP'
});

Export.table.toAsset({
  collection: trainImage,
  description: 'Training3_1990RD',
  assetId: 'Training3_1990RD'
});

// --------------------------------------------------------------------------------------------------------------------------

// ##############################################################################################################


var chart = ui.Chart.image.byClass({
  image: ee.Image.pixelArea().multiply(1e-4).addBands(classified.rename('Classification')),
  classBand: 'Classification', 
  region: mm, 
  reducer: ee.Reducer.sum(),
  scale: 30, 
  classLabels:['Water','Builtup','Barren','Modified_Fields','Wetlands_Mires','Riparian_Forests','Rocky_Mountains','Grassland','Shrubs']}).setOptions({
    title:'LULC_Tig2020_Map1 AREA (hectare)',
    hAxis:{title:'Classes'},
    VAxis:{title:'AREA (ha)'}, 
    colors:['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F']
  })
 
  print(chart)


// // ------------------------------------------------------------------------------------------------------------------------


//******Part 5:Create a legend******
////////////////////////////////////

// // Set position of panel
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});
 
//Create legend title
var legendTitle = ui.Label({
  value: 'Classification Legend',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});
 
// Add the title to the panel
legend.add(legendTitle);
 
// //Create and style 1 row of the legend.
var makeRow = function(color, name) {
 
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });
      
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
 
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};
// //Identify palette with the legend colors
// var palette =['0000FF','FF0000','228B22','FFFF00','DFFF00','228B22','808080'];
var palette =['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F']; 

// //Identify names within the legend
var names = ['Water','Builtup','Barren','Modified_Fields','Wetlands_Mires','Riparian_Forests','Rocky_Mountains','Grassland','Shrubs'];            
 
// //Add color and names
for (var i = 0; i < 9; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  

// //Add legend to map
Map.add(legend);
