
############################ FIT/MSC THESIS ################################
########################### DATA PROCESSING   ################################

##### library #####
library(dplyr)
library(pastecs) # open (every time)
library(psych)
#......................
library(tidyverse)
library(here)
library(skimr)
library(janitor)
#.................
library(nlstools)
library(ggplot2)
library(gridExtra)
library(ggpubr)
library(fitdistrplus)
library(logspline)
library(ggpmisc)


data<-read.csv("NDVI_LST_Analysis_R.csv",#, #file name)
               header = T, #data headers
               sep = ",", #column separator
               dec = ".") #character separating the integer part from the decimal
 
data # open data
View(data)
summary(data)
names(data)
list(data$NDVI)
list(data$NDVI_B)
str(data) #data properties
# important functions:
head(data,2) #first two rows
tail(data) #last 6 rows
example<-tail(data,3) #last 3 rows

# select a subset of columns -----
#cleandata <- clean_names(data)
#names(cleandata)

(data_t <- data %>% dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))
        
                                       
sum <- summary(data_t)

write.csv(sum, 
          file="D:/HP_Spectre_2023/Ms_Research/Excel_Sheets/Excel_Raad/summary_data_NDV_LST.csv")

names(data_t)
 
data_t <- data %>% dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B)%>% remove_missing()

(data <- data_t %>% 
    #group_by(species_cd)%>%
    #filter(species_cd %in% c("SO")) %>%
    arrange(desc(-YEAR))%>%
    dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))

heightk <- data$LST_C

summary(heightk)

h <- hist(heightk)

#h <- hist(data$NDVI_B)
plot(h, 
    
     freq = FALSE, 
     space = NULL,
     #xlim = c(0, 0.8),
     xlab = 'height Dispersion', # label for x-axis 
     ylab = "Frequency", # label for y-axis 
     main = "Distribution", # add title
     col = "#fc9d12") # add color "#fc9d12"

hist(heightk, prob = TRUE)
curve(dnorm(x, mean = mean(heightk), sd = sd(heightk)), add = TRUE,col = "darkblue", lwd = 3)


boxplot(heightk)

names(data)
p<-ggplot(data = data, aes(x = LST_C,NDVI))
(p2<-p + geom_point(aes(color = as.factor(Classes)))#+
  #xlab("NDVI_B")+
  #ylab("LST_C")#+
  #xlim = c(10,200)+
  #geom_vline(xintercept = 6)+ # vertical line at x equals 550
  #geom_hline(yintercept = 0.4)+ # horizontal line at y equals 2
  #geom_hline(yintercept = 0.1, colour="red")
  )# red horizontal line at y equals 4

##################+++++++++++++++++++++++++++++++++++++++########################

#######https://stackoverflow.com/questions/7549694/add-regression-line-equation-and-r2-on-graph
##################
#library(ggplot2)
#library(ggpmisc)
ggplot(data = data, aes(x = NDVI_B, y = LST_C)) +
  stat_poly_line() +
  stat_poly_eq(use_label(c("eq", "R2"))) +
  geom_point(aes(color = Classes))

ggplot(data = data, aes(x =EMM, y = LST_K)) +
  stat_poly_line() +
  stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
  geom_point()

ggplot(data = data, aes(x =EVI, y = LST_K)) +
  stat_poly_line() +
  stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
  geom_point(aes(color = Classes))

#########################
(Data <- data %>% 
    #group_by(species_cd)%>%
    #filter(YEAR %in% c("1990","BRZ","DB")) %>%
    filter(YEAR %in% c("1990")) %>%
    #arrange(desc(YEAR))%>%
    dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))

(P1<-ggplot(data = Data, aes(x = NDVI_B, y = LST_C)) +
    xlab("NDVI_1990")+
    ylab("LST_1990")+
  stat_poly_line() +
  #stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
  stat_poly_eq(use_label(c("eq", "adj.R2"))) +
  geom_point(aes(color = Classes)))

