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
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `receiver_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên người nhận (Lưu cứng lúc đặt hàng)',
  `receiver_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SĐT người nhận (Lưu cứng lúc đặt hàng)',
  `shipping_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Địa chỉ giao hàng',
  `payment_method` enum('COD','BANK_TRANSFER','E_WALLET','CREDIT_CARD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COD',
  `channel` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Website',
  `total_amount` decimal(15,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','SHIPPING','DELIVERED','DELIVERY_FAILED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `note` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `promotion_id` bigint(20) DEFAULT NULL,
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`order_id`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `fk_order_promotion` (`promotion_id`),
  CONSTRAINT `fk_order_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (2,5,'Hoàng Văn Nam','0912345678','Số 123, Đường Láng, Đống Đa, Hà Nội','BANK_TRANSFER','Website',550000.00,'DELIVERY_FAILED','Test xac nhan don tu API.','2026-05-03 02:53:58.984327',NULL,0.00),(6,1,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',350000.00,'DELIVERED',NULL,'2026-05-24 19:52:41.034076',NULL,0.00),(10,5,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',1560000.00,'DELIVERED',NULL,'2026-05-29 00:25:25.726759',NULL,0.00),(11,5,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',390000.00,'DELIVERED',NULL,'2026-05-29 00:35:14.096698',NULL,0.00),(12,5,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',410000.00,'DELIVERED',NULL,'2026-05-29 00:48:56.502551',NULL,0.00),(13,5,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',273000.00,'DELIVERED',NULL,'2026-05-29 02:18:25.077105',1,117000.00),(14,5,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',390000.00,'CANCELLED',NULL,'2026-05-29 02:35:17.874900',NULL,0.00),(15,5,'Hoàng Văn Nam','0912345678','123 Cầu Giấy, Hà Nội','COD','Website',390000.00,'DELIVERED',NULL,'2026-05-29 02:39:45.173044',NULL,0.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
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
