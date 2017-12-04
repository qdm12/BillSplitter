-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 03, 2017 at 05:58 AM
-- Server version: 5.7.20-log
-- PHP Version: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `billsplitter`
--

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `bill_id` int(30) NOT NULL,
  `location` varchar(40) NOT NULL,
  `date` date NOT NULL,
  `amount` int(30) NOT NULL,
  `tax` int(30) NOT NULL,
  `user_id` int(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`bill_id`, `location`, `date`, `amount`, `tax`, `user_id`) VALUES
(11, 'jersey', '2017-12-21', 20, 4, 4),
(12, 'newport', '2017-12-01', 50, 8, 4);

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

CREATE TABLE `bill_items` (
  `bill_id` int(30) NOT NULL,
  `item_id` int(30) NOT NULL,
  `item_name` char(30) NOT NULL,
  `item_amount` int(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `bill_items`
--

INSERT INTO `bill_items` (`bill_id`, `item_id`, `item_name`, `item_amount`) VALUES
(11, 3, 'dosa', 8),
(12, 4, 'roll', 5),
(11, 5, 'momos', 10);

-- --------------------------------------------------------

--
-- Table structure for table `bill_users`
--

CREATE TABLE `bill_users` (
  `bill_id` int(30) NOT NULL,
  `user_id` int(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `bill_users`
--

INSERT INTO `bill_users` (`bill_id`, `user_id`) VALUES
(11, 4),
(11, 6),
(12, 7);

-- --------------------------------------------------------

--
-- Table structure for table `settles`
--

CREATE TABLE `settles` (
  `payer_id` int(30) NOT NULL,
  `payee_id` int(30) NOT NULL,
  `item_id` int(30) NOT NULL,
  `amount` int(30) NOT NULL,
  `status` char(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `settles`
--

INSERT INTO `settles` (`payer_id`, `payee_id`, `item_id`, `amount`, `status`) VALUES
(4, 6, 3, 9, 'pending'),
(6, 7, 5, 6, 'settled');

-- --------------------------------------------------------

--
-- Table structure for table `temp_users`
--

CREATE TABLE `temp_users` (
  `user_id` int(30) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `temp_users`
--

INSERT INTO `temp_users` (`user_id`, `name`) VALUES
(503, 'vendy'),
(504, 'ranji'),
(505, 'vartika'),
(509, 'rose'),
(510, 'jack');

--
-- Triggers `temp_users`
--
DELIMITER $$
CREATE TRIGGER `trig1` AFTER INSERT ON `temp_users` FOR EACH ROW BEGIN
    INSERT INTO total_users VALUES (new.user_id);       
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trig2` AFTER DELETE ON `temp_users` FOR EACH ROW BEGIN
    DELETE FROM total_users WHERE total_user_id = old.user_id;       
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `total_users`
--

CREATE TABLE `total_users` (
  `total_user_id` int(30) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `total_users`
--

INSERT INTO `total_users` (`total_user_id`) VALUES
(4),
(6),
(7),
(509),
(510);

-- --------------------------------------------------------

--
-- Table structure for table `users_info`
--

CREATE TABLE `users_info` (
  `user_id` int(30) NOT NULL,
  `email_id` varchar(30) NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL,
  `phone_number` int(100) NOT NULL,
  `user_digest` varchar(64) NOT NULL,
  `user_token` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users_info`
--

INSERT INTO `users_info` (`user_id`, `email_id`, `username`, `password`, `phone_number`, `user_digest`, `user_token`) VALUES
(2, 'dj1242@nyu.edu', 'divisha', 'divisha123', 2019854861, 'divisha', 'divisha'),
(3, 'lee', 'lee@gmail.com', 'lee123', 2014568957, 'lee', 'leelee'),
(4, 'king@nyu.edu', 'king', 'king@123', 1234567890, 'king', 'kingkong'),
(6, 'eli@yahoo.com', 'eli', 'eli@123', 2054689564, 'eli', 'elieli'),
(7, 'harry@gmail.com', 'harry', 'harry@123', 2045621345, 'harry', 'harryrocks');

--
-- Triggers `users_info`
--
DELIMITER $$
CREATE TRIGGER `trig3` AFTER INSERT ON `users_info` FOR EACH ROW BEGIN
    INSERT INTO total_users VALUES (new.user_id);       
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trig4` AFTER DELETE ON `users_info` FOR EACH ROW BEGIN
    DELETE FROM total_users WHERE total_user_id = old.user_id;       
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `bill_id` (`bill_id`);

--
-- Indexes for table `bill_users`
--
ALTER TABLE `bill_users`
  ADD PRIMARY KEY (`bill_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `settles`
--
ALTER TABLE `settles`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `payer_id` (`payer_id`),
  ADD KEY `payee_id` (`payee_id`);

--
-- Indexes for table `temp_users`
--
ALTER TABLE `temp_users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `total_users`
--
ALTER TABLE `total_users`
  ADD PRIMARY KEY (`total_user_id`);

--
-- Indexes for table `users_info`
--
ALTER TABLE `users_info`
  ADD PRIMARY KEY (`user_id`,`email_id`,`username`,`password`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `bill_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `bill_items`
--
ALTER TABLE `bill_items`
  MODIFY `item_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `temp_users`
--
ALTER TABLE `temp_users`
  MODIFY `user_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=511;

--
-- AUTO_INCREMENT for table `users_info`
--
ALTER TABLE `users_info`
  MODIFY `user_id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `total_users` (`total_user_id`);

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `bill_items_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`) ON DELETE CASCADE;

--
-- Constraints for table `bill_users`
--
ALTER TABLE `bill_users`
  ADD CONSTRAINT `bill_users_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`),
  ADD CONSTRAINT `bill_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `total_users` (`total_user_id`);

--
-- Constraints for table `settles`
--
ALTER TABLE `settles`
  ADD CONSTRAINT `settles_ibfk_1` FOREIGN KEY (`payer_id`) REFERENCES `total_users` (`total_user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `settles_ibfk_2` FOREIGN KEY (`payee_id`) REFERENCES `total_users` (`total_user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `settles_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `bill_items` (`item_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