(Data <- data %>% 
    #group_by(species_cd)%>%
    #filter(YEAR %in% c("1990","BRZ","DB")) %>%
    filter(YEAR %in% c("2000")) %>%
    #arrange(desc(YEAR))%>%
    dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))

(P2<-ggplot(data = Data, aes(x = NDVI_B, y = LST_C)) +
    xlab("NDVI_2000")+
    ylab("LST_2000")+
    stat_poly_line() +
    #stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
    stat_poly_eq(use_label(c("eq", "adj.R2"))) +
    geom_point(aes(color = Classes)))

(Data <- data %>% 
    #group_by(species_cd)%>%
    #filter(YEAR %in% c("1990","BRZ","DB")) %>%
    filter(YEAR %in% c("2010")) %>%
    #arrange(desc(YEAR))%>%
    dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))

(P3<-ggplot(data = Data, aes(x = NDVI_B, y = LST_C)) +
    xlab("NDVI_2010")+
    ylab("LST_2010")+
    stat_poly_line() +
    #stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
    stat_poly_eq(use_label(c("eq", "adj.R2"))) +
    geom_point(aes(color = Classes)))

(Data <- data %>% 
    #group_by(species_cd)%>%
    #filter(YEAR %in% c("1990","BRZ","DB")) %>%
    filter(YEAR %in% c("2020")) %>%
    #arrange(desc(YEAR))%>%
    dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))

(P4<-ggplot(data = Data, aes(x = NDVI_B, y = LST_C)) +
    xlab("NDVI_2020")+
    ylab("LST_2020")+
    stat_poly_line() +
    #stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
    stat_poly_eq(use_label(c("eq", "adj.R2"))) +
    geom_point(aes(color = Classes)))


jpeg("D:/HP_Spectre_2023/Ms_Research/Images/Images_Raad/NDVI_LST.jpg",res=600,width=8300,height=4000)
BP_graph2 <- grid.arrange(P1,P2,P3,P4, nrow =2)
dev.off()

#################################### Check relationship per class###############
(Data <- data %>% 
   #group_by(species_cd)%>%
   #filter(YEAR %in% c("1990","BRZ","DB")) %>%
   filter(Classes %in% c("Modified_Field")) %>%
   #arrange(desc(YEAR))%>%
   dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))

(P4<-ggplot(data = Data, aes(x = NDVI_B, y = LST_C)) +
    xlab("NDVI")+
    ylab("LST")+
    stat_poly_line() +
    #stat_poly_eq(use_label(c("eq", "adj.R2", "f", "p", "n"))) +
    stat_poly_eq(use_label(c("eq", "R2"))) +
    geom_point(aes(color = YEAR)))

###########################################################################

### '''''Boxplot''''' '''''''''''''''''''''''''''''''''''''''''''' 
(Box_1<-ggplot(data, aes(NDVI_B,LST_C))+
        geom_boxplot(aes(fill= Classes)))#+ # automatic color filling
       #theme(legend.position = "none")) # remove legend

(Box_2<-ggplot(data, aes(Classes,LST_C))+
        geom_boxplot(aes(fill= season)))#+ # automatic color filling
       #theme(legend.position = "none")) # remove legend

(Box_3<-ggplot(data, aes(Classes,EVI))+
        geom_boxplot(aes(fill= season)))#+ # automatic color filling
       #theme(legend.position = "none")) # remove legend

(Box_4<-ggplot(data, aes(Classes,THERMA_IR))+
        geom_boxplot(aes(fill= season)))#+ # automatic color filling
       #theme(legend.position = "none")) # remove legend

(Box_5<-ggplot(data, aes(Classes,FVC))+
        geom_boxplot(aes(fill= season)))#+ # automatic color filling
     #theme(legend.position = "none")) # remove legend

(Box_6<-ggplot(data, aes(Classes,EMM))+
        geom_boxplot(aes(fill= season)))#+ # automatic color filling
      #theme(legend.position = "none")) # remove legend

