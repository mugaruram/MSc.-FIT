# https://github.com/fabianfassnacht/Tut_MSRS_1_GEE_basics2 
#Pironkova et al. 2018

# Learning objectives

###The learning objectives of this Tutorial include:
  
#deepening our capabilities to manipulate large amounts of satellite data in the GEE
#learn how to prepare and export annual vegetation index time series in the 
#GEE (considering data only from certain phenological stages/time periods of the year)
#applying simple time-series analysis tests and trends in R to full images
#(instead of to single pixels)

# load all required packages
require(raster)
require(rkt)
require(trend)
require(zoo)
# import classification image and train and validation shapefiles
getwd()
#setwd("D:/Ms_Research/Msc_RStudio/Msc_Rscripts/")
setwd("D:/HP_Spectre_2023/Ms_Research/Msc_RStudio/Msc_Rscripts")

#setwd("D:/Ms_Research/Msc_RStudio/Msc_Rscripts/")
#Preparing annual time series data stacks with Google Earth Engine and 
#conducting time series analysis in R##

##################################
##MK-test + Seasonal and Regional Kendall tests (SKT / RKT) + Theil-Sen's Slope estimator
##################################
rasterOptions(maxmemory=1e+06, chunksize=1e+07, progress = 'text')
#setwd("D:/Ms_Research/Msc_RStudio/Msc_Rscripts/")
# Set output directory (where the results will go)
#results <-"D:/Ms_Research/Msc_RStudio/Msc_Rscripts/Results-ManKendal"
results <-"D:/HP_Spectre_2023/Ms_Research/Msc_RStudio/Msc_Rscripts/Results-ManKendal"
#results <-"D:/HP_Spectre_2023/Ms_Research/Images/Images_Raad/Results-ManKendal_RD"
message("Saving results to ", results)
# Stack rasters and then add them to brick
#bricked_files <-brick("yearly_LS_ts2.tif")
bricked_files <-brick("yearly_LS_ts_F1.tif")
#bricked_files <-brick("yearly_LS_ts_JAN-MAR_RD24A.tif")
#bricked_files <-brick("yearly_LS_ts_JUN-SEP_RD24.tif")

# Stack rasters and then add them to brick
#stacked_files <- stack(list.files(pattern = ".tif"))
#bricked_files <- brick(stacked_files)

# Remove unnecessary files from memory
rm(stacked_files)
gc()
################### xxxxxxxxxxxxxxxxxxxxxxx ###############################################

#Let's first have a look at our image time series by plotting it:
x11()
plot(bricked_files)

# Set year range for analysis (number of years have to be the same as number of bands)
#years2 <-seq(1986, 2019)
#years <- years2[-c(1,5,8)]
# Set year range for analysis (number of years have to be the same as number of bands)
# Set year range for analysis (number of years have to be the same as number of bands)
years <-seq(1990, 2020)
#years <- years2[-c(1,5,8)]

# Analysis function
rktFun <-function(x) {
  if(all(is.na(x))){		# if no data is available for the given pixel NA is returned as results
    c(NA,NA,NA)
  } else {
    analysis <-rkt(years, x)	# this executes the rkt function for a NDVI time series of an individual pixel
    a <-analysis$B # this will extract the results: theil sen slope
    b <-analysis$sl # this will extract the results: pvalue
    c <-analysis$tau # this will extract the results: Mann-Kendall tau
    return(cbind(a, b, c)) # return all results
  } }

#After defining this function, it can be applied directly to our raster time series by using the following call:
rRaster <-calc(bricked_files, rktFun) #''''''''' Be patient, this step takes a while to finish 

 #With this three lines of code we save the results to a raster
# Write to Results folder
library(rkt)
##### Annual  ############################
message("Analysis complete. Now writing results.")
writeRaster(rRaster[[1]], paste0(results,"/ts_slope.tif"), overwrite=T)#T
writeRaster(rRaster[[2]], paste0(results,"/mk_pvalue.tif"), overwrite=T)#T
writeRaster(rRaster[[3]], paste0(results,"/mk_tau.tif"), overwrite=T)#T
message("Now creating p-value masks.")

