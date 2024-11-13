from flask import Flask, render_template
from flask import Flask, jsonify
import functools
import mysql.connector
from dotenv import load_dotenv
import os
import traceback
import requests
from sqlalchemy import create_engine, text
from sqlalchemy import URL
import pickle
from joblib import load
import joblib
from sklearn.metrics import mean_squared_error
import pandas as pd


# Load the saved model from disk
with open('static/bike_prediction_model.pkl', 'rb') as file:
    model = pickle.load(file)


load_dotenv()

app = Flask(__name__)

url_object = URL.create(
    "mysql",
    username=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],  # plain (unescaped) text
    host=os.environ["HOST"],
    database=os.environ["DATABASE"],
    port=3306 
)
#for work at uni change port to 3333 and host to 127.0.0.1
# at home os.environ["HOST"] and 3306

engine = create_engine(url_object)

@app.route('/')
def home():
    return render_template('index.html')

#setting the stations json

@app.route("/stations")
@functools.lru_cache(maxsize=128)
def get_stations():
    sql = "select * from stations ORDER BY idStation DESC;"
    try:
        with engine.connect() as conn:
            rows = conn.execute(text(sql)).fetchall()
            print('#found {} stations', len(rows), rows)
            return jsonify([row._asdict() for row in rows])
    except:
        print(traceback.format_exc())
        return "error in get_stations", 404
    
#setting the  availability json
@app.route("/availability")
@functools.lru_cache(maxsize=128)
def get_availability():
    sql = "select * from availability ORDER BY idAvailability DESC LIMIT 114;"
    try:
        with engine.connect() as conn:
            rows = conn.execute(text(sql)).fetchall()
            #print('#found {} stations', len(rows), rows)
            return jsonify([row._asdict() for row in rows])
    except:
        print(traceback.format_exc())
        return "error in get_stations", 404

@app.route("/weather")
def get_weather():
    response = requests.get(
        "http://api.weatherapi.com/v1/current.json?key=353dd151830b426ca47115011232202&q=Dublin&aqi=no"
    )
    weather_data = response.json()

    weather_info = {
        "tempInC": weather_data["current"]["temp_c"],
        "condition": weather_data["current"]["condition"]["text"],
        "precipInMm": weather_data["current"]["precip_mm"],
        "windInKph": weather_data["current"]["wind_kph"],
        "timeInDublin": weather_data["current"]["last_updated"]
    }

    return jsonify(weather_info)