jpeg("D:/HP_Spectre_2023/Ms_Research/Images/Images_Raad/BP_graph1.jpg",res=600,width=8300,height=4000)
BP_graph1 <- grid.arrange(Box_1,Box_2, Box_3, Box_4,Box_5,Box_6, ncol=3)
dev.off()

jpeg("D:/HP_Spectre_2023/Ms_Research/Images/Images_Raad/BP_graph2.jpg",res=600,width=8300,height=4000)
BP_graph2 <- grid.arrange(Box_1,Box_2, Box_3, nrow =3)
dev.off()

# theme: https://ggplot2.tidyverse.org/reference/ggtheme.html

(Box_3b<-ggplot(data, aes(NDVI_B,LST_C))+
    geom_boxplot(aes(fill=Classes))+
    theme(axis.text.x=element_text(face="bold", colour="black",size=10), # definition of labels on the x axis
          axis.title.x=element_text(face="bold", colour="blue",size=10), # definition of title on the x axis
          axis.text.y=element_text(face="bold", colour="black",size=10), # definition of labels on the y axis
          axis.title.y=element_text(face="bold", colour="blue",size=10))+ # definition of title on the y axis
    xlab("date")+
    ylab("NDVI_B"))


# other plots########################
####TCAP
#http://www.sthda.com/english/wiki/r-plot-pch-symbols-the-different-point-shapes-available-in-r

# change plot space to 4 (mfrow parameter)--------------------------
par(mfrow = c(2,3), no.readonly = F)
par(mfrow = c(3,2), no.readonly = F)
par(mar=c(2,2,2,2)) # 
dev.off()

###############
plot(data_t$NDVI_B,data_t$LST_C,  #Only showing overall shape
       pch= 19,
       cex = 2,
       xlim = c(0, 0.8),
       xlab = 'NDVI_B', # label for x-axis 
       ylab = "LST_C", # label for y-axis 
       main = "NDVI_LST", # add title
       #col=c("green", "red"))
       col = "black") # add color "#fc9d12"

plot(data_t$NDVI_B,data_t$LST_C, # showing the internal Interaction 
        pch=10,
        cex = 5,
        xlim = c(0, 0.8),
        xlab = 'NDVI_B (B)', # label for x-axis 
        ylab = "greeness (G)", # label for y-axis 
        main = "Tasseled Cap (Interaction:BvG)", # add title
        col=c("red", "green"))
     #col = "black") # add color "#fc9d12"

plot(data_t$NDVI_B,data_t$EVI,  #Only showing overall shape
        pch= 19,
        cex = 2,
        xlim = c(0, 0.8),
        ylim = c(-0.46, 0.62),
        xlab = 'NDVI_B (B)', # label for x-axis 
        ylab = "EVI (W)", # label for y-axis 
        main = "Tasseled Cap", # add title
       #col=c("green", "red"))
        col = "black") # add color "#fc9d12"

plot(data_t$NDVI_B,data_t$EVI, # showing the internal Interaction 
        pch=10,
        cex = 5,
        xlim = c(0, 0.8),
        ylim = c(-0.46, 0.62),
        xlab = 'NDVI_B (B)', # label for x-axis 
        ylab = "EVI (W)", # label for y-axis 
        main = "Tasseled Cap (Interaction:BvW)", # add title
        col=c("red", "blue"))
#col = "black") # add color "#fc9d12"

plot(data_t$LST_C,data_t$EVI,  #Only showing overall shape
        pch= 19,
        cex = 2,
        xlim = c(-0.2, 0.4),
        xlab = "EVI (W)", # label for x-axis 
        ylab = 'LST_C (G)', # label for y-axis 
        main = "Tasseled Cap", # add title
       #col=c("green", "red"))
        col = "black") # add color "#fc9d12"

plot(data_t$LST_C,data_t$EVI, # showing the internal Interaction 
        pch=10,
        cex = 5,
        xlim = c(-0.2, 0.4),
        xlab = 'NDVI_B (B)', # label for x-axis 
        ylab = "EVI (W)", # label for y-axis 
        main = "Tasseled Cap (Interaction:GvW)", # add title
        col=c("green", "blue"))
