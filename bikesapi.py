import requests
import json
import mysql.connector
from dotenv import load_dotenv
import os

# load the load_dotenv function to be able to access it
load_dotenv()

response = requests.get(
    "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=[INSERT_KEY]")
# print(response.json())

# Send a request to the API and retrieve the JSON response
bike_json = response.json()
bike_data_dump = json.dumps(bike_json)
# we will use the bike_json directly as it has the response in json

# saving the data to look in the json viewer
file = open('bikejson.json', 'w')
file.writelines(bike_data_dump)
file.close()

# for i in range(114):
#    print(bike_json[i]['name'])
# i=1
#print(i,bike_json[i]['name'],bike_json[i]['address'],bike_json[i]['position']['lat'], bike_json[i]['position']['lng'], bike_json[i]['banking'])

# database
mydb = mysql.connector.connect(
    # we are connecting to our dotenv file with our password etc data with the os.environ[]
    host=os.environ["HOST"],
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
    database=os.environ["DATABASE"]
)

print(mydb)

mycursor = mydb.cursor()
# I have put the static data into a function as we wont need to call it more than once, but to have the code available if something goes wrong


def passStaticData():
    for i in range(114):
        #    print((i+1), bike_json[i]['name'], bike_json[i]['address'], bike_json[i]['position']['lat'], bike_json[i]['position']['lng'], bike_json[i]['banking'])

        sql = "INSERT INTO stations (idStation, nameStation, addressStation, latPositionStation, lngPositionStation, bankingStation) VALUES (%s, %s, %s, %s, %s, %s)"
        val = ((i+1), bike_json[i]['name'], bike_json[i]['address'], bike_json[i]
               ['position']['lat'], bike_json[i]['position']['lng'], bike_json[i]['banking'])
        mycursor.execute(sql, val)

        mydb.commit()

    print(mycursor.rowcount, "record inserted.")


# def passDynamicData():
for i in range(114):
    #    print((i+1), bike_json[i]['name'], bike_json[i]['address'], bike_json[i]['position']['lat'], bike_json[i]['position']['lng'], bike_json[i]['banking'])

    sql = "INSERT INTO availability (lastUpdate, availableBikeStands, availableBikes, status, nameStation) VALUES (%s, %s, %s, %s, %s)"
    val = (bike_json[i]['last_update'], bike_json[i]['available_bike_stands'],
           bike_json[i]['available_bikes'], bike_json[i]['status'], bike_json[i]['name'])
    mycursor.execute(sql, val)

    mydb.commit()

print(mycursor.rowcount, "record inserted.")
