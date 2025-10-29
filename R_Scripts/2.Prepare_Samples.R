#https://blogs.fu-berlin.de/reseda/prepare-samples/
#install.packages("raster")
library(raster)

#setwd("D:/Ms_Research/Msc_RStudio/Msc_Rscripts/")
setwd("D:/HP_Spectre_2023/Ms_Research/Msc_RStudio/Msc_Rscripts")

# import image (img) and shapefile (shp)
#img <- brick("Images/LULC2_1990_Clipped2.tif")
(img <- brick("Images/Composite_1990_RD.tif"))# image 1
(img <- brick("Images/Composite_2000_RD.tif")) #  image 2
(img <- brick("Images/Composite_2010_RD.tif")) #  image 3
(img <- brick("Images/Composite_2020_RD.tif")) #  image 4

#shp <- shapefile("Data/Training_SHP.shp")
(shp <- shapefile("SHP/Training3M_1990RD.shp")) # shapefile 1
(shp <- shapefile("SHP/Training3_2000RD.shp"))  # shapefile 2
(shp <- shapefile("SHP/Training3_2010RD.shp")) # shapefile 3
(shp <- shapefile("SHP/Training3_2020RD.shp")) # shapefile 4
#shp
plotRGB(img, r = 4, g = 3, b = 2, stretch = "lin")
plot(shp, col="red", add=TRUE)

#later turn this column into the factor data type because classifiers can only 
#work with integer values instead of words like “water” or “urban”. 
#When converting to factors, strings are sorted alphabetically and numbered
#consecutively. In order to be able to read the classification image at the end,
#you should make a note of your classification key:

levels(as.factor(shp$M_classes))

for (i in 1:length(unique(shp$M_classes))) {cat(paste0(i, " ", 
             levels(as.factor(shp$M_classes))[i]), sep="\n")}

names(img)

# extract samples with class labels and put them all together in a dataframe
(names(img) <- c("SR_B1","SR_B2","SR_B3","SR_B4","SR_B5","SR_B7"))

.rs.unloadPackage("tidyr") # run this incase tydr extract is interfaring with raster extract.
(smp <- extract(img, shp, df = TRUE))

smp$cl <- as.factor(shp$M_classes[match(smp$ID, seq(nrow(shp)))])
smp <- smp[-1]

summary(smp$cl)


str(smp)

# Optional If you only include spectral information in your classifier, as in
#our example, it is often helpful to plot the so-called spectral profiles, or 
#z-profiles.

(sp <- aggregate( . ~ cl, data = smp, FUN = mean, na.rm = TRUE ))
# plot empty plot of a defined size
plot(0,
     ylim = c(min(sp[2:ncol(sp)]), max(sp[2:ncol(sp)])),
     xlim = c(1, ncol(smp)-1),
     type = 'n',
     xlab = "L8_SR bands(yr2020)",#L5_SR bands(yr1990),L7_SR bands(yr2000),L5_SR bands(yr2010), L8_SR bands(yr2020)
     ylab = "reflectance [% * 100]"
     )

plot(0,
     ylim = c(min(sp[2:ncol(sp)]), max(sp[2:ncol(sp)])),
     xlim = c(1, ncol(smp)-1),
     type = 'n',
     xlab = "L5_SR bands(yr1990)",#L5_SR bands(yr1990),L7_SR bands(yr2000),L5_SR bands(yr2010), L8_SR bands(yr2020)
     ylab = "reflectance [% * 100]",
     cex.lab = 1.5,
     cex.axis = 1.2,
)

# define colors for class representation - one color per class necessary!
mycolors <- c("#3E00FF","#F12D2D","green","yellow","brown4","lightgreen","#716F81","#357C3C","#1A554F")


# draw one line for each class
for (i in 1:nrow(sp)){
  lines(as.numeric(sp[i, -1]),
        lwd = 4, #initial 4
        col = mycolors[i]
  )
}
# add a grid
grid()
# add a legend
legend(as.character(sp$cl),
       x = "topleft",
       col = mycolors,
       lwd = 5, # initial 5
       cex = 1.5,
       #title.font = text.font[1],
       bty = "n"
)