#col = "black") # add color "#fc9d12"


(Box_4<-ggplot(data, aes(Classes,LST_C))+
    geom_boxplot(aes(group=date, fill = date))+  # automatic color filling
    theme(axis.text.x=element_text(face="bold", colour="black",size=10), # definition of labels on the x axis
          axis.title.x=element_text(face="bold", colour="blue",size=10), # definition of title on the x axis
          axis.text.y=element_text(face="bold", colour="black",size=10), # definition of labels on the y axis
          axis.title.y=element_text(face="bold", colour="blue",size=10))+ # definition of title on the y axis
    xlab("NDVI_B")+
    ylab("LST_C")+
    theme_bw())

(g1 <- ggline(data, x = "Classes", y = "LST_C", 
       add = c("mean_se", "jitter"),
       ylab = "LST_C", xlab = "Classes", color= "blue")+
theme(axis.text.x=element_text(face="bold", colour="black",size=10), # definition of labels on the x axis
      axis.title.x=element_text(face="bold", colour="blue",size=10), # definition of title on the x axis
      axis.text.y=element_text(face="bold", colour="black",size=10), # definition of labels on the y axis
      axis.title.y=element_text(face="bold", colour="blue",size=10)))


hist(data$NDVI_B, col="blue")
hist(data$LST_C, col="blue")
############### III. Independent two sample testing ######## (((Important)))

# methods appropriate for examining the difference in Means for 2 populations
# Data
#h_SO<-as.vector(data_3$h_m[data_3$Gat=="So"])
#h_BRZ<-as.vector(data_3$h_m[data_3$Gat=="Sw"])
(h_SO<-as.vector(data$NDVI_B[data$season=="Wet"]))
(h_BRZ<-as.vector(data$NDVI_B[data$season=="Dry"]))

(h_SO<-as.vector(data$LST_C[data$season=="Wet"]))
(h_BRZ<-as.vector(data$LST_C[data$season=="Dry"]))

(h_SO<-as.vector(data$EVI[data$season=="Wet"]))
(h_BRZ<-as.vector(data$EVI[data$season=="Dry"]))

(h_SO<-as.vector(data$THERMA_IR[data$season=="Wet"]))
(h_BRZ<-as.vector(data$THERMA_IR[data$season=="Dry"]))

(h_SO<-as.vector(data$FVC[data$season=="Wet"]))
(h_BRZ<-as.vector(data$FVC[data$season=="Dry"]))

(h_SO<-as.vector(data$EMM[data$season=="Wet"]))
(h_BRZ<-as.vector(data$EMM[data$season=="Dry"]))
hist(h_SO)
hist(h_BRZ)
## for mean 
## Student's t-Test 
# paired = FALSE - independent data
# var.equal = FALSE - assumption about not equal variances in samples
# H0: mean1 = mean2
# H1: mean1 <> mean2
t.test(h_SO,h_BRZ, paired=FALSE,var.equal=FALSE)

# variances:
boxplot(h_SO,h_BRZ)

var(h_SO); var(h_BRZ)

## for variances
# F test based on F-Snedecor distribution 
# H0: variance1 equal variance2
# H1: variance1 not equal variance2
var.test(h_SO,h_BRZ)

plot(h_SO,data_t$h_BRZ, col = "blue")


# Question (5) ------------------------
#5) Using two-way ANOVA - check if there is a significant difference in stand 
#heights between species (species_cd) and age Classes (0-20, 21-40, 41-60, 
#61-80, 81-100, 101-120, above 120 YEARs, based on species_age variable). 
#Use data only for *SO*, *BRZ* and *DB* (dąb = oak) species. 
#Try to propose an alternative method for such an analysis. 

(H_anov <- data %>% 
   #group_by(species_cd)%>%
   #filter(species_cd %in% c("SO")) %>%
   arrange(desc(-YEAR))%>%
   dplyr::select(Classes,YEAR,NDVI,EVI,FVC,EMM,THERMA_IR,LST_K,LST_C,NDVI_B))



