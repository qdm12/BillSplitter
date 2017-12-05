USE billsplitter;

-- ******************************************
-- USERS
-- ******************************************
INSERT INTO users (email, username, digest, salt, token)
VALUES (alice@a.com, Alice, "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS", "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x");
INSERT INTO users (email, username, digest, salt, token)
VALUES (bob@b.com, Bob, "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS", "cBF=j4eBDUBmheY=XiY28=ecTBT=i2=m=D=xYyGf");
INSERT INTO users (email, username, digest, salt, token)
VALUES (carol@c.com, Carol, "Goq6n3h=l=m==IcF7U=z75=CJatnkhjOcjiwV=XZfqn34L=Dn=SEct2F8xHLGOCaJA7=9L4qLH1IOp=L==UizCPG",
"=gaxTRjS", "gSlMIBvM=HktbwbFFmwSoI=Z=1IMNxG5pyExRsOp");

-- ******************************************
-- TEMP USERS
-- ******************************************
INSERT INTO temp_users (name) VALUES ("John");
INSERT INTO temp_users (name) VALUES ("Gleb");

-- ******************************************
-- FIRST BILL
-- ******************************************
INSERT INTO bills (address, restaurant, name, tax, tip, link) 
VALUES ("196 W Third Avenue", "Pizza'o'ven", "Birthday pizza", 19.67, 5, "2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL");
INSERT INTO bills_users (bill_id, user_id)
VALUES ((SELECT MAX(id) FROM bills), 0); -- Alice
INSERT INTO bills_users (bill_id, user_id)
VALUES ((SELECT MAX(id) FROM bills), 1); -- Bob
INSERT INTO bills_users (bill_id, temp_user_id)
VALUES ((SELECT MAX(id) FROM bills), 0); -- John
INSERT INTO items (bill_id, name, amount)
VALUES ((SELECT MAX(id) FROM bills), "pizza 1", 10.5); -- John
