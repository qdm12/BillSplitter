# Backend server

- Based on NodeJS and MySQL
- RESTful interface

## Installation
- You need to setup the NodeJS server **and** the MySQL database.

### NodeJS server

1. Install **NodeJS** from [nodejs.org](https://nodejs.org/en/download/)
1. In a terminal and from this directory (*backend*), install the required dependencies with
    ```bash
    npm install
    ```
1. Run the server with
    ```bash
    node server.js
    ```
1. With your browser, try [**localhost:8000**](http://localhost:8000/) and you should see *Your result*
1. You can close the server by entering **CTRL**+**C**

### MySQL Database

1. Install **MySQL Community Server** from [dev.mysql.com](https://dev.mysql.com/downloads/mysql/)
1. Set the MySQL `root` password to `password` with
    ```bash
    mysql -u root -p password
    ```
1. From this directory (*backend*), launch MySQL with:
    ```bash
    mysql -u root -p
    ```
    And enter your MySQL password `password`
1. Run the SQL script [billsplitter.sql](billsplitter.sql) to create the database **billsplitter** and its tables with:
    ```sql
    SOURCE billsplitter.sql
    ```
1. Run the SQL script [dummy.sql](dummy.sql) to insert dummy data in the  **billsplitter** database, with:
    ```sql
    SOURCE dummy.sql
    ```
1. Quit MySQL with:
    ```sql
    QUIT;
    ```

## Testing

1. Make sure you have [**NodeJS**](https://nodejs.org/en/download/) installed and [**MySQL Community Server**]((https://dev.mysql.com/downloads/mysql/) installed
1. Make sure the MySQL `root` password is `password`. If not set, set it with a terminal with:
    ```bash
    mysql -u root -p password
    ```
1. From the *backend* directory, install the required dependencies **and mocha globally** with
    ```bash
    npm install
    npm install -g mocha
    ```
1. In your terminal, launch the server in test mode with
    ```bash
    node server.js test
    ```
    The server will run on port **8001** with the database **billsplittertest**.
    You can stop it *later* by entering **CTRL**+**C**
1. Open a **new** terminal and go to the [**tests**](tests) directory
1. Run the tests against the server with:
    ```bash
    mocha tests
    ```

### Further work
