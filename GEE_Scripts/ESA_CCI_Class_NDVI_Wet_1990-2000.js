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

// Script replicated for the other decades with appropriate changes expected per 
// dataset used
// ============================================================================

// Define the Area of Interest (AOI) for Tigrovaya Balka State Nature Reserve
// var tigrovayaBalka = ee.Geometry.Polygon([
//   [[69.4, 37.2], [69.4, 37.6], [70.0, 37.6], [70.0, 37.2], [69.4, 37.2]] // Example boundary 
// ]);
Map.centerObject(tigrovayaBalka, 10);

// Load ESA CCI Land Cover dataset
var esaLC = ee.Image('users/mugarura_michael/ESA_CCI_LandCover_2000')
                      // .clip(tigrovayaBalka)
                      .reproject('EPSG:4326', null, 300);  // 300 is the scale
                      
// var esaLC = ee.ImageCollection("ESA/WorldCover/v100").first();
Map.addLayer(esaLC.clip(tigrovayaBalka), {min: 10, max: 200, palette: ['green', 'blue', 'brown']}, 'ESA Land Cover');

Map.addLayer(esaLC.clip(tigrovayaBalka), {min: 10, max: 200, palette:[
                                                        '#aaf0f0',  //10 Cropland, rainfed, yellow
                                                        '#8ca000',	//100 Mosaic tree and shrub (>50%) / herbaceous cover (<50%) 
                                                        '#ffff64',	//11 Rainfed herbaceous crops
                                                        '#be9600',	//110 Mosaic herbaceous cover (>50%) / tree and shrub (<50%)
                                                        '#966400',	//120 Shrubland
                                                        '#ffb432',	//130 Grassland
                                                        '#ffebaf',	//150 Sparse vegetation (tree, shrub, herbaceous cover) (<15%)/Bare** 
                                                        '#aaf0f0',	//20 Cropland, irrigated or post-flooding
                                                        '#FFF5D7',	//200 Bare areas
                                                        '#0046c8',	//210 Water bodies
                                                        '#dcf064',	//30 Mosaic cropland (>50%) / natural vegetation (tree, shrub, herbaceous cover) (<50%)
                                                        '#c8c864',	//40 Mosaic natural vegetation (tree, shrub, herbaceous cover) (>50%) / cropland (<50%)
                                                        '#00a000',	//60 Tree cover, broadleaved, deciduous, closed to open (>15%) 
                                                        '#C31400'   //190 Urban areas (this is not reflected)
                                                         ]}, 'ESA CCI Land Cover 2000');

// Select Multiple Land Cover Classes (e.g., Grasslands: 130, Croplands: 10)
var selectedClasses = esaLC.eq(10).or(esaLC.eq(100)).or(esaLC.eq(11)).or(esaLC.eq(110)).or(esaLC.eq(120))
                                  .or(esaLC.eq(130)).or(esaLC.eq(150)).or(esaLC.eq(20)).or(esaLC.eq(200)) // Add more `.or()` for additional classes
                                  .or(esaLC.eq(210)).or(esaLC.eq(30)).or(esaLC.eq(40)).or(esaLC.eq(60));

var selectedMask = selectedClasses.clip(tigrovayaBalka);



// Load Landsat 7 Surface Reflectance dataset
var landsat7 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")//('LANDSAT/LE07/C02/T1_L2')//
  .filterBounds(tigrovayaBalka)
  .filterDate('1990-01-01','2000-12-31') // Landsat 7 available from 1999 ('1990-01-01','2000-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20)); // Filter low-cloud images
  
  
// Function to calculate NDVI
var calculateNDVI = function(image) {
  var ndvi = image.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI');
  return image.addBands(ndvi);
};


// Apply NDVI calculation to Landsat 7
var landsatNDVI = landsat7.map(calculateNDVI);

// Mask NDVI with Selected Land Cover Classes
var maskedNDVI = landsatNDVI.map(function(image) {
  return image.updateMask(selectedMask).select('NDVI');
});

// Compute Yearly Median NDVI
var yearlyNDVI = ee.ImageCollection(
  ee.List.sequence(1990, 2000).map(function(year) {
    year = ee.Number(year); //(1990, 2000)
    var filtered = maskedNDVI.filter(ee.Filter.calendarRange(year, year, 'year')).median();
    return filtered.set('year', year).clip(tigrovayaBalka);
  })
);


// #############################
// Define the target years and winter season months
var startYear = 1990;
var endYear = 2000;
var startMonth = 1; //1 January wet or 6 June dry
var endMonth = 3;   // 3 March  wet  0r 9 september dry

// Compute Winter Season Median NDVI for Each Year
var winterNDVI = ee.ImageCollection(
  ee.List.sequence(startYear, endYear).map(function(year) {
    year = ee.Number(year);
    var filtered = maskedNDVI.filter(ee.Filter.calendarRange(year, year, 'year')) // Filter by year
                             .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month')) // Filter by winter months
                             .median(); // Compute median NDVI for the season
    // Create and cast the year band to Float
    var yearBand = ee.Image.constant(year).rename('year').toFloat();
    return filtered.addBands(yearBand).clip(tigrovayaBalka); // Add year band to NDVI
  })
);