summary(H_anov)
list(H_anov)
View(H_anov)
#H_anov$Decadel_Trend <- cut(H_anov$YEAR, 
                       #breaks = c(-Inf,1990,2000,2010,2020, Inf) ,
                       
                       #labels = c("1990","1991-2000","2001-2010","2011-2020","2020-2021"),
                
                       #labels = c("1990","1990-2000","2000-2010","2010-2020","2020"),
                       #right = FALSE)

H_anov$Decadel_Trend <- cut(H_anov$YEAR, 
                            breaks = c(-Inf,1990,2000,2010,2020, Inf) ,
                            
                            #labels = c("1990","1991-2000","2001-2010","2011-2020","2020-2021"),
                            
                            labels = c("1989","1990-2000","2000-2010","2010-2020","2020+"),
                            
                            
                            right = FALSE)


list(H_anov$Decadel_Trend)

### data processing ###
H_anov$YEAR   <- as.factor(H_anov$YEAR)
H_anov$Decadel_Trend    <- as.factor(H_anov$Decadel_Trend)


attach(H_anov) # allows you to put it on the top of data layer


plot(YEAR~NDVI_B+Decadel_Trend) # two boxplots are plotted 


summary(H_anov)

### the two-way ANOVA ###
two.way <- aov(NDVI_B~LST_C+Decadel_Trend, data = H_anov)
summary(two.way)

ANOVA_2<-aov(NDVI_B~LST_C+Decadel_Trend)# include both dependent factors, its the difference between one way and two way in R, the rest is same
summary(ANOVA_2) # dose influence is significant, but for site conditions is not significant 

### interaction ### the dose may work differently in different site conditions, level of dose...
summary(aov(NDVI_B~LST_C+Decadel_Trend+LST_C*Decadel_Trend))#dose*site... this allows to check the interaction
# this interaction is significant 5.41e-05 ***

interact <- aov(NDVI_B~LST_C*Decadel_Trend)
summary(interact)

summary(aov(NDVI_B~LST_C*Decadel_Trend)) # same as above but better alternative to avoid Stretching R #

#-------------------------------------------------------------------------
library(AICcmodavg)

model.set <- list(ANOVA_2, interact)
model.names <- c("ANOVA_2", "interact")

aictab(model.set, modnames = model.names)
#-------------------------------------------------------------------------

# change plot space to 4 (mfrow parameter)--------------------------
#par(mfrow = c(3,2), no.readonly = F)
par(mfrow = c(3,2), no.readonly = F)
par(mfrow = c(2,2), no.readonly = F)
#par(mfrow = c(2,1), no.readonly = F)
#par(mar=c(2,2,2,2)) # 
dev.off()

interaction.plot(Classes,Decadel_Trend,NDVI_B, # showing the internal Interaction 
                    pch=10,
                    cex = 5,
                    #xlim = c(0, 0.8),
                    xlab = '.', # label for x-axis 
                    ylab = "NDVI_B", # label for y-axis 
                    main = "Decadal Changes", #- NDVI_B",
                    lwd=2.5,
                    las=2,
                    #col = "red")# add title
                    col=c("blue", "green","red", "black","purple"))



#interaction.plot(Classes,Decadel_Trend,LST_C,col = 2:30, type = "b")
interaction.plot(Classes,Decadel_Trend,LST_C, # showing the internal Interaction 
                 pch=10,
                 cex = 5,
                 #xlim = c(0, 0.8),
                 xlab = '.', # label for x-axis 
                 ylab = "LST_C", # label for y-axis 
                 #main = "Decadal Changes - LST_C",
                 lwd=2.5,
                 las=2,
                 #  col = "red")# add title
                 col=c("blue", "green","red", "black","purple"))

interaction.plot(Classes,Decadel_Trend,EVI, # showing the internal Interaction 
                 pch=10,
                 cex = 5,
                 #xlim = c(0, 0.8),
                 xlab = '.', # label for x-axis 
                 ylab = "EVI", # label for y-axis 
                # main = "Decadal Changes - EVI",
                 lwd=2.5,
                 las=2,
                 #  col = "red")# add title
                 col=c("blue", "green","red", "black","purple"))

