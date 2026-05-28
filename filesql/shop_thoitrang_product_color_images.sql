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
-- Table structure for table `product_color_images`
--

DROP TABLE IF EXISTS `product_color_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_color_images` (
  `image_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) NOT NULL,
  `color` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`image_id`),
  UNIQUE KEY `uk_product_color_image` (`product_id`,`color`),
  CONSTRAINT `fk_product_color_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_color_images`
--

LOCK TABLES `product_color_images` WRITE;
/*!40000 ALTER TABLE `product_color_images` DISABLE KEYS */;
INSERT INTO `product_color_images` VALUES (1,1,'Tiêu','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Phong-Loose-L-4-2760-Tieu-M.jpg?v=1777103331',1),(3,1,'đen','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Phong-Loose-L-4-2760-Den-M.jpg?v=1777103029',1),(4,4,'Be','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-KaKi-Loose-30-4-QKK019-Be-29-1.jpg?v=1778561455',1),(6,4,'Nâu','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-KaKi-Loose-30-4-QKK019-Nau-29.jpg?v=1778570067',1),(9,4,'Ghi','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-KaKi-Loose-30-4-QKK019-Ghi-29.jpg?v=1778570019',1),(10,5,'Be','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Short-L-4-1583-Be-M-1.jpg?v=1779249726',1),(11,5,'Đen','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Short-L-4-1583-Den-M.jpg?v=1779249623',1),(12,6,'Trắng','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Short-L-5-1588.jpg?v=1777888785',1),(13,8,'Đên','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Tanktop-Regular-L-4-3994-Den-M.jpg?v=1779286041',1),(14,8,'Nâu','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Tanktop-Regular-L-4-3994-Nau-M.jpg?v=1779286169',1),(15,4,'Đen','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-KaKi-Loose-30-4-QKK019-Den-29.jpg?v=1778569967',1),(19,9,'Xanh','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Jeans-Loose-30-1-1361-1.jpg?v=1778768828',1),(20,3,'Xanh','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Jeans-Loose-30-1-1361-1.jpg?v=1778768828',1),(22,10,'Đen','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Jeans-Straight-30-1-1365-2.jpg?v=1767808367',1),(23,2,'Ghi','https://pos.nvncdn.com/f4d87e-8901/ps/Quan-Au-Slim-30-2-QA088.jpg?v=1766929035',1),(24,11,'Đen','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Polo-Regular-L-4-3396-Den-M.jpg?v=1777892825',1),(25,11,'Tiêu','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Polo-Regular-L-4-3396-Tieu-M.jpg?v=1777892868',1),(28,12,'Đen','https://pos.nvncdn.com/f4d87e-8901/ps/Ao-Polo-Regular-L-3-3411-Den-M.jpg?v=1774943644',1),(29,13,'Đen','https://pos.nvncdn.com/f4d87e-8901/ps/20250529_S2mOlyqIi9.jpeg?v=1748511134',1);
/*!40000 ALTER TABLE `product_color_images` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-29  3:39:47