// Print Winter NDVI for the Period
print('Winter NDVI (1990–2000):', winterNDVI);

// Calculate Winter NDVI Trends
var winterNDVITrend = winterNDVI.select(['year', 'NDVI']).reduce(ee.Reducer.linearFit());

// Extract Slope and Offset
var winterSlope = winterNDVITrend.select('scale').clip(tigrovayaBalka); // Slope of NDVI trend
var winterOffset = winterNDVITrend.select('offset').clip(tigrovayaBalka); // Baseline NDVI

// Visualization Parameters
var slopeVis = {min: -0.01, max: 0.01, palette: ['red', 'white', 'green']};
var offsetVis = {min: 0, max: 1, palette: ['blue', 'white', 'yellow']};

// Add Winter NDVI Trend Layers to the Map
Map.addLayer(winterSlope, slopeVis, 'Wet NDVI Trend (Slope) 1990-2000');
Map.addLayer(winterOffset, offsetVis, 'Wet NDVI Trend (Offset) 1990-2000');


// Export Slope and Offset to Drive
Export.image.toDrive({
  image: winterSlope,
  description: 'WET_NDVI_Trend_Slope_1990-2000',  //'Dry_NDVI_Trend_Slope_1990-2000',
  folder:'SI_RD', 
  scale: 30,  // Landsat resolution
  crs: 'EPSG:4326',
  region: tigrovayaBalka,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: winterOffset,
  description: 'WET_NDVI_Trend_Offset_1990-2000', // 'Dry_NDVI_Trend_Offset_1990-2000',
  folder:'SI_RD', 
  scale: 30,
  crs: 'EPSG:4326',
  region: tigrovayaBalka,
  fileFormat: 'GeoTIFF'
});



// ################ *********************** STATISTICS ************** ###################################
// ####################################################################################################
// Select Multiple Land Cover Classes (e.g., Grasslands: 130, Croplands: 10)
// var selectedClasses = esaLC.eq(130).or(esaLC.eq(10)); // Add more `.or()` for additional classes

// Select Multiple Land Cover Classes (e.g., Grasslands: 130, Croplands: 10)
var selectedClasses = esaLC.eq(10).or(esaLC.eq(100)).or(esaLC.eq(11)).or(esaLC.eq(110)).or(esaLC.eq(120))
                                  .or(esaLC.eq(130)).or(esaLC.eq(150)).or(esaLC.eq(20)).or(esaLC.eq(200)) // Add more `.or()` for additional classes
                                  .or(esaLC.eq(210)).or(esaLC.eq(30)).or(esaLC.eq(40)).or(esaLC.eq(60));
                                  
var selectedMask = selectedClasses.clip(tigrovayaBalka);

// Load NDVI Trend Layers (Slope and Offset)
// var ndviTrend = ee.Image("users/mugarura_michael/ESA_CCI_NDVI_TREND_SLOPE_DRY_90-20"); // Replace with your exported path
// var ndviOffset = ee.Image("users/mugarura_michael/ESA_CCI_NDVI_TREND_OFFSET_DRY_90-20"); // Replace with your exported path
var ndviTrend = ee.Image("users/mugarura_michael/ESA_CCI_NDVI_SLOPE_WET_90-20"); // Replace with your exported path
var ndviOffset = ee.Image("users/mugarura_michael/ESA_CCI_NDVI_OFFSET_WET_90-20"); // Replace with your exported path

// Apply Land Cover Mask to NDVI Trend Layers
var slopeMasked = ndviTrend.updateMask(selectedMask);
var offsetMasked = ndviOffset.updateMask(selectedMask);

// Extract Statistics for Each Class
var slopeStats = slopeMasked.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.stdDev(),
    sharedInputs: true
  }).combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope Statistics:', slopeStats);

var offsetStats = offsetMasked.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.stdDev(),
    sharedInputs: true
  }).combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Offset Statistics:', offsetStats);

// OPTIONAL: Extract Statistics Per Class (Grasslands and Croplands)
var CroplandrainfedyellowMask = esaLC.eq(10).clip(tigrovayaBalka);
var MosaictreeshrubMask = esaLC.eq(100).clip(tigrovayaBalka);
var RainfedherbaceouscropsMask = esaLC.eq(11).clip(tigrovayaBalka);
var MosaicherbaceouscoverMask = esaLC.eq(110).clip(tigrovayaBalka);
var ShrublandMask = esaLC.eq(120).clip(tigrovayaBalka);                                                        
var GrasslandMask = esaLC.eq(130).clip(tigrovayaBalka);
var SparsevegetationMask = esaLC.eq(150).clip(tigrovayaBalka);
var CroplandirrigatedpostfloodingMask = esaLC.eq(150).clip(tigrovayaBalka);
var BareareasMask = esaLC.eq(200).clip(tigrovayaBalka);
var WaterbodiesMask = esaLC.eq(210).clip(tigrovayaBalka); 
var MosaiccroplandMask = esaLC.eq(30).clip(tigrovayaBalka); 
var MosaicnaturalvegetationMask = esaLC.eq(40).clip(tigrovayaBalka);                                                         
var TreecoverbroadleaveddeciduousMask = esaLC.eq(60).clip(tigrovayaBalka);                                                         