mse_dict= {'SMITHFIELD-NORTH': 72.13007169496542, 'PARNELL-SQUARE-NORTH': 16.78600592148909, 'CLONMEL-STREET': 55.37359624166769, 'AVONDALE-ROAD': 41.58851175053687, 'JAMES-STREET-EAST': 59.35242031816879, 'MOUNT-STREET-LOWER': 91.77546221502949, 'CHRISTCHURCH-PLACE': 37.03321603791538, 'GRANTHAM-STREET': 59.438376916015386, 'PEARSE-STREET': 55.55321085550497, 'YORK-STREET-EAST': 54.474550789544544, 'EXCISE-WALK': 78.0042723997596, 'FITZWILLIAM-SQUARE-WEST': 41.43574019674961, 'PORTOBELLO-ROAD': 97.87324587416624, 'PARNELL-STREET': 34.09197102423597, 'FREDERICK-STREET-SOUTH': 118.29990673480665, 'FOWNES-STREET-UPPER': 74.3028868264415, 'CLARENDON-ROW': 74.60167415051653, 'CUSTOM-HOUSE': 73.78142138413025, 'RATHDOWN-ROAD': 51.10578929652636, "NORTH-CIRCULAR-ROAD-(O'CONNELL'S)": 86.51639382549396, 'HANOVER-QUAY': 120.24578659396555, 'OLIVER-BOND-STREET': 42.867117037484974, 'COLLINS-BARRACKS-MUSEUM': 56.8794639293579, 'BROOKFIELD-ROAD': 47.830366790803815, 'BENSON-STREET': 152.81224349294237, 'EARLSFORT-TERRACE': 54.58701671467783, 'GOLDEN-LANE': 24.316019759249254, 'DEVERELL-PLACE': 73.29977686029827, 'WILTON-TERRACE-(PARK)': 165.8449438693295, 'JOHN-STREET-WEST': 42.54413784262045, 'FENIAN-STREET': 45.097219923897924, 'MERRION-SQUARE-SOUTH': 38.94667950301127, 'SOUTH-DOCK-ROAD': 64.71293115122381, 'CITY-QUAY': 40.55966640764332, 'EXCHEQUER-STREET': 58.27984782905835, 'THE-POINT': 100.02257742396962, 'BROADSTONE': 3.721860992434624, 'HATCH-STREET': 31.50164585008366, 'LIME-STREET': 47.84771481933275, 'CHARLEMONT-PLACE': 203.75619910808885, 'KILMAINHAM-GAOL': 115.32675623243539, 'HARDWICKE-PLACE': 16.161103353698106, 'WOLFE-TONE-STREET': 74.27975213086147, 'GREEK-STREET': 46.676909513758936, 'GUILD-STREET': 34.70838258550047, 'HERBERT-PLACE': 117.73347226435108, 'HIGH-STREET': 95.36641016022826, 'NORTH-CIRCULAR-ROAD': 47.62870112016375, 'WESTERN-WAY': 88.49680468989973, 'TALBOT-STREET': 37.62345583901365, 'NEWMAN-HOUSE': 105.14575508709093, "SIR-PATRICK-DUN'S": 53.160568079231496, 'NEW-CENTRAL-BANK': 134.17717423338698, 'GRANGEGORMAN-LOWER-(CENTRAL)': 92.03471449114805, 'KING-STREET-NORTH': 41.09396913768065, 'KILLARNEY-STREET': 63.39609633613246, 'HERBERT-STREET': 88.0814823954568, 'HANOVER-QUAY-EAST': 92.06370116899795, 'CUSTOM-HOUSE-QUAY': 102.01044770177529, 'MOLESWORTH-STREET': 61.04276212173724, 'GEORGES-QUAY': 39.702922779864345, 'KILMAINHAM-LANE': 33.90156556092235, 'MOUNT-BROWN': 28.41428467355525, 'MARKET-STREET-SOUTH': 6.811061455380306, 'KEVIN-STREET': 51.070625167286586, 'ECCLES-STREET-EAST': 56.11932015475785, 'GRAND-CANAL-DOCK': 27.30928221372302, 'MERRION-SQUARE-EAST': 127.52856010268943, 'YORK-STREET-WEST': 53.86205928587716, "ST.-STEPHEN'S-GREEN-SOUTH": 74.16653484439657, 'DENMARK-STREET-GREAT': 30.65899939869134, 'ROYAL-HOSPITAL': 23.462181999640805, 'HEUSTON-STATION-(CAR-PARK)': 103.77150303871385, 'GRANGEGORMAN-LOWER-(NORTH)': 69.88243971971917, "ST.-STEPHEN'S-GREEN-EAST": 46.891972310222485, 'HEUSTON-STATION-(CENTRAL)': 62.34131658856749, 'TOWNSEND-STREET': 184.06782551740974, 'GEORGES-LANE': 32.67079699526671, 'PHIBSBOROUGH-ROAD': 151.03067851357864, 'ECCLES-STREET': 44.68095224657177, 'PORTOBELLO-HARBOUR': 21.83578422524822, 'MATER-HOSPITAL': 108.2316393276412, 'BLESSINGTON-STREET': 61.92778479722111, 'JAMES-STREET': 17.99564478740786, 'ORIEL-STREET-TEST-TERMINAL': 84.27778510598966, 'MOUNTJOY-SQUARE-EAST': 28.68436424826097, 'MERRION-SQUARE-WEST': 30.419984209920255, 'CONVENTION-CENTRE': 157.2491546541937, 'HARDWICKE-STREET': 44.14374656461329, 'PARKGATE-STREET': 183.38897306386957, 'SMITHFIELD': 68.9242625807024, 'DAME-STREET': 31.611848999728103, 'HEUSTON-BRIDGE-(SOUTH)': 87.76532993930141, 'CATHAL-BRUGHA-STREET': 42.199981369371265, 'SANDWITH-STREET': 64.25858625260892, 'BUCKINGHAM-STREET-LOWER': 44.17782447280357, 'ROTHE-ABBEY': 71.59134754438782, 'CHARLEVILLE-ROAD': 67.65442616444065, "PRINCES-STREET-or-O'CONNELL-STREET": 42.7636405001873, 'UPPER-SHERRARD-STREET': 63.3320038723403, 'FITZWILLIAM-SQUARE-EAST': 20.77323378925403, 'GRATTAN-STREET': 24.758385322943216, 'ST-JAMES-HOSPITAL-(LUAS)': 53.2202246028892, 'HARCOURT-TERRACE': 38.760572555597214, 'BOLTON-STREET': 28.063275311439902, 'JERVIS-STREET': 37.2981482475917, 'ORMOND-QUAY-UPPER': 75.19207774551676, 'GRANGEGORMAN-LOWER-(SOUTH)': 33.08163010734147, 'MOUNTJOY-SQUARE-WEST': 47.593690688062864, 'WILTON-TERRACE': 31.024434171635065, 'EMMET-ROAD': 87.44488873754139, 'HEUSTON-BRIDGE-(NORTH)': 164.9335665071859, 'LEINSTER-STREET-SOUTH': 99.1695243111474, 'BLACKHALL-PLACE': 54.88718823886217}


@app.route("/mse")
def get_mse():
    cleaned_mse_dict = {}
    for station_name, mse_value in mse_dict.items():
        cleaned_station_name = station_name.replace("-", " ")
        cleaned_mse_dict[cleaned_station_name] = mse_value
    return jsonify(cleaned_mse_dict)

@app.route('/predict/<station_name>')
def predict(station_name):
    # Construct the path to the model file for the specified station
    fixed_name = station_name.replace('/', 'or').replace(' ', '-')
    model_filename = os.path.join('static/models', f"{fixed_name}_model.joblib")

    # Load the trained model for the specified station
    model = load(model_filename)
    model.fit_intercept = False


    # Fetch the weather data from the API
    response = requests.get(
        f"http://api.weatherapi.com/v1/current.json?key=353dd151830b426ca47115011232202&q={station_name}&aqi=no"
    )
    weather_data = response.json()

    # Extract the input data from the weather data
    input_data = [[weather_data['current']['precip_mm']]]

    # Make the prediction using the loaded model
    prediction = model.predict(input_data)

    # Create a response object with the prediction result
    response = {
        'station': station_name,
        'prediction': float(prediction)
    }

    # Return the response as JSON
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
