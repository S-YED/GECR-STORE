-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2024 at 03:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `equipments`
--

-- --------------------------------------------------------

--

--



--
-- Dumping data for table `attendence`
--



-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `cid` int(11) NOT NULL,
  `branch` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`cid`, `branch`) VALUES
(3, 'Electronic and Communication'),
(5, 'Civil'),
(7, 'Computer Science'),
(8, 'Mechanical');

-- --------------------------------------------------------

--
-- Table structure for table `equipments`
--

CREATE TABLE `equipments` (
  `id` int(11) NOT NULL,
  `orderno` varchar(20) NOT NULL,
  `ename` varchar(60) NOT NULL,
  `edate` varchar(20) DEFAULT NULL,
  `pur` varchar(50) DEFAULT NULL,
  `amt` int(20) DEFAULT NULL,
  `cond` varchar(40) NOT NULL,
  `branch` varchar(30) DEFAULT NULL,
  `rname` varchar(50) DEFAULT NULL,
  `qnty` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipments`
--

INSERT INTO `equipments` (`id`, `orderno`, `ename`, `edate`, `pur`, `amt`, `cond`, `branch`, `rname`, `qnty`) VALUES
(2, '10', 'Signal Generator', '03-12-2016', 'UNION INSTRUMENTS,BANGLORE', 87343, 'Serviceable', 'Electronic and Communication', 'Micrprocessor Lab', 7),
(3, 'VT/121', 'EXIDE 100AH Battery(Tubular Type)12V', '17-03-2018', 'Vasundhara Technologies,Banglore', 89920, 'Serviceable', NULL, NULL, 5),
(4, '13', 'STEPPER MOTOR Interface', '03-12-2016', 'UNION INSTRUMENTS,BANGLORE', 56419, 'Serviceable', 'Electronic and Communication', 'Micrprocessor Lab', 5),
(5, '13', 'DC MOTOR Interface', '03-12-2016', 'UNION INSTRUMENTS,BANGLORE', 33205, 'Serviceable', 'Electronic and Communication', 'Micrprocessor Lab', 5),
(6, '11', 'PCI DIOT', '03-12-2016', 'UNION INSTRUMENTS,BANGLORE', 89411, 'Serviceable', 'Electronic and Communication', 'Micrprocessor Lab', 5),
(7, '9', 'KeyBoard Interface', '03-12-2016', 'UNION INSTRUMENTS,BANGLORE', 23615, 'Serviceable', 'Electronic and Communication', 'Micrprocessor Lab', 5),
(143, '32', 'Wifi Router', '27-12-2027', 'Clive Technologies Ramanagara', 8104, 'Serviceable', NULL, NULL, 3);

--
-- Triggers `equipments`
--
DELIMITER $$
CREATE TRIGGER `DELETE` BEFORE DELETE ON `equipments` FOR EACH ROW INSERT INTO trig VALUES(null,OLD.orderno,'EQUIPMENT DELETED',NOW())
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `Insert` AFTER INSERT ON `equipments` FOR EACH ROW INSERT INTO trig VALUES(null,NEW.orderno,'EQUIPMENT INSERTED',NOW())
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `UPDATE` AFTER UPDATE ON `equipments` FOR EACH ROW INSERT INTO trig VALUES(null,NEW.orderno,'EQUIPMENT UPDATED',NOW())
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `test`
--

CREATE TABLE `test` (
  `id` int(11) NOT NULL,
  `name` varchar(52) NOT NULL,
  `email` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test`
--

INSERT INTO `test` (`id`, `name`, `email`) VALUES
(1, 'aaa', 'aaa@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `trig`
--

CREATE TABLE `trig` (
  `tid` int(11) NOT NULL,
  `rollno` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`) VALUES
(4, 'anees', 'anees@gmail.com', 'pbkdf2:sha256:150000$1CSLss89$ef995dfc48121768b2070bfbe7a568871cd56fac85ac7c95a1e645c8806146e9');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendence`
--


--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`cid`);

--
-- Indexes for table `equipments`
--
ALTER TABLE `equipments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `test`
--
ALTER TABLE `test`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trig`
--
ALTER TABLE `trig`
  ADD PRIMARY KEY (`tid`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendence`
--


--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `cid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `equipments`
--
ALTER TABLE `equipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT for table `test`
--
ALTER TABLE `test`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `trig`
--
ALTER TABLE `trig`
  MODIFY `tid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=541;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
