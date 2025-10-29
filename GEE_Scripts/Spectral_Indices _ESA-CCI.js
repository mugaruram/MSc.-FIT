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

// ============================================================================
// https://developers.google.com/earth-engine/guides/charts_style
// https://developers.google.com/earth-engine/guides/charts_image_collection#uichartimagedoyseries
// https://www.youtube.com/watch?v=ZKKLNDrQxWw
// https://www.youtube.com/watch?v=De_cemkG73o 

// var = l8.ee.ImageCollection("LANDSAT/LC08/C02/T1_L2") // Surface Reflectance 
var filtered_region = l8.filterBounds(roi);
var filtered_meta_reg = filtered_region.filterMetadata('CLOUD_COVER','less_than',20);

var filtered_date_meta_reg = filtered_meta_reg.filterDate('2020-01-01','2020-12-31');

// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

filtered_date_meta_reg = filtered_date_meta_reg.map(applyScaleFactors);


var median_image = filtered_date_meta_reg.median();

// Map.addLayer(median_image, imageVisParam)

//plotting spectral response curve

var subset = median_image.select('SR_B[2-7]');
print("By Michael");
var samples = ee.FeatureCollection([Water_Bodies, Sparse_Vegetaion, Croplands, Wetlands, Tree_Cover, Bare_Areas, Grasslands, Shrublands]);
 
                                    
//creating scatter chart
var plotOptions ={
  title : 'Landsat 8_SR Spectral Reflectance 2020',
  hAxis : {title:'Wavelength (nanometers)'},
  vAxis : {title: 'Reflectance'},
  lineWidth : 4,
  pointSize: 6,
  curveType: 'function',
  series:{
    0: {color:'3E00FF'}, //Water
    1: {color:'F12D2D'}, //Builtup
    2: {color:'C07F00'}, //Barren
    3: {color:'C7EEFF'}, //Modified_Fields 
    4: {color:'1A554F'}, //Wetlands_Mires
    5: {color:'38E54D'}, //Riparian_Forests
    6: {color:'716F81'}, //Rocky_Mountains
    7: {color:'FFEA66'}, //Grassland
    8: {color:'357C3C'}, //Shrubs

  }
};
// colors:['#0804ff','#ff1004','#03b819','#fbff08','#5a1b4f','#04ff0c','#727272','#033907','#08ffaf'], 
// colors:['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F'],

var wavelengths = [482,562,655,865,1609,2200];  //443,

var chart1 = ui.Chart.image.regions(
  subset, samples, ee.Reducer.mean(),10,'Class',wavelengths)
  .setSeriesNames(['Water_Bodies','Sparse_Vegetation','Croplands',
                        'Wetlands','Tree_Cover','Bare_Areas','Grasslands','Shrublands'])
  .setChartType('LineChart')
  .setOptions(plotOptions);
  
print(chart1);

// #############################################################################################
// ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")

// var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")
var l5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2') // Surface Reflectance
var filtered_region = l5.filterBounds(roi)
var filtered_meta_reg = filtered_region.filterMetadata('CLOUD_COVER','less_than',20)

var filtered_date_meta_reg = filtered_meta_reg.filterDate('2010-01-01','2010-12-31')


// Applies scaling factors.
function asf(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true);
}

filtered_date_meta_reg = filtered_date_meta_reg.map(asf);

var median_image = filtered_date_meta_reg.median()

// Map.addLayer(median_image, imageVisParam)

//plotting spectral response curve

