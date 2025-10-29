#https://blogs.fu-berlin.de/reseda/visualize-in-r/
library(raster)

getwd()
dir()
############################################################################################
###########################################################################################
#setwd("D:/Ms_Research/Msc_RStudio/Msc_Rscripts/")
setwd("D:/HP_Spectre_2023/Ms_Research/Msc_RStudio/Msc_Rscripts")
## Loading required package: sp
#img <- brick("Images/LULC2_1990_Clipped2.tif")
img <- brick("Images/Composite_1990_RD.tif") #  image 1
img <- brick("Images/Composite_2000_RD.tif") #  image 2
img <- brick("Images/Composite_2010_RD.tif") #  image 3
img <- brick("Images/Composite_2020_RD.tif") #  image 4
img
plot(img)

#shp <- shapefile("Data/Training_SHP.shp")
shp <- shapefile("SHP/Training3M_1990RD.shp") # shapefile 1
shp <- shapefile("SHP/Training3_2000RD.shp") # shapefile 2
shp <- shapefile("SHP/Training3_2010RD.shp") # shapefile 3
shp <- shapefile("SHP/Training3_2020RD.shp") # shapefile 4
shp
compareCRS(shp, img)
plotRGB(img, r = 4, g = 3, b = 2, stretch = "lin")
plot(shp, col="red", add=TRUE)

#Of course, it is also possible to examine the 
#underlying data distribution in more detail. 
#Therefore, we can look at a histogram of a specific
#band with the function hist():
green <- img[[3]]

hist (green)
hist(green,
     breaks = 20,
     xlim = c(0,0.4),
     ylim = c(0, 20000),
     xlab = "band 3 reflectance value [DN * 0.01]",## Needs more work... the histogram 
     ylab = "frequency",
     main = "histogram L8 band 3 (green)" # this title is not for SR
)



