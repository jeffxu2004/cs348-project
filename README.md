# CS 348 Project

This repo contains the files created by our group for the 
CS 348 project. Below are the instructions to run the code locally

# Install and Set Up MariaDB
```
https://mariadb.com/
```
Install MariaDB and then follow the instructions to set up

Run the following to set up an admin user
```
mariadb -u root -p
```
```
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

## Clone the repo

```bash
git clone https://github.com/jeffxu2004/cs348-project.git
```


## Running the application

1. Setting up the database.
    You will need to pass in your mysql database username and password.
    Change  `root` to the username.


    After running both commands you will be prompted to enter your password.
    Run the following commands

    ```bash
    mysql -u root -p < db/createtables.sql
    mysql -u root -p < db/populatetables.sql
    ```

2. Run the backend of the application

    *Important*: Before running the commands below you will need to 
    update the username and password to what matches your mysql configuration. 


    In backend/index.js, update line 16 and 17 to match the username and password respectively.
    Then run the following commands
    ```bash
    cd backend
    npm install
    npm run dev
    ```

3. Running the frontend
    Make sure to leave the previous command still running.

    Open a new terminal window in the project directory.
    Run the following commands.

    ```
    cd frontend
    npm install
    npm run dev
    ```
