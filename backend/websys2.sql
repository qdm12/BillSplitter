-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2017 at 08:55 PM
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
-- Database: `websys`
--

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` int(11) NOT NULL,
  `link` char(40) NOT NULL,
  `address` varchar(100) NOT NULL,
  `restaurant` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tax` float NOT NULL DEFAULT '0',
  `tip` float NOT NULL DEFAULT '0',
  `done` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`id`, `link`, `address`, `restaurant`, `name`, `time`, `tax`, `tip`, `done`) VALUES
(1, '2VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', '196 W Third Avenue', 'Pizza\'o\'ven', 'Birthday pizza', '2017-12-01 05:00:01', 19.67, 5, 0),
(2, 'WBdfOcWKtm3ZX4jk8cG0aIDxrhNOJC8207Zsr9Lk', '185 E First Avenue', 'McDonald\'s', 'McDonald\'s', '2017-12-01 05:00:01', 19.67, 0, 0),
(3, '3VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', '180 10TH Street ', 'Prime Food Market', 'Prime Food Market', '2017-12-18 19:23:33', 2.37, 0, 0),
(4, '4VxFHtGDh44bMtW4VbngW3XxPQwqIQucnAUM6ZHL', '1 Penn Plaza ', 'Charlie\'s Grill Sub', 'Charlie\'s Grill Sub', '2017-12-18 19:23:33', 1.85, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `bills_users`
--

CREATE TABLE `bills_users` (
  `bill_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `temp_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `bills_users`
--

INSERT INTO `bills_users` (`bill_id`, `user_id`, `temp_user_id`) VALUES
(1, 1, NULL),
(1, 2, NULL),
(1, NULL, 1),
(2, 1, NULL),
(2, 2, NULL),
(2, 3, NULL),
(2, NULL, 2),
(3, 4, NULL),
(4, 4, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `amount` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `bill_id`, `name`, `amount`) VALUES
(1, 1, 'PizzaA', 10.5),
(2, 1, 'PizzaB', 14),
(3, 1, 'Fries', 6.24),
(4, 2, 'Cheeseburger', 3.6),
(5, 2, 'Cheeseburger', 3.6),
(6, 2, 'Large fries', 4.4),
(7, 2, 'Diet coke', 1.5),
(8, 2, 'Diet coke', 1.5),
(9, 2, 'Vanilla ice cream', 3.58),
(10, 3, 'Chicken Tikka', 10.99),
(11, 4, 'REG STEAK', 6.75),
(12, 3, 'MALAI KOFTA', 7.49),
(14, 3, 'CHICKEN TIKKA MASALA', 8.99),
(15, 3, 'CHICKEN PALAK', 8.99),
(16, 4, 'REG STEAK', 6.75),
(17, 4, 'SM VEGGIE', 4.5),
(18, 4, 'CHEESE BACON FRIES', 2.79);

-- --------------------------------------------------------

--
-- Table structure for table `items_consumers`
--

CREATE TABLE `items_consumers` (
  `item_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `temp_user_id` int(11) DEFAULT NULL,
  `paid` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `items_consumers`
--

INSERT INTO `items_consumers` (`item_id`, `user_id`, `temp_user_id`, `paid`) VALUES
(1, 1, NULL, 0),
(1, NULL, 1, 0),
(2, 2, NULL, 0),
(3, 1, NULL, 0),
(3, 2, NULL, 0),
(3, NULL, 1, 0),
(10, 3, NULL, 0),
(15, 1, NULL, 0),
(14, 2, NULL, 0),
(12, 3, NULL, 0),
(11, 1, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `temp_users`
--

CREATE TABLE `temp_users` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `bill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `temp_users`
--

INSERT INTO `temp_users` (`id`, `name`, `bill_id`) VALUES
(1, 'John', 1),
(2, 'Gleb', 2),
(3, 'cherry', 3),
(4, 'mini', 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(70) NOT NULL,
  `username` varchar(40) NOT NULL,
  `digest` char(44) DEFAULT NULL,
  `salt` char(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `digest`, `salt`) VALUES
(1, 'alice@a.com', 'Alice', '2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=', '=gaxTRjS'),
(2, 'bob@b.com', 'Bob', '2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=', '=gaxTRjS'),
(3, 'carol@c.com', 'Carol', '2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=', '=gaxTRjS'),
(4, 'rose@r.com', 'rose', '2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=', '=gaxTRjS'),
(5, 'jack@j.com', 'jack', '2j4y0HVYYbrWdwh+NzklBaPEXSJ7TaD6g+LzcrQ5RVY=', '=gaxTRjS');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`,`link`),
  ADD UNIQUE KEY `link` (`link`);

--
-- Indexes for table `bills_users`
--
ALTER TABLE `bills_users`
  ADD UNIQUE KEY `bill_id` (`bill_id`,`user_id`),
  ADD UNIQUE KEY `bill_id_2` (`bill_id`,`temp_user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `temp_user_id` (`temp_user_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bill_id` (`bill_id`);

--
-- Indexes for table `items_consumers`
--
ALTER TABLE `items_consumers`
  ADD KEY `item_id` (`item_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `temp_user_id` (`temp_user_id`);

--
-- Indexes for table `temp_users`
--
ALTER TABLE `temp_users`
  ADD PRIMARY KEY (`id`,`bill_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`,`email`,`username`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `temp_users`
--
ALTER TABLE `temp_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bills_users`
--
ALTER TABLE `bills_users`
  ADD CONSTRAINT `bills_users_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`),
  ADD CONSTRAINT `bills_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bills_users_ibfk_3` FOREIGN KEY (`temp_user_id`) REFERENCES `temp_users` (`id`);

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`);

--
-- Constraints for table `items_consumers`
--
ALTER TABLE `items_consumers`
  ADD CONSTRAINT `items_consumers_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `items_consumers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `items_consumers_ibfk_3` FOREIGN KEY (`temp_user_id`) REFERENCES `temp_users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
