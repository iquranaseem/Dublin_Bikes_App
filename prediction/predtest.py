import pandas as pd
import numpy as np
import datetime
import matplotlib.pyplot as plt

dfs = pd.read_csv("/Users/anita/Documents/SpringSemester/SoftwareEngineering/dataprediction/stations.csv", delimiter=';')

#print(dfs.tail())


# assume you have a DataFrame object called "stations_df" with the data already loaded
station_names = dfs['nameStation'].tolist()

# print the list of station names
#print(len(station_names))

dfa = pd.read_csv("/Users/anita/Documents/SpringSemester/SoftwareEngineering/dataprediction/predictionDataSE.csv", delimiter=';')

print(dfa.head())

# Update the nameStation column with the station names cyclically
def nameupdate():
    num_stations = len(station_names)
    num_rows = len(dfa)
    indices = np.arange(num_rows) % num_stations
    dfa["nameStation"] = [station_names[i] for i in indices]

print(dfa.head())

# Save the updated DataFrame to a new CSV file
dfa.to_csv("/Users/anita/Documents/SpringSemester/SoftwareEngineering/dataprediction/updatedpredictionDataSE.csv", index=False, sep=";")
dfu = pd.read_csv("/Users/anita/Documents/SpringSemester/SoftwareEngineering/dataprediction/updatedpredictionDataSE.csv", delimiter=';', parse_dates=['lastUpdate'])

print(dfu.tail())