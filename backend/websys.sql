USE websysF17GB1;

DROP TABLE IF EXISTS items_consumers;
DROP TABLE IF EXISTS bills_users;
DROP TABLE IF EXISTS temp_users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS bills;



CREATE TABLE users (
    id INTEGER AUTO_INCREMENT UNIQUE,
    email VARCHAR(70) UNIQUE,
    username VARCHAR(40) UNIQUE,
    digest CHARACTER(44), -- base 64 encoded
    salt CHARACTER(8),
    PRIMARY KEY(id, email, username)
);

CREATE TABLE temp_users (
    id INTEGER AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    bill_id INTEGER NOT NULL,
    PRIMARY KEY(id, bill_id)
);

CREATE TABLE bills (
    id INTEGER AUTO_INCREMENT,
    link CHARACTER(40) NOT NULL UNIQUE,
    address VARCHAR(100) NOT NULL,
    restaurant VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL, -- Name for the bill, defaults to restaurant
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tax FLOAT NOT NULL DEFAULT 0, -- from 0 to 100 (%)
	tip FLOAT NOT NULL DEFAULT 0, -- from 0 to 100 (%)
    done BOOLEAN DEFAULT 0,
    PRIMARY KEY(id, link)
    -- users are in bills_users
    -- items are in items
);

CREATE TABLE bills_users (
    bill_id INTEGER NOT NULL,
    user_id INTEGER DEFAULT NULL, -- either this one
    temp_user_id INTEGER DEFAULT NULL, -- or this one for non registered users
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


-- DUMMY DATA
-- USERS
INSERT INTO users (email, username, digest, salt)
VALUES ("alice@a.com", "Alice", "2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=", "=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("bob@b.com", "Bob", "2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=", "=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("carol@c.com", "Carol", "2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=", "=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("rose@r.com", "Rose", "2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=", "=gaxTRjS");
INSERT INTO users (email, username, digest, salt)
VALUES ("jack@j.com", "Jack", "2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=", "=gaxTRjS");


-- TEMP USERS
INSERT INTO temp_users (name, bill_id) VALUES ("John", 1);
INSERT INTO temp_users (name, bill_id) VALUES ("Gleb", 2);
INSERT INTO temp_users (name, bill_id) VALUES ("Mini", 3);
INSERT INTO temp_users (name, bill_id) VALUES ("John", 3);
INSERT INTO temp_users (name, bill_id) VALUES ("John", 4);
INSERT INTO temp_users (name, bill_id) VALUES ("Cherry", 4);

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


-- THIRD BILL
BEGIN;
INSERT INTO bills (time, address, restaurant, name, tax, tip, link) 
VALUES ("2017-12-01 00:00:01", "1 Penn Plaza", "Charlie's Grill Sub", "Charlie's House", 22.64, 1.85, "VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL");
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Reg Steak", 6.75);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Reg Steak", 6.75);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "SM Veggie", 4.50);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Cheese Bacon Fries", 2.79);
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 2); -- Bob
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 4); -- Rose
INSERT INTO bills_users (bill_id, temp_user_id) VALUES ((SELECT MAX(id) FROM bills), 1); -- John
INSERT INTO bills_users (bill_id, temp_user_id) VALUES ((SELECT MAX(id) FROM bills), 3); -- Mini
INSERT INTO items_consumers (item_id, user_id) VALUES (10, 2); -- Bob eats Reg steak
INSERT INTO items_consumers (item_id, user_id) VALUES (11, 4); -- Rose eats Reg steak
INSERT INTO items_consumers (item_id, temp_user_id) VALUES (12, 1); -- John eats SM Veggie
INSERT INTO items_consumers (item_id, temp_user_id) VALUES (13, 3); -- Mini eats cheese fries
COMMIT;


-- FOURTH BILL
BEGIN;
INSERT INTO bills (time, address, restaurant, name, tax, tip, link) 
VALUES ("2017-12-01 00:00:01", "180 10th Street", "Prime Food Market", "Prime Market", 36.83, 2.37, "WVxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL");
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Malai Koft", 7.49);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Chicken Tikka", 8.99);
INSERT INTO items (bill_id, name, amount) VALUES ((SELECT MAX(id) FROM bills), "Chicken Palak", 17.98);
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 1); -- Alice
INSERT INTO bills_users (bill_id, user_id) VALUES ((SELECT MAX(id) FROM bills), 2); -- Bob
INSERT INTO bills_users (bill_id, temp_user_id) VALUES ((SELECT MAX(id) FROM bills), 4); -- Cherry
INSERT INTO bills_users (bill_id, temp_user_id) VALUES ((SELECT MAX(id) FROM bills), 1); -- John
INSERT INTO items_consumers (item_id, user_id) VALUES (14, 2); -- Bob eats Malai Koft
INSERT INTO items_consumers (item_id, user_id) VALUES (16, 1); -- Alice eats half Chicken palak
INSERT INTO items_consumers (item_id, temp_user_id) VALUES (16, 4); -- Cherry eats half Chicken Palak
INSERT INTO items_consumers (item_id, temp_user_id) VALUES (15, 1); -- John eats Chicken tikka
COMMIT;