interaction.plot(Classes,Decadel_Trend,THERMA_IR, # showing the internal Interaction 
                 pch=10,
                 cex = 5,
                 xlab = '.', # label for x-axis 
                 ylab = "THERMA_IR", # label for y-axis 
                 #main = "Decadal Changes - THERMA_IR",
                 lwd=2.5,
                 las=2,
                 #  col = "red")# add title
                 col=c("blue", "green","red", "black","purple"))

interaction.plot(Classes,Decadel_Trend,FVC, # showing the internal Interaction 
                 pch=10,
                 cex = 5,
                 xlab = '.', # label for x-axis 
                 ylab = "THERMA_IR", # label for y-axis 
                 #main = "Decadal Changes - THERMA_IR",
                 lwd=2.5,
                 las=2,
                 #  col = "red")# add title
                 col=c("blue", "green","red", "black","purple"))

interaction.plot(Classes,Decadel_Trend,EMM, # showing the internal Interaction 
                 pch=10,
                 cex = 5,
                 xlab = '.', # label for x-axis 
                 ylab = "THERMA_IR", # label for y-axis 
                 #main = "Decadal Changes - THERMA_IR",
                 lwd=2.5,
                 las=2,
                 #  col = "red")# add title
                 col=c("blue", "green","red", "black","purple"))
#dev.off()


# 1. Open jpeg file
#D:/HP_Spectre_2023/Ms_Research/Images/Images_Raad/BP_graph2.jpg",res=600,width=8300,height=40009
#jpeg("D:/HP_Spectre_2023/Ms_Research/Images/Images_Raad/rplot.jpg", width = 350, height = "350")
# 2. Create the plot
#plot(x = my_data$wt, y = my_data$mpg,
#     pch = 16, frame = FALSE,
#     xlab = "wt", ylab = "mpg", col = "#2E9FDF")
# 3. Close the file
#dev.off()


### Post_choc test ###
TukeyHSD(ANOVA_2)
TukeyHSD(interact)
# Compare these results with the box plots
# LSW-BMsw influence is not significantly different without any external factors..0.4905148


###
############################### from stat 1 #######################
#How do we find out which group is different. tests e.g tukeyHSD, pairwise etc...
THSD <- TukeyHSD(ANOVA_2) # more powerful and robust than the pairwise
THSD
THSD$LST_C


# Apply Shapiro-Wilk test for normality on the residuals of the ANOVA model
residuals <- ANOVA_2$residuals
#shapiro.test(residuals) # Residuals are normally distributed. p-value = 0.5092, data is normally distributed
ks.test(residuals, "pnorm") # D = 0.27092, p-value < 2.2e-16,large D value and small p-value shows that the height is not normally distributed 


qqnorm( residuals)
qqline(residuals, col=c("red"))

# Apply LSD test for multiple comparisons by "Least significant difference"
#install.packages("agricolae")
library(agricolae)
#Age group
LSD <- LSD.test(ANOVA_2, "AgeGroup", p.adj = "none")
LSD
LSD$statistics
LSD$parameters
LSD$means
LSD$groups

#write.csv(LSD$statistics, 
   #       file="D:/HNEE STUDIES/SGGW_STUDIES/Statistics_II/Assignment_1/Exam/images/Q5_LSDstat.csv")

plot(LSD, xlab = "AgeGroup",ylab = "NDVI_B",ylim = c(0,0.6))

#species_cd
summary(H_anov)
LSD <- LSD.test(ANOVA_2, "NDVI_B", p.adj = "none")
LSD
LSD$statistics
LSD$parameters
LSD$means
LSD$groups
plot(LSD, xlab = "YEAR",ylab = "NDVI_B",ylim = c(0,0.6))
#Transfer data to CSV file ------------------------
#write.csv(summary(H_anov), 
         # file="D:/HNEE STUDIES/SGGW_STUDIES/Statistics_II/Assignment_1/Exam/images/Q5summary_data.csv")

