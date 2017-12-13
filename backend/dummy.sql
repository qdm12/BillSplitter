USE billsplitter;

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