##### January --- March  ############################
message("Analysis complete. Now writing results.")
writeRaster(rRaster[[1]], paste0(results,"/ts_slope_Jan-Mar.tif"), overwrite=T)#T
writeRaster(rRaster[[2]], paste0(results,"/mk_pvalue_Jan-Mar.tif"), overwrite=T)#T
writeRaster(rRaster[[3]], paste0(results,"/mk_tau_Jan-Mar.tif"), overwrite=T)#T
message("Now creating p-value masks.")

##### June --- Sept  ############################
message("Analysis complete. Now writing results.")
writeRaster(rRaster[[1]], paste0(results,"/ts_slope_Jun-Sep.tif"), overwrite=T)#T
writeRaster(rRaster[[2]], paste0(results,"/mk_pvalue_Jun-Sep.tif"), overwrite=T)#T
writeRaster(rRaster[[3]], paste0(results,"/mk_tau_Jun-Sep.tif"), overwrite=T)#T
message("Now creating p-value masks.")

#We can of course also plot the results:
plot(rRaster)

#In the next step, we will use the calculated p-values to mask out areas for
#which the identified trends were not significant. For this, we will first 
#create three p-value masks with different significance levels:

##################################
## 5. P-Value Masking ##
##################################
# Load tau raster
tau <-raster(paste0(results, "/mk_tau.tif"))
#tau <-raster(paste0(results, "/mk_tau_Jan-Mar.tif"))
#tau <-raster(paste0(results, "/mk_tau_Jun_Sep.tif"))
# Set p-values to create masks for
p_values <-c(0.01, 0.05, 0.1)
# Loop through p-values, producing a mask for each
for(i in 1:length(p_values)){
  # Load the P-value raster 
  p_value_raster <-raster(paste0(results, "/mk_pvalue.tif")) 
  #p_value_raster <-raster(paste0(results, "/mk_pvalue_Jan-Mar.tif"))
  #p_value_raster <-raster(paste0(results, "/mk_pvalue_Jun_Sep.tif"))
  # Select current p-value 
  p_val <-p_values[[i]] 
  # Create string vers for filenaming 
  p_val_str <-gsub("\\.", "", as.character(p_val)) 
  # Mask 
  p_value_raster[p_value_raster > p_val] <-NA 
  p_masked <-mask(tau, p_value_raster) 
  # Write result 
  writeRaster(p_masked, paste0(results, "/pvalue_mask", p_val_str, ".tif"),
  #writeRaster(p_masked, paste0(results, "/pvalue_Jan-Mar", p_val_str, ".tif"),
  #writeRaster(p_masked, paste0(results, "/pvalue_Jun_Sep", p_val_str, ".tif"),
              overwrite = TRUE)
  # Cleanup
  gc()
}

plot(rRaster)
#Then, we can apply the three masks to our Mann Kendall-tau value raster files
#and save them. In this case, the tau values are further reduced to only areas 
#showing comparably high tau values of greater than 0.4 or smaller than -0.4:

#############################################
## 6. P-Value Masking with Significant Tau ##
## Note: Must be run after section 5 ##
#############################################

