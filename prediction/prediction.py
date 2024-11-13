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

# extract the hour from the lastUpdate column and create a new column
dfu['lastUpdate'] = pd.to_datetime(dfu['lastUpdate'], unit='ms')
dfu['hour'] = dfu['lastUpdate'].dt.hour

# plot the hour column on the x-axis and availableBikes column on the y-axis
#plt.plot(dfu['hour'], dfu['availableBikes'])
#plt.xlabel('Hour')
#plt.ylabel('Available Bikes')
#plt.show()

# iterate over the station names and create a separate plot for each station
for i in station_names:
    # filter the DataFrame to only include data for this station
    station_df = dfu[dfu['nameStation'] == i]
    
    # plot the hour column on the x-axis and availableBikes column on the y-axis
    plt.plot(station_df['hour'], station_df['availableBikes'])
    plt.xlabel('Hour')
    plt.ylabel('Available Bikes')
    plt.title(i)
    plt.show()
