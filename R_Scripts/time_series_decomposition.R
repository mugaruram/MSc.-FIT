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


# time_series_decomposition.R
x <- c() # TODO monthly series
if (length(x) == 0) stop("TODO: supply time series vector.")
ts_x <- ts(x, frequency=12)
fit <- stl(ts_x, s.window="periodic")
plot(fit)
