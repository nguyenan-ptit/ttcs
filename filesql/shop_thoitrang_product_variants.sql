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
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `variant_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) NOT NULL,
  `color` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int(11) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `uk_product_variant_color_size` (`product_id`,`color`,`size`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (3,2,'Ghi','30',5,1),(7,1,'Tiêu','S',16,1),(8,1,'Tiêu','M',0,1),(9,1,'Tiêu','L',0,1),(10,1,'Tiêu','XL',16,1),(11,1,'đen','S',0,1),(12,1,'đen','M',0,1),(13,1,'đen','L',0,1),(14,1,'đen','XL',0,1),(15,4,'Be','28',0,1),(16,4,'Be','29',0,1),(17,4,'Be','30',0,1),(18,4,'Be','31',0,1),(19,4,'Nâu','28',0,1),(20,4,'Nâu','29',0,1),(21,4,'Nâu','30',0,1),(22,4,'Nâu','31',0,1),(23,4,'Ghi','28',0,1),(24,4,'Ghi','29',0,1),(25,4,'Ghi','30',0,1),(26,4,'Ghi','31',0,1),(27,5,'Be','28',0,1),(28,5,'Be','29',0,1),(29,5,'Be','30',0,1),(30,5,'Be','31',0,1),(31,5,'Đen','28',0,1),(32,5,'Đen','29',0,1),(33,5,'Đen','30',0,1),(34,5,'Đen','31',0,1),(35,6,'Trắng','28',0,1),(36,6,'Trắng','29',0,1),(37,6,'Trắng','30',0,1),(38,6,'Trắng','31',0,1),(39,7,'Tiêu','28',0,1),(40,7,'Tiêu','29',0,1),(41,7,'Tiêu','30',0,1),(42,7,'Tiêu','31',0,1),(43,8,'Đên','S',0,1),(44,8,'Đên','M',0,1),(45,8,'Đên','L',0,1),(46,8,'Đên','XL',0,1),(47,8,'Nâu','S',0,1),(48,8,'Nâu','M',0,1),(49,8,'Nâu','L',0,1),(50,8,'Nâu','XL',0,1),(51,4,'Đen','28',0,1),(52,4,'Đen','29',0,1),(53,4,'Đen','30',0,1),(54,4,'Đen','31',0,1),(55,9,'Xanh','28',0,1),(56,9,'Xanh','29',0,1),(57,9,'Xanh','30',0,1),(58,9,'Xanh','31',0,1),(59,3,'Xanh','28',0,1),(60,3,'Xanh','29',0,1),(61,3,'Xanh','30',0,1),(62,3,'Xanh','31',0,1),(63,3,'Đen','28',0,0),(64,3,'Đen','29',0,0),(65,3,'Đen','30',0,0),(66,3,'Đen','31',0,0),(67,2,'Ghi','28',0,1),(68,2,'Ghi','29',0,1),(69,2,'Ghi','31',0,1),(70,2,'Hồng','28',0,0),(71,2,'Hồng','29',0,0),(72,2,'Hồng','30',0,0),(73,2,'Hồng','31',0,0),(74,10,'Đen','28',0,1),(75,10,'Đen','29',0,1),(76,10,'Đen','30',0,1),(77,10,'Đen','31',0,1),(78,11,'Đen','S',5,1),(79,11,'Đen','M',5,1),(80,11,'Đen','L',6,1),(81,11,'Đen','XL',5,1),(82,11,'Tiêu','S',7,1),(83,11,'Tiêu','M',4,1),(84,11,'Tiêu','L',4,1),(85,11,'Tiêu','XL',4,1),(86,12,'Đen','S',0,1),(87,12,'Đen','M',4,1),(88,12,'Đen','L',0,1),(89,12,'Đen','XL',0,1),(90,13,'Đen','S',5,1),(91,13,'Đen','M',3,1),(92,13,'Đen','L',1,1),(93,13,'Đen','XL',6,1);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-29  3:39:50
