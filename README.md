# CS 348 Project

This repo contains the files created by our group for the 
CS 348 project. Below are the instructions to run the code locally

## Install and Set Up MariaDB
```
https://mariadb.com/
```
Install MariaDB and then follow the instructions to set up

OPTIONAL: Run the following to set up an admin user
```bash
mariadb -u root -p
```

```bash
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

## Clone the repo

```
git clone https://github.com/jeffxu2004/cs348-project.git
```


## Running the application

1. Setting up the database.
    You will need to pass in your mysql database username and password.
    Change  `root` to the username.


    After running both commands you will be prompted to enter your password.
    Run the following commands

    ```bash
    mariadb -u admin -p < db/createtables.sql
    mariadb -u admin -p < db/populatetables.sql
    ```

2. Run the backend of the application

    *Important*: If you did not do the optional admin user step, before running the commands below, you will need to 
    update the username and password to what matches your mysql configuration. 

    (In backend/index.js, update line 16 and 17 to match the username and password respectively.
    Then run the following commands)

   To run the backend, enter the following commands.

    ```bash
    cd backend
    npm install
    npm run dev
    ```

4. Running the frontend
    Make sure to leave the previous command still running.

    Open a new terminal window in the project directory.
    Run the following commands.

    ```bash
    cd app
    npm install
    npm run dev
    ```

## Using production data

Note these steps assume you have python installed. You may (optionally) have an enviroment for this project
1. install the requirements
    ```bash
    pip install -r requirements.txt
    ```
    As an aside before running the python script make sure the database tables and indexes are created
    ```bash
    mariadb -u admin -p < db/createtables.sql
    ```

2. run the script (Caution: it may take a while to run but it prints what is happening at each step)
    ```bash
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```
    ```bash
    python data_processing/preprocess.py
    ```
    ```
    deactivate
    ```
    Update the username and password on line 10 and 11
3. Setup for advance features
    ```bash
    mariadb -u admin -p < db/insert_gini.sql
    mariadb -u admin -p < db/addfancysearch.sql
    ```
4. Create indexes to improve performance
   ```bash
    mariadb -u admin -p < db/index.sql
   ```

## Feautes Implemented


1. User login (Milestone 1)
    can be found in
    ```
    app/src/App.tsx
    backend/index.js
    ```
2. Movie Overview (Milestone 1)
    ```
    app/src/App.tsx
    backend/index.js
    ```
3. Main page with common sorting tabs (Milestone 2)
    ```
    app/src/App.tsx
    backend/index.js
    ```
4. Modify Movies
    ```
    app/src/App.tsx
    backend/index.js
    app/src/EditMovieForm.tsx
    app/src/MovieDetailPage.tsx
    ```
