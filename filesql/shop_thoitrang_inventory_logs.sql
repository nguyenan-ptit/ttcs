-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: shop_thoitrang
-- ------------------------------------------------------
-- Server version	5.7.44-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inventory_logs`
--

DROP TABLE IF EXISTS `inventory_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_logs` (
  `log_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `variant_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` enum('ADJUSTMENT_IN','ADJUSTMENT_OUT','IMPORT','ORDER_CANCEL_RETURN','ORDER_OUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`log_id`),
  KEY `idx_inventory_logs_variant_id` (`variant_id`),
  KEY `idx_inventory_logs_user_id` (`user_id`),
  CONSTRAINT `fk_inventory_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_inventory_logs_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_logs`
--

LOCK TABLES `inventory_logs` WRITE;
/*!40000 ALTER TABLE `inventory_logs` DISABLE KEYS */;
INSERT INTO `inventory_logs` VALUES (1,4,10,'IMPORT',20,'2026-05-28 16:22:21.615207'),(2,3,10,'ADJUSTMENT_IN',8,'2026-05-28 16:22:59.820061'),(3,3,10,'ADJUSTMENT_OUT',4,'2026-05-28 16:32:48.534852'),(4,3,10,'ORDER_CANCEL_RETURN',1,'2026-05-28 16:40:01.672364'),(5,1,10,'ORDER_CANCEL_RETURN',1,'2026-05-28 16:42:05.986570'),(6,1,10,'ORDER_CANCEL_RETURN',1,'2026-05-28 17:00:40.564993'),(7,1,5,'ORDER_CANCEL_RETURN',1,'2026-05-28 17:11:10.945279'),(8,4,5,'ORDER_CANCEL_RETURN',1,'2026-05-28 17:11:10.946593'),(9,1,10,'ORDER_CANCEL_RETURN',1,'2026-05-28 17:39:27.982208');
/*!40000 ALTER TABLE `inventory_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 17:43:42
