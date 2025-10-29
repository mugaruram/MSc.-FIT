# ============================================================================
# Project: Integrated Remote Sensing and Climate–Hydrology Modelling for
#          Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve
# Author: Michael Mugarura (2025)
# License: MIT (for original code). See NOTICE.txt for third-party notices.
#
# THIRD-PARTY ATTRIBUTIONS (retain when reusing):
#  • caret (GPL-2/GPL-3), raster/terra, sf: general spatial/statistics utilities
#
# Thesis citation:
#  Mugarura, M. (2025). Integrated Remote Sensing and Climate–Hydrology Modelling for
#  Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve. MSc Thesis, HNEE.
# ============================================================================


# accuracy_assessment.R
# Compute confusion matrix and summary accuracy metrics.
ref <- c()  # TODO
pred <- c() # TODO
if (length(ref) == 0) stop("TODO: supply ref and pred vectors.")
if (!requireNamespace("caret", quietly=TRUE)) stop("Install 'caret' first.")
library(caret)
cm <- confusionMatrix(as.factor(pred), as.factor(ref))
print(cm)
