-- CREATE DATABASE IF NOT EXISTS billsplitter;
-- USE billsplitter;

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
	digest CHARACTER(88),
    salt CHARACTER(8),
	token CHARACTER(40),
    PRIMARY KEY(id, email, username)
);

CREATE TABLE temp_users (
	id INTEGER AUTO_INCREMENT,
	name VARCHAR(20) NOT NULL,
    PRIMARY KEY(id, name)
);

CREATE TABLE bills (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	tax FLOAT NOT NULL, -- percentage
	time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	locationX FLOAT, -- longitude
    locationY FLOAT, -- latitude
    name VARCHAR(30) -- optional name for the bill
	-- users are in bills_users
	-- items are in items
);

CREATE TABLE bills_users (
	bill_id INTEGER NOT NULL,
	user_id INTEGER, -- either this one
	temp_user_id INTEGER, -- or this one for non registered users
	FOREIGN KEY(bill_id) REFERENCES bills(id),
	FOREIGN KEY(user_id) REFERENCES users(id),	
	FOREIGN KEY(temp_user_id) REFERENCES temp_users(id)
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
    paid BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY(item_id) REFERENCES items(id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(temp_user_id) REFERENCES temp_users(id)
);