#write.csv(LSD$statistics, 
        #  file="D:/HNEE STUDIES/SGGW_STUDIES/Statistics_II/Assignment_1/Exam/images/Q5_LSDstat_cd.csv")

# write.csv(LSD$means, 
         # file="D:/HNEE STUDIES/SGGW_STUDIES/Statistics_II/Assignment_1/Exam/images/Q5_LSDmeans_cd.csv")

#write.csv(LSD$groups, 
         # file="D:/HNEE STUDIES/SGGW_STUDIES/Statistics_II/Assignment_1/Exam/images/Q5_LSDgroups_cd.csv")

#################### AOB##############
#Using fill to control the fill colours
library(ggplot2)
library(ggsci)
library(ggpubr)
#(H_anov$AgeGroup<-as.vector(H_anov$AgeGroup))
#ggplot(H_anov, aes(x = reorder(AgeGroup, sort(as.numeric(AgeGroup))), y = height)) +
  #geom_bar(stat = "identity")
#http://www.sthda.com/english/wiki/ggplot2-axis-ticks-a-guide-to-customize-tick-marks-and-labels

(GG <- ggplot(H_anov,aes(x = Decadel_Trend, y = NDVI_B,fill = Decadel_Trend,las=2))+
    theme_bw()+
    geom_bar(stat = "identity", position = "dodge"))

(GG1 <- ggplot(H_anov,aes(x = Classes, y = NDVI_B,fill =Decadel_Trend))+
    theme_bw()+
    geom_bar(stat = "identity", position = "dodge")+
    xlab("Classes")+
    ylab("NDVI"))

GG1 + theme(axis.text.x = element_text(face="bold", color="#993333", 
                                       size= 10, angle=45))

(GG2 <- ggplot(H_anov,aes(x = Classes, y = LST_C,fill =Decadel_Trend))+
    theme_bw()+
    geom_bar(stat = "identity", position = "dodge")+
    xlab("Classes")+
    ylab("LST"))

GG2 + theme(axis.text.x = element_text(face="bold", color="#993333", 
                                           size= 10, angle=45))


(GG3 <- ggplot(H_anov,aes(x = Classes, width = 0.6, y = NDVI_B, fill = Decadel_Trend))+
    theme_bw()+
  geom_bar(stat = "identity", position = "dodge"))

####box plot###
(Box_GG <-ggplot(H_anov, aes(Classes,NDVI_B))+
    geom_boxplot(aes(fill=Decadel_Trend))+
    theme(axis.text.x=element_text(face="bold", colour="black",size=10), # definition of labels on the x axis
          axis.title.x=element_text(face="bold", colour="blue",size=10), # definition of title on the x axis
          axis.text.y=element_text(face="bold", colour="black",size=10), # definition of labels on the y axis
          axis.title.y=element_text(face="bold", colour="blue",size=10))+# definition of title on the y axis
          theme_bw()+
    xlab("Classes")+
    ylab("NDVI_B"))

(Box_GG2 <-ggplot(H_anov, aes(YEAR,NDVI_B))+
    geom_boxplot(aes(fill=YEAR))+
    theme(axis.text.x=element_text(face="bold", colour="black",size=10), # definition of labels on the x axis
          axis.title.x=element_text(face="bold", colour="blue",size=10), # definition of title on the x axis
          axis.text.y=element_text(face="bold", colour="black",size=10), # definition of labels on the y axis
          axis.title.y=element_text(face="bold", colour="blue",size=10))+# definition of title on the y axis
    theme_bw()+
    xlab("date")+
    ylab("NDVI_B"))

Box_GG2 + theme(axis.text.x = element_text(face="bold", color="#993333", 
                                     size= 10, angle=45))

######## Exporting the images#######
jpeg("Q5_plots.jpg",res=1000,width=10000,height=5000)
All_models <- grid.arrange(GG3,Box_GG2,GG2,Box_GG, ncol=2)
dev.off()