// ************************************************************
var slopeCroplandrainfedyellow = slopeMasked.updateMask(CroplandrainfedyellowMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Cropland rainfed - yellow:', slopeCroplandrainfedyellow);
// ************************************************************
var offsetCroplandrainfedyellow = offsetMasked.updateMask(CroplandrainfedyellowMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Cropland rainfed - yellow:', offsetCroplandrainfedyellow);
// ************************************************************
var slopeMosaictreeshrub = slopeMasked.updateMask(MosaictreeshrubMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Mosaic tree and shrub:', slopeMosaictreeshrub);
// ************************************************************
var offsetMosaictreeshrub = offsetMasked.updateMask(MosaictreeshrubMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Mosaic tree and shrub:', offsetMosaictreeshrub);
// ************************************************************
var slopeRainfedherbaceouscrops = slopeMasked.updateMask(RainfedherbaceouscropsMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Rainfed herbaceous crops:', slopeRainfedherbaceouscrops);
// ************************************************************
var offsetRainfedherbaceouscrops = offsetMasked.updateMask(RainfedherbaceouscropsMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Rainfed herbaceous crops:', offsetRainfedherbaceouscrops);
// ************************************************************
var slopeMosaicherbaceouscover = slopeMasked.updateMask(MosaicherbaceouscoverMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Mosaic herbaceous cover:', slopeMosaicherbaceouscover);
// ************************************************************
var offsetMosaicherbaceouscover = offsetMasked.updateMask(MosaicherbaceouscoverMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Mosaic herbaceous cover:', offsetMosaicherbaceouscover);
// ************************************************************
var slopeShrubland = slopeMasked.updateMask(ShrublandMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Shrubland :', slopeShrubland);
// ************************************************************
var offsetShrubland = offsetMasked.updateMask(ShrublandMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Shrubland :', offsetShrubland);
// ************************************************************
var slopeGrassland = slopeMasked.updateMask(GrasslandMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Grassland:', slopeGrassland);
// ************************************************************
var offsetGrassland = offsetMasked.updateMask(GrasslandMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Grassland:', offsetGrassland);
// ************************************************************
var slopeSparsevegetation = slopeMasked.updateMask(SparsevegetationMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Sparse vegetation:', slopeSparsevegetation);
// ************************************************************
var offsetSparsevegetation = offsetMasked.updateMask(SparsevegetationMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Sparse vegetation:', offsetSparsevegetation);
// ************************************************************
var slopeCroplandirrigatedpostflooding = slopeMasked.updateMask(CroplandirrigatedpostfloodingMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Cropland irrigated or postflooding:', slopeCroplandirrigatedpostflooding);
// ************************************************************
var offsetCroplandirrigatedpostflooding = offsetMasked.updateMask(CroplandirrigatedpostfloodingMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Cropland irrigated or postflooding:', offsetCroplandirrigatedpostflooding);
// ************************************************************
var slopeBareareas = slopeMasked.updateMask(BareareasMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Bare areas:', slopeBareareas);
// ************************************************************
var offsetBareareas = offsetMasked.updateMask(BareareasMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Bare areas:', offsetBareareas);
// ************************************************************
var slopeWaterbodies = slopeMasked.updateMask(WaterbodiesMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Water bodies:', slopeWaterbodies);
// ************************************************************
var offsetWaterbodies = offsetMasked.updateMask(WaterbodiesMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Water bodies:', offsetWaterbodies);
// ************************************************************
var slopeMosaiccropland = slopeMasked.updateMask(MosaiccroplandMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Mosaic cropland:', slopeMosaiccropland);
// ************************************************************
var offsetMosaiccropland = offsetMasked.updateMask(MosaiccroplandMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Mosaic cropland:', offsetMosaiccropland);
// ************************************************************
var slopeMosaicnaturalvegetation = slopeMasked.updateMask(MosaicnaturalvegetationMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Mosaic natural vegetation:', slopeMosaicnaturalvegetation);
// ************************************************************
var offsetMosaicnaturalvegetation = offsetMasked.updateMask(MosaicnaturalvegetationMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Mosaic natural vegetation:', offsetMosaicnaturalvegetation);
// ************************************************************
var slopeTreecoverbroadleaveddeciduous = slopeMasked.updateMask(TreecoverbroadleaveddeciduousMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend Slope - Tree cover broadleaved deciduous:', slopeTreecoverbroadleaveddeciduous);
// ************************************************************
var offsetTreecoverbroadleaveddeciduous = offsetMasked.updateMask(TreecoverbroadleaveddeciduousMask).reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: tigrovayaBalka,
  scale: 30,
  maxPixels: 1e9
});
print('NDVI Trend offset - Tree cover broadleaved deciduous:', offsetTreecoverbroadleaveddeciduous);
// ************************************************************

// '''''''''''''''''''+++++++++++++++++++++++++***************************************
// ***************************************************************************************
// *************************************************************************************
















