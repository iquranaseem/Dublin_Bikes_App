import requests
import json
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

weatherkey = "353dd151830b426ca47115011232202"
response2 = requests.get(
    "http://api.weatherapi.com/v1/current.json?key=[INSERT_KEY]&q=Dublin&aqi=no")
# print(response2)
# print(response2.json())

weatherData = response2.json()
# print(weatherData)
weatherjsondump = json.dumps(weatherData)

print(weatherjsondump)

# we will use weatherdata for indexing

# saving the data to look in the json viewer
file = open('weatherjson.json', 'w')
file.writelines(weatherjsondump)
file.close()

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

# def passDynamicData():

sql = "INSERT INTO weather (precipInMm, tempInC, windInKph, timeInDublin) VALUES (%s, %s, %s, %s)"
val = (weatherData['current']['precip_mm'], weatherData['current']['temp_c'],
       weatherData['current']['wind_kph'], weatherData['current']['last_updated_epoch'])
mycursor.execute(sql, val)

mydb.commit()

print(mycursor.rowcount, "record inserted.")
