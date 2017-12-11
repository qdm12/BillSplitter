USE billsplitter;

-- Authentication
    -- Success (Alice)
SELECT id, token FROM users WHERE id = 1 AND token = "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x" LIMIT 1;
    -- Failure (Bob)
SELECT id, token FROM users WHERE id = 2 AND token = "XM53hT=MU=bV=IXCRrANUW8IW=svDcDEVLSkRD7x" LIMIT 1;

-- Last bill ID, returns lastid = 2
SELECT MAX(id) AS lastid FROM bills;

-- Bill(s) of user, returns bill_id = [1, 2]
SELECT bill_id FROM bills_users WHERE user_id = 1;