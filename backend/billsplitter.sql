CREATE DATABASE IF NOT EXISTS billsplitter;
USE billsplitter;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS temp_users;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS bills_users;
DROP TABLE IF EXISTS bills_items;
DROP TABLE IF EXISTS items_consumers;

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
    PRIMARY KEY(id, name)
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