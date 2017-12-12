# Backend server

- Based on NodeJS and MySQL
- RESTful interface

## Installation

### NodeJS server

1. Install **NodeJS** from [nodejs.org](https://nodejs.org/en/download/)
1. From this directory (*backend*), install the required dependencies with
    ```bash
    npm install
    ```
1. Run the server with
    ```bash
    node server.js
    ```
1. With your browser, try [**localhost:8000**](http://localhost:8000/) and you should see *Your result*

### MySQL Database

1. Install **MySQL Community Server** from [dev.mysql.com](https://dev.mysql.com/downloads/mysql/)
1. From this directory (*backend*), launch MySQL with (maybe change `root`):
    ```bash
    mysql -u root -p
    ```
    And enter your MySQL password (or nothing)
1. Run the SQL script [billsplitter.sql](billsplitter.sql) to create the database **billsplitter** and its tables, with:
    ```sql
    source billsplitter.sql
    ```
1. Check the database and tables were created:
    ```sql
    SHOW DATABASES;
    USE billsplitter;
    SHOW TABLES;
    ```
1. Run the SQL script [dummy.sql](dummy.sql) to insert dummy data in the  **billsplitter** database, with:
    ```sql
    source dummy.sql
    ```
1. Check the dummy data was added for the *bills* table in example, with:
    ```sql
    USE billsplitter;
    SELECT * FROM bills;
    ```

### Testing

1. Go to the [**tests**](tests) directory with `cd tests`
1. From this directory (*backend/tests*), launch MySQL with (maybe change `root`):
    ```bash
    mysql -u root -p
    ```
    And enter your MySQL password (or nothing)
1. Run the SQL script [test.sql](tests/test.sql) to create the database **billsplittertest**, its tables and dummy data, with:
    ```sql
    source test.sql
    ```
1. Go back to the **backend** directory with `cd ..`
1. Make sure you have [**NodeJS**](https://nodejs.org/en/download/) installed
1. From this directory (*backend*), install the required dependencies **and mocha globally** with
    ```bash
    npm install
    npm install -g mocha
    ```
1. In one terminal, launch the server in test mode with
    ```bash
    node server.js test
    ```
    The server will run on port **8001** with the database **billsplittertest**
1. In **another** terminal, run the tests with:
    ```bash
    mocha tests
    ```

### Further changes