# Isolate tau values > 0.4 and < -0.4
sigTau <-raster(paste0(results, "/mk_tau.tif"))
#sigTau <-raster(paste0(results, "/mk_tau_Jan-Mar.tif"))
#sigTau <-raster(paste0(results, "/mk_tau_Jun_Sep.tif"))
sigTau[sigTau>(-0.4) & sigTau<0.4] <-NA
# Loop through p-values, producing a mask for each
for(i in 1:length(p_values)){
  # Select current p-value
  p_val <-p_values[[i]]
  # Create string vers for filenaming
  p_val_str <-gsub("\\.", "", as.character(p_val))
  # Read current p-value raster
  p_value_raster <-raster(paste0(results, "/pvalue_mask", p_val_str,".tif")) 
  #p_value_raster <-raster(paste0(results, "/pvalue_mask_Jan-Mar", p_val_str,".tif"))
  #p_value_raster <-raster(paste0(results, "/pvalue_mask_Jun_Sep", p_val_str,".tif"))
  # Mask significant tau with p-value raster 
  tau_masked <-mask(sigTau, p_value_raster) 
  # Write result 
  writeRaster(tau_masked, paste0(results, "/tau_mask", p_val_str, ".tif"),
  #writeRaster(p_masked, paste0(results, "/tau_mask_Jan-Mar", p_val_str, ".tif"),
  #writeRaster(p_masked, paste0(results, "/tau_mask_Jun_Sep", p_val_str, ".tif"),
              overwrite = TRUE) 
}

#To have a look at the last created result (tau values with trends greater than
#0.4 and a p-value of smaller than 0.1) we can run:

plot(tau_masked)

#Step 3: Identify turning points
vals <- values(bricked_files)
head(vals)

#However, what is important to understand is that in the derived variable vals,
#each row contains the time series of a single pixel. Hence, we can now simply 
#apply the pettitt-test to each of the rows using a for-loop and store the results:

# create empty matrix to store results
res <- matrix(nrow=nrow(vals), ncol=2)

# start looping through the pixels 
for (i in 1:nrow(vals)){
  
  # get time series of first pixel
  x <- vals[i,]
  
  # check if there is data in the pixel
  if(all(is.na(x))){
    
    # if not, save NA, NA as result
    res[i,] <- c(NA,NA)
    
  } else {
    
    # if there is data, fill data gaps in the time series using simple interpolation
    x1 <- na.approx(na.approx(x))
    # apply the pettitt test
    analysis <- pettitt.test(x1)
    # extract the results
    a <-as.numeric(analysis$estimate)[1] # pettitt test (id at which time step the change occurred)
    b <-analysis$p.value 
    # save the results
    res[i,] <- cbind(a, b)
    
  } 
  # print current iteration
  print(i)
} 

 #The next step now is to re-copy the results (which are currently stored in a 
#matrix) into the raster-format to re-construct the spatial information. To do 
#this, we simply copy one of the bands of our time series dataset and the 
#overwrite its values with the results of the pettitt test.

#For the p-values obtained for the pettitt-test we can do this by running the following code:
# get a single raster band of the time series (does not matter which one)

pettitt.p.val <- bricked_files[[1]] # original value is 1
# overwrite the values of the raster band with the p-values obtained for the pettitt-test
# this step only works because our results file has exactly the same number rows as the
# raster has pixels
values(pettitt.p.val) <- res[,2] #initial is 2
# plot the resulting raster
plot(pettitt.p.val)

#To accomplish this we run the following code.
# copy the results concerning turning points in a new variable
turnp <- res[,1] #initial value is 1

# change each of the id values to the corresponding year
for (i in 1:length(years)){
  
  turnp[turnp==i] <- years[i]
  print(i)
  
}

#Subsequently, we follow the same strategy as above for the p-values to copy the final results back into a raster:
# get a single raster band of the time series (does not matter which one)
pettitt.timep <- bricked_files[[1]] # initial value is 1
# overwrite the pixel values with the results
values(pettitt.timep) <- turnp
# plot the turning point raster
plot(pettitt.timep)
#my.legend.size <-legend("topright",c("from 1990","to     2020"))

#Finally, we can mask out all pixels for which the pettitt test was not significant by first creating a p-value mask:
mask <- pettitt.p.val < 00.5
plot(mask)

# And then apply the mask to the turning point raster:
timep_fin <- mask(pettitt.timep, mask, maskvalue=0, updatevalue=NA)
plot(timep_fin)

####################### STASTICTICS ###########################################




































