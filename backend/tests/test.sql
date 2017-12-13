-- Remove database
DROP DATABASE IF EXISTS billsplittertest;

-- Create and define database
CREATE DATABASE billsplittertest;
USE billsplittertest;

CREATE TABLE users (
    id INTEGER AUTO_INCREMENT UNIQUE,
    email VARCHAR(70) UNIQUE,
    username VARCHAR(40) UNIQUE,
    digest CHARACTER(88),
    salt CHARACTER(8),
    PRIMARY KEY(id, email, username)
);

CREATE TABLE temp_users (
    id INTEGER AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    PRIMARY KEY(id, name)
);

CREATE TABLE bills (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    address VARCHAR(100) NOT NULL,
    restaurant VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL, -- Name for the bill, defaults to restaurant
    tax FLOAT NOT NULL DEFAULT 0, -- from 0 to 100 (%)
	tip FLOAT NOT NULL DEFAULT 0, -- from 0 to 100 (%)
    link CHARACTER(40) NOT NULL UNIQUE,
    done BOOLEAN DEFAULT 0
    -- users are in bills_users
    -- items are in items
);

CREATE TABLE bills_users (
    bill_id INTEGER NOT NULL,
    user_id INTEGER, -- either this one
    temp_user_id INTEGER, -- or this one for non registered users
    FOREIGN KEY(bill_id) REFERENCES bills(id),
    FOREIGN KEY(user_id) REFERENCES users(id),    
    FOREIGN KEY(temp_user_id) REFERENCES temp_users(id),
    UNIQUE KEY (bill_id, user_id),
    UNIQUE KEY (bill_id, temp_user_id)
);

CREATE TABLE items (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    bill_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    FOREIGN KEY(bill_id) REFERENCES bills(id)
    -- Consumers of that item are in items_consumers
);

CREATE TABLE items_consumers (
    item_id INTEGER NOT NULL,
    user_id INTEGER, -- either this one
    temp_user_id INTEGER, -- or this one for non registered users
    paid BOOLEAN DEFAULT 0,
    FOREIGN KEY(item_id) REFERENCES items(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(temp_user_id) REFERENCES temp_users(id)
);

-- Add dummy data
    -- USERS
INSERT INTO users (email, username, digest, salt)
VALUES ("alice@a.com", "Alice", "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("bob@b.com", "Bob", "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("carol@c.com", "Carol", "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("david@d.com", "David", "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS");

    -- TEMP USERS
INSERT INTO temp_users (name) VALUES ("John");
INSERT INTO temp_users (name) VALUES ("Gleb");

    -- FIRST BILL
BEGIN;
INSERT INTO bills (time, address, restaurant, name, tax, tip, link) 
VALUES ("2017-12-01 00:00:01", "196 W Third Avenue", "Pizza'o'ven", "Birthday pizza", 19.67, 5, "2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL");
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "PizzaA", 10.5);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "PizzaB", 14);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Fries", 6.24);
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 1); -- Alice
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 2); -- Bob
INSERT INTO bills_users (bill_id, temp_user_id) VALUES ((SELECT MAX(id) FROM bills), 1); -- John
INSERT INTO items_consumers (item_id, user_id) VALUES (1, 1); -- Alice eats half pizzaA
INSERT INTO items_consumers (item_id, temp_user_id) VALUES (1, 1); -- John eats half pizzaA
INSERT INTO items_consumers (item_id, user_id) VALUES (2, 2); -- Bob eats pizzaB
INSERT INTO items_consumers (item_id, user_id) VALUES (3, 1); -- Alice eats 1/3 of fries
INSERT INTO items_consumers (item_id, user_id) VALUES (3, 2); -- Bob eats 1/3 of fries
INSERT INTO items_consumers (item_id, temp_user_id) VALUES (3, 1); -- John eats 1/3 of fries
COMMIT;


    -- SECOND BILL
BEGIN;
INSERT INTO bills (time, address, restaurant, name, tax, tip, link) 
VALUES ("2017-12-01 00:00:01", "185 E First Avenue", "McDonald's", "McDonald's", 19.67, 0, "WBdfOcWKtm3ZX4jk8cG0aIDxrhNOJC8207Zsr9Lk");
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Cheeseburger", 3.6);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Cheeseburger", 3.6);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Large fries", 4.4);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Diet coke", 1.5);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Diet coke", 1.5);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Vanilla ice cream", 3.58);
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 1); -- Alice
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 2); -- Bob
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 3); -- Carol
INSERT INTO bills_users (bill_id, temp_user_id) VALUES ((SELECT MAX(id) FROM bills), 2); -- Gleb
-- No consumers yet
COMMIT;