var subset = median_image.select('SR_B[1-7]');
print("By Michael");
var samples = ee.FeatureCollection([Water_Bodies, Sparse_Vegetaion, Croplands, Wetlands, Tree_Cover, Bare_Areas, Grasslands, Shrublands]);
 
                                    
//creating scatter chart
var plotOptions ={
  title : 'Landsat 5_SR Spectral Reflectance 2010',
  hAxis : {title:'Wavelength (nanometers)'},
  vAxis : {title: 'Reflectance'},
  lineWidth : 4,
  pointSize: 6,
  curveType: 'function',
  series:{
    0: {color:'3E00FF'}, //Water
    1: {color:'F12D2D'}, //Builtup
    2: {color:'C07F00'}, //Barren
    3: {color:'C7EEFF'}, //Modified_Fields 
    4: {color:'1A554F'}, //Wetlands_Mires
    5: {color:'38E54D'}, //Riparian_Forests
    6: {color:'716F81'}, //Rocky_Mountains
    7: {color:'FFEA66'}, //Grassland
    8: {color:'357C3C'}, //Shrubs

  }
};
// colors:['#0804ff','#ff1004','#03b819','#fbff08','#5a1b4f','#04ff0c','#727272','#033907','#08ffaf'], 
// colors:['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F'],

var wavelengths = [482,562,655,865,1609,2200];  //443,

var chart1 = ui.Chart.image.regions(
  subset, samples, ee.Reducer.mean(),10,'Class',wavelengths)
  .setSeriesNames(['Water_Bodies','Sparse_Vegetation','Croplands',
                        'Wetlands','Tree_Cover','Bare_Areas','Grasslands','Shrublands'])
  .setChartType('LineChart')
  .setOptions(plotOptions);
  
print(chart1);

// #############################################################################################
// ee.ImageCollection("LANDSAT/LE07/C02/T1_TOA")

var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_TOA")

var filtered_region = l7.filterBounds(roi)
var filtered_meta_reg = filtered_region.filterMetadata('CLOUD_COVER','less_than',20)

var filtered_date_meta_reg = filtered_meta_reg.filterDate('2000-01-01','2000-12-31')

// Applies scaling factors.
function asf(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true);
}

filtered_meta_reg = filtered_meta_reg.map(asf);


var median_image = filtered_date_meta_reg.median()

// Map.addLayer(median_image, imageVisParam)


//plotting spectral response curve

var subset = median_image.select('B[1-7]')
print("By Michael")
var samples = ee.FeatureCollection([Water_Bodies, Sparse_Vegetaion, Croplands, Wetlands, Tree_Cover, Bare_Areas, Grasslands, Shrublands])
 
                                    
//creating scatter chart
var plotOptions ={
  title : 'Landsat 7_SR Spectral Reflectance 2000',
  hAxis : {title:'Wavelength (nanometers)'},
  vAxis : {title: 'Reflectance'},
  lineWidth : 4,
  pointSize: 6,
  curveType: 'function',
  series:{
    0: {color:'3E00FF'}, //Water
    1: {color:'F12D2D'}, //Builtup
    2: {color:'C07F00'}, //Barren
    3: {color:'C7EEFF'}, //Modified_Fields 
    4: {color:'1A554F'}, //Wetlands_Mires
    5: {color:'38E54D'}, //Riparian_Forests
    6: {color:'716F81'}, //Rocky_Mountains
    7: {color:'FFEA66'}, //Grassland
    8: {color:'357C3C'}, //Shrubs

  }
}
// colors:['#0804ff','#ff1004','#03b819','#fbff08','#5a1b4f','#04ff0c','#727272','#033907','#08ffaf'], 
// colors:['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F'],

var wavelengths = [482,562,655,865,1609,2200] //443

var chart1 = ui.Chart.image.regions(
  subset, samples, ee.Reducer.mean(),10,'Class',wavelengths)
  .setSeriesNames(['Water_Bodies','Sparse_Vegetation','Croplands',
                        'Wetlands','Tree_Cover','Bare_Areas','Grasslands','Shrublands'])
  .setChartType('LineChart')
  .setOptions(plotOptions);
  
print(chart1)
// ##################****************#############################
//  Plotting spectral response curve 
var subset = median_image.select('B[1-7]');
print("By Michael");

var samples = ee.FeatureCollection([
  Water_Bodies, Sparse_Vegetaion, Croplands, 
  Wetlands, Tree_Cover, Bare_Areas, 
  Grasslands, Shrublands
]);

