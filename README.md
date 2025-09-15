# Generalized Additive Models (GAM) for non-linear regression 
Generalized Additive Models (GAMs) were used for non-linear regression between NDVI and climatic predictors (Temp, Precip, LST, TVDI). 
Their flexibility to fit smooth curves without strict parametric assumptions is ideal for ecological processes. 
Smoothing parameters were optimized using Generalized Cross Validation (GCV). 
Significant thresholds emerged, such as NDVI sensitivity to temperatures above 30°C and TVDI peaking at ~0.6.

Performance Metrics
<img width="1389" height="989" alt="image" src="https://github.com/user-attachments/assets/ace15ba6-5b7d-4995-8ed4-b40781e96f6f" />

Random Forest Model Summary for NDVI Prediction
Feature Importance:

     Feature  Importance    
0       LST_C     -   0.369424

1       TVDI     -    0.333949

2       Temp_0C   -   0.167816

3       Precip_cm  -  0.128811
