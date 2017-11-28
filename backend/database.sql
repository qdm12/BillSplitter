DROP TABLE users;
DROP TABLE temp_users;
DROP TABLE bills;
DROP TABLE bills_users;
DROP TABLE bills_items;
DROP TABLE items_consumers;

CREATE TABLE users (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	email CHARACTER(70) PRIMARY KEY,
	username CHARACTER(40) PRIMARY KEY,
	digest CHARACTER(64),
	token CHARACTER(40),
);

CREATE TABLE temp_users (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	name CHARACTER(20) NOT NULL,
);

CREATE TABLE bills (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	tax FLOAT NOT NULL,
	date TIMESTAMP DEFAULT CURRENTDATE,
	location STRING,
	-- users are in bills_users
	-- items are in bills_items
);

CREATE TABLE bills_users (
	bill_id INTEGER NOT NULL,
	user_id INTEGER, -- either this one
	temp_user_id INTEGER, -- or this one for non registered users
	FOREIGN KEY(bill_id) REFERENCES bills(id),
	FOREIGN KEY(user_id) REFERENCES users(id),	
	FOREIGN KEY(temp_user_id) REFERENCES temp_users(id),	
);

CREATE TABLE bills_items (
	bill_id INTEGER NOT NULL,
	item_id INTEGER AUTO_INCREMENT,
	name CHARACTER(50) NOT NULL,
	amount FLOAT NOT NULL,
	FOREIGN KEY(bill_id) REFERENCES bills(id),
	-- Consumers of that item are in items_consumers
);

CREATE TABLE items_consumers (
	user_id INTEGER, -- either this one
	temp_user_id INTEGER, -- or this one for non registered users
	item_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(temp_users) REFERENCES temp_users(id),
	FOREIGN KEY(item_id) REFERENCES bills_items(item_id),
);