// Improved chart options
var plotOptions = {
  title: 'Landsat 7_SR Spectral Reflectance 2000',
  hAxis: {
    title: 'Wavelength (nanometers)',
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    textStyle: {
      fontSize: 14
    }
  },
  vAxis: {
    title: 'Reflectance',
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    textStyle: {
      fontSize: 14
    }
  },
  legend: {
    position: 'right',
    textStyle: {
      fontSize: 14,
      bold: true
    }
  },
  lineWidth: 4,
  pointSize: 6,
  curveType: 'function',
  series: {
    0: {color: '3E00FF'}, // Water
    1: {color: 'F12D2D'}, // Sparse Vegetation
    2: {color: 'C07F00'}, // Croplands
    3: {color: 'C7EEFF'}, // Wetlands
    4: {color: '1A554F'}, // Tree Cover
    5: {color: '38E54D'}, // Bare Areas
    6: {color: '716F81'}, // Grasslands
    7: {color: 'FFEA66'}  // Shrublands
  }
};

// Wavelengths corresponding to B1–B7 (excluding B6 - thermal)
var wavelengths = [482, 562, 655, 865, 1609, 2200]; // bands 1–5, 7

// Create chart
var chart1 = ui.Chart.image.regions(
    subset, samples, ee.Reducer.mean(), 10, 'Class', wavelengths)
  .setSeriesNames([
    'Water_Bodies', 'Sparse_Vegetation', 'Croplands',
    'Wetlands', 'Tree_Cover', 'Bare_Areas',
    'Grasslands', 'Shrublands'
  ])
  .setChartType('LineChart')
  .setOptions(plotOptions);

print(chart1);

// ################*****************#############################

// #############################################################################################
// ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")

// var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")
var l5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2') // Surface Reflectance
var filtered_region = l5.filterBounds(roi)
var filtered_meta_reg = filtered_region.filterMetadata('CLOUD_COVER','less_than',20)

var filtered_date_meta_reg = filtered_meta_reg.filterDate('1990-01-01','1990-12-31')


// Applies scaling factors.
function asf(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true);
}

filtered_date_meta_reg = filtered_date_meta_reg.map(asf);

var median_image = filtered_date_meta_reg.median()

// Map.addLayer(median_image, imageVisParam)

//plotting spectral response curve

var subset = median_image.select('SR_B[1-7]');
print("By Michael");
var samples = ee.FeatureCollection([Water_Bodies, Sparse_Vegetaion, Croplands, Wetlands, Tree_Cover, Bare_Areas, Grasslands, Shrublands]);
 
                                    
//creating scatter chart
var plotOptions ={
  title : 'Landsat 5_SR Spectral Reflectance 1990',
  hAxis : {title:'Wavelength (nanometers)'},
  vAxis : {title: 'Reflectance'},
  lineWidth : 4,
  pointSize: 6,
  curveType: 'function',
  series:{
    0: {color:'3E00FF'}, //Water
    1: {color:'F12D2D'}, //Builtup
    2: {color:'C07F00'}, //Barren
    3: {color:'C7EEFF'}, //Modified_Fields 
    4: {color:'1A554F'}, //Wetlands_Mires
    5: {color:'38E54D'}, //Riparian_Forests
    6: {color:'716F81'}, //Rocky_Mountains
    7: {color:'FFEA66'}, //Grassland
    8: {color:'357C3C'}, //Shrubs

  }
};
// colors:['#0804ff','#ff1004','#03b819','#fbff08','#5a1b4f','#04ff0c','#727272','#033907','#08ffaf'], 
// colors:['3E00FF','F12D2D','FFEA66','C07F00','C7EEFF','38E54D','716F81','357C3C','1A554F'],

var wavelengths = [482,562,655,865,1609,2200];  //443,

var chart1 = ui.Chart.image.regions(
  subset, samples, ee.Reducer.mean(),10,'Class',wavelengths)
  .setSeriesNames(['Water_Bodies','Sparse_Vegetation','Croplands',
                        'Wetlands','Tree_Cover','Bare_Areas','Grasslands','Shrublands'])
  .setChartType('LineChart')
  .setOptions(plotOptions);
  
print(chart1);