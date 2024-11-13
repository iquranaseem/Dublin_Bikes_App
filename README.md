# software-engineer-project
# Dublin Bikes Web Application

This is a Flask web application that provides real-time information about Dublin Bikes, including station locations and bike availability. It also includes current weather information for Dublin.

# Prerequisites

    Python 3.7 or higher
    MySQL server
    API keys for the Dublin Bikes API, Weather API
    Installation
    Clone this repository.

  Install the required packages by running the following command:

    pip install -r requirements.txt
   
   
   Create a .env file in the project directory with the following environment variables:

        HOST=your-host-name
        DB_USER=your-username
        DB_PASSWORD=your-password
        DATABASE=your-database-name
        DUBLIN_BIKES_API_KEY=your-api-key
        WEATHER_API_KEY=your-api-key

    Run the bikes_api.py script to fetch the latest bike availability data and populate your MySQL database with it.
    Run the weather_api.py script to fetch the latest weather data and add it to your MySQL database.
    Start the web application by running the following command:

      python app.py
    
    Access the web application by visiting http://localhost:5000 in your web browser.

# Usage


    Enter a search query for a station in the search bar on the homepage to get information about stations that match the query.

    Click on a station to see detailed information about the station, including its location on a map, current weather information, and bike availability.


# Contributors

    Anita Salopek

    Iqura Naseem 

    Anil Vercruysse
