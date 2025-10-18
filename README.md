# 🌍 Integrated Remote Sensing and Climate–Hydrology Modelling for Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve

**Author:** [Michael Mugarura](https://github.com/mugaruram/)  
**Affiliation:** Eberswalde University for Sustainable Development (HNEE), Faculty of Forest and Environment  
**Degree:** Master of Science (Forest Information Technology)  
**Year:** 2025  

---

## 📘 Overview

This repository contains the full analytical and modelling code developed for my MSc thesis:

> **Mugarura, M. (2025).** *Integrated Remote Sensing and Climate–Hydrology Modelling for Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve.*  
> Eberswalde University for Sustainable Development (HNEE), Germany.

The project investigates **long-term vegetation trends (1990–2020)** in the Tigrovaya Balka State Nature Reserve, southern Tajikistan, and their interactions with **climate variability** and **hydrological regulation**.  
It integrates multi-sensor remote sensing (Landsat, ESA-CCI), machine learning (RF, GAM, MLR), and statistical trend analysis (Mann–Kendall, Theil–Sen) to detect ecological degradation hotspots and quantify vegetation–climate–hydrology feedbacks.

---

## 🧩 Repository Structure

| Folder / File | Description |
|----------------|-------------|
| `GEE_Scripts/` | Google Earth Engine scripts for Landsat preprocessing, classification, and CCDC change detection |
| `Python_Scripts/` | Python notebooks for NDVI modelling (RF, GAM, MLR), hydro-climatic analysis, and trend detection |
| `R_Scripts/` | Accuracy assessment, spatial autocorrelation, and statistical summaries |
| `Appendix_Code/` | Supporting code used in the MSc thesis Appendix B (Methods Justification & Code Snippets) |
| `NOTICE.txt` | Third-party attribution and license summary (required for reuse) |
| `LICENSE` | MIT License for original code authored by Michael Mugarura |
| `README.md` | This file — project overview, instructions, and citation details |

---

## 🛰️ Key Methods and Tools

- **Remote Sensing:** ESA CCI Land Cover (300 m), Landsat TM/ETM+/OLI (30 m)  
- **Indices:** NDVI, EVI, LST, TVDI  
- **Change Detection:** Continuous Change Detection and Classification (CCDC)  
- **Machine Learning Models:** Random Forest (RF), Generalized Additive Model (GAM), Multiple Linear Regression (MLR)  
- **Statistical Analysis:** Mann–Kendall, Theil–Sen, Pearson Correlation, Moran’s I, Getis-Ord Gi*  
- **Software / Libraries:** Google Earth Engine (GEE), Python (scikit-learn, pyGAM, PyKrige, PySAL, Matplotlib/Seaborn), R (raster, caret)

---

## ⚙️ Setup and Usage

### 1️⃣ Google Earth Engine
- Log in to your [Google Earth Engine Code Editor](https://code.earthengine.google.com/).  
- Copy scripts from the `GEE_Scripts/` folder.  
- Adjust the `ROI` (Region of Interest) and time range for your study area.  
- Run sequentially: preprocessing → classification → CCDC change detection → map export.

### 2️⃣ Python Environment
```bash
# Create environment
conda create -n tbsnr python=3.10
conda activate tbsnr

# Install dependencies
pip install numpy pandas matplotlib seaborn scikit-learn pygam pykrige pysal pymannkendall.

```
### 3️⃣ R Scripts
Load and execute each R file in RStudio or via terminal:
```
r
source("R_Scripts/accuracy_assessment.R")

```
📜 License

This repository is released under the MIT License (see LICENSE).
All original code is © 2025 Michael Mugarura.

For transparency and compliance:

Reuse of third-party code follows their respective licenses (Apache 2.0, BSD-3-Clause, MIT, etc.).

See NOTICE.txt for detailed attributions and links to the original projects.

📚 Citation

If you use this repository, please cite:

Mugarura, M. (2025). Integrated Remote Sensing and Climate–Hydrology Modelling for Vegetation Trend Analysis in Tigrovaya Balka State Nature Reserve. MSc Thesis, Eberswalde University for Sustainable Development (HNEE), Germany.
[Repository link once published]

🧠 Acknowledgements

This work was supervised by Prof. Dr. Jan-Peter Mund (HNEE) and Prof. Dr. Christoph Raab (University of Hildesheim).
Special thanks to the open-source contributors of the following projects:
Google Earth Engine, scikit-learn, pyGAM, PySAL, Matplotlib, Seaborn, and the gee-ccdc-tools project (Boston University).

📬 Contact

Email: michael.mmu962@hnee.de , mugarura.michael@gmail.com

GitHub: https://github.com/mugaruram/

LinkedIn: https://www.linkedin.com/in/mugarura-michael-84042745/ 


