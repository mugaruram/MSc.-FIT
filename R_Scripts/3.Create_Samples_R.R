# https://blogs.fu-berlin.de/reseda/create-samples-in-r/

#We will use equalized stratified random sampling for this example. This is a 
#complete R script you need in order to automatically generate exactly 50 samples
#per class within your study extent:

# import package
library(raster)

# import classification image (last chapter)
getwd()
#setwd("/D:/Ms_Research/Msc_RStudio/Msc_Rscripts/")
setwd("D:/HP_Spectre_2023/Ms_Research/Msc_RStudio/Msc_Rscripts/")
#img.classified <- raster("Classification_2000b.tif")
#img.classified <- raster("LULC2_1990_RD1.tif")
#img.classified <- raster("LULC3_1990_RD.tif")
img.classified <- raster("Classification_1990.tif") #image 1
img.classified <- raster("Classification_2000.tif") # image 2
img.classified <- raster("Classification_2010.tif") # image 3
img.classified <- raster("Classification_2020.tif") # image 4

# create 50 test samples per class,We will use equalized stratified random sampling 
#to generate exactly 50 samples per class within my study extent:
samplesperclass <- 50

#The raster provides a function called sampleStratified(), which does all the work for us:
smp.test <- sampleStratified(img.classified, size = samplesperclass, na.rm = TRUE, sp = TRUE)

#We can now check the class labels of our newly extracted validation points:
#smp.test$Classification_2000b
#smp.test$LULC2_1990_RD1
#smp.test$LULC3_1990_RD
smp.test$Classification_1990
smp.test$Classification_2000
smp.test$Classification_2010
smp.test$Classification_2020

# shuffle test samples
smp.test <- smp.test[sample(nrow(smp.test)), ]

#By looking at the class labels again, we see that the order is now random:
#smp.test$Classification_2000b
#smp.test$LULC2_1990_RD1
smp.test$Classification_1990
smp.test$Classification_2000
smp.test$Classification_2010
smp.test$Classification_2020


#In addition, we can delete all variables in our dataframe smp.test and append
#a consecutive ID variable called ID, which will then be displayed to us in QGIS:

# delete attributes
smp.test <- smp.test[ , -c(1, 2)]
# create standard ID attribute
smp.test$ID <- 1:nrow(smp.test)
smp.test

#To visualize the distribution of our validation points, we can plot the 
#SpatialPointDataFrame smp.test on top of our classification map in one plot:
  
# plot(img.classified, 
#       axes = FALSE, 
#       box = FALSE,
#       col = c("#fbf793", "#006601", "#bfe578", "#d00000", "#fa6700", "#6569ff")
# )


plot(img.classified, 
     axes = FALSE, 
     box = FALSE,
     col = c("#3E00FF","#F12D2D","#FFEA66","#C07F00","#C7EEFF","#38E54D","#716F81","#357C3C","#1A554F")
)

plot(img.classified, 
     axes = FALSE, 
     box = FALSE,
     col = c("#3E00FF","#F12D2D","green","yellow","brown4","lightgreen","#716F81","#357C3C","#1A554F")
)


points(smp.test)
 
# save test samples as point shapefile
shapefile(smp.test,
          #filename = "validation11_RF1990_RD.shp", # Initial file is validation_RFnew.shp
          #filename = "validation_RF2000_RD.shp",
          #filename = "validation_RF2010_RD.shp", 
          filename = "validation_RF2020_RD.shp", 
          overwrite = TRUE
)
