-- MySQL dump 10.13  Distrib 5.7.44, for osx10.19 (x86_64)
--
-- Host: localhost    Database: stock_app
-- ------------------------------------------------------
-- Server version	5.7.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text,
  `genre` text,
  `allergen` json DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `energy` float DEFAULT NULL,
  `protein` float DEFAULT NULL,
  `lipids` float DEFAULT NULL,
  `carbohydrate` float DEFAULT NULL,
  `salt` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (2,'ペプシ＜生＞','ソフトドリンク','[]','uploads/1716282839505.jpeg',NULL,NULL,NULL,NULL,NULL),(38,'カロリーメイト　ゼリー　アップル味','ソフトドリンク','[\"乳\"]','uploads/1716278496372.png',NULL,NULL,NULL,NULL,NULL),(39,'とまと','野菜','[]','uploads/1716637368268.jpg',20,0.7,0.1,4.7,0),(40,'レーズンのカスタードのデニッシュ','パン、もち','[\"小麦\", \"落花生\"]','uploads/1716698991532.png',79,0,0,19,0.94),(41,'オロナミンCドリンク','ソフトドリンク','[]','uploads/1716637153974.png',NULL,NULL,NULL,NULL,NULL),(42,'カロリーメイト　ブロック　チーズ味','即席食品','[\"小麦\", \"卵\", \"乳\"]','uploads/1716624442666.png',400,8.4,22.2,42.7,0.94),(43,'鶏もも肉','畜産加工品','[]',NULL,100,23,23,2,2);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_items`
--

DROP TABLE IF EXISTS `store_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `store_items` (
  `si_id` int(11) NOT NULL AUTO_INCREMENT,
  `store_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` text,
  `price` int(11) DEFAULT NULL,
  PRIMARY KEY (`si_id`),
  KEY `store_id` (`store_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `store_items_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`),
  CONSTRAINT `store_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_items`
--

LOCK TABLES `store_items` WRITE;
/*!40000 ALTER TABLE `store_items` DISABLE KEYS */;
INSERT INTO `store_items` VALUES (1,1,41,34,'2024-05-23 12:58:31','[object Object]',NULL),(4,1,39,110,'2024-05-25 11:01:51',NULL,90),(5,2,41,356,'2024-05-24 14:11:12',NULL,145),(6,3,41,230,'2024-05-25 09:09:16',NULL,90),(7,2,2,455,'2024-05-25 07:48:23',NULL,130),(8,3,42,110,'2024-05-25 08:07:22',NULL,210),(9,3,39,500,'2024-05-25 11:40:49',NULL,210),(10,4,40,110,'2024-05-26 04:50:50',NULL,210),(11,4,43,344,'2024-05-26 04:53:20',NULL,122);
/*!40000 ALTER TABLE `store_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `prefecture` varchar(255) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'セブンイレブン吉川美南５丁目店','埼玉県吉川市美南５-１０-１','000','埼玉県',35.8675,139.849),(2,'スーパーマルサン　吉川店','中野５７ー１','333','埼玉県',35.8828,139.854),(3,'セイコマート入船１丁目店','北海道小樽市入船1丁目4番16号','245','北海道',43.1889,141.006),(4,'串焼き亭ねぎ','埼玉県越谷市','3444','埼玉県',35.8747,139.79),(5,'コメダ珈琲店 イオンタウン吉川美南店','〒342-0038 埼玉県吉川市美南３丁目１２','233','埼玉県',35.8652,139.856),(6,'ウエルシアイオンタウン吉川美南ANNEX店','〒342-0038 埼玉県吉川市美南３丁目１２ イオンタウン吉川美南ANNEX','23456','埼玉県',35.8652,139.857),(7,'ローソン 吉川美南店','〒342-0038 埼玉県吉川市美南２丁目８−８','11111','埼玉県',35.8667,139.855),(8,'成城石井 ビーンズ武蔵浦和店','〒336-0021 埼玉県さいたま市南区別所７丁目１２−１','2434321','埼玉県',35.8453,139.647);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `userName` text,
  `email` text,
  `password` text,
  `isVerified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1','ヒロキ','test@test.com','test',0),('2','犬','wanwan','dog',0),('3','ネコ','nekodayo','cat',0),('4','キラキラ','kirakira','shine',0),('5','大塚','otsukadayo','$2b$10$KFsngmi0UgwiycLuOCH7u.mkE9Cd3eWgv9ZEVPb2CX6H25wIqIV4q',0),('6','s','s','$2b$10$X524LbYS6josNuiTJJizluWyvewV5g7fmpI4yFfKcAEDarYM9oKfG',0),('7','hiroki','hiroki708708@gmail.com','$2b$10$x5LlMJt4670lP90R9g.NC.nheAXHpPML0fTuvH48S/UZ5N9ZzmsfO',0),('7d3ea8d8-19c5-404a-9c5a-778423d7240e','hikaru','hiroki040708@gmail.com','$2b$10$EvE4HEVmAosiLFVbZ3AuFOH.mFdSh3mIpCmHCUwylfLuwWWyDKAzq',1),('8','hiroki','oya-hiroki008@g.ecc.u-tokyo.ac.jp','$2b$10$ZWq04VTIjnxK5QHEbGN1/.2QE6UtVuRSeeRkw3BQJB.6V7vfhF8gi',0),('cdd7e8f5-62f8-424b-a6ae-0e84865e4b95','クレヨン','oya.hiroki.uni@gmail.com','$2b$10$8Pc9rnqZFMMKUlu7wiK.duPafXcOE4UhviXru16hfycgL6oJTccji',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `verification_tokens` (
  `token` varchar(255) NOT NULL,
  `user_id` char(36) NOT NULL,
  PRIMARY KEY (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-31 15:40:08
