# Backend server

- Based on NodeJS and MySQL

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
1. Run the SQL script [database.sql](database.sql) to create the database and the tables
    ```sql
    source database.sql
    ```
1. Check the database and tables were created:
    ```sql
    show databases;
    use billsplitter;
    show tables;
    ```

### Further changes

1. In [database.js](database.js), you may want to change the connection parameters:
    ```javascript
    var database = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password"
    });
    ```