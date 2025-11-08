-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_exam_cell
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assessment`
--

DROP TABLE IF EXISTS `assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment` (
  `assessment_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `max_marks` decimal(5,2) DEFAULT '100.00',
  `weight_percent` decimal(5,2) DEFAULT '0.00',
  `assessment_date` date DEFAULT NULL,
  PRIMARY KEY (`assessment_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `assessment_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment`
--

LOCK TABLES `assessment` WRITE;
/*!40000 ALTER TABLE `assessment` DISABLE KEYS */;
INSERT INTO `assessment` VALUES (1,1,'Mid-term','Database Mid-term Examination',100.00,30.00,'2025-10-15'),(2,1,'Assignment','Database Design Project',50.00,20.00,'2025-09-30'),(3,2,'Assignment','Web Development Project',50.00,20.00,'2025-10-20'),(4,3,'Final','DSA Final Examination',100.00,40.00,'2025-11-25'),(5,4,'Mid-term','Machine Learning Mid-term',100.00,35.00,'2025-10-18'),(6,5,'Assignment','Software Requirements Analysis',75.00,25.00,'2025-10-05');
/*!40000 ALTER TABLE `assessment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `class_date` date DEFAULT NULL,
  `status` varchar(10) DEFAULT 'Present',
  `remarks` text,
  PRIMARY KEY (`attendance_id`),
  KEY `section_id` (`section_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `credits` int DEFAULT '4',
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'Database Management Systems',4,1),(2,'Web Technologies',3,2),(3,'Data Structures and Algorithms',4,1),(4,'Machine Learning',4,3),(5,'Software Engineering',3,1),(6,'Computer Networks',4,1),(7,'Operating Systems',4,1),(8,'Artificial Intelligence',4,3),(9,'masigrate',4,1);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `dept_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `office_phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=678 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Computer Science & Engineering','0422-2345678'),(2,'Information Technology','0422-2345679'),(3,'Artificial Intelligence & Data Science','0422-2345680'),(4,'Electronics & Communication','0422-2345681'),(6,'IT',NULL),(10,'IT',NULL),(14,'IT',NULL),(18,'IT',NULL),(22,'IT',NULL),(25,'CSE',NULL),(26,'IT',NULL),(30,'IT',NULL),(34,'IT',NULL),(38,'IT',NULL),(42,'IT',NULL),(45,'Electronics and electrical engeeneering',NULL),(46,'CSE',NULL),(47,'IT',NULL),(48,'AIDS',NULL),(49,'ECE',NULL),(50,'CSE',NULL),(51,'IT',NULL),(52,'AIDS',NULL),(53,'ECE',NULL),(54,'CSE',NULL),(55,'IT',NULL),(56,'AIDS',NULL),(57,'ECE',NULL),(58,'CSE',NULL),(59,'IT',NULL),(60,'AIDS',NULL),(61,'ECE',NULL),(62,'CSE',NULL),(63,'IT',NULL),(64,'AIDS',NULL),(65,'ECE',NULL),(66,'CSE',NULL),(67,'IT',NULL),(68,'AIDS',NULL),(69,'ECE',NULL),(70,'CSE',NULL),(71,'IT',NULL),(72,'AIDS',NULL),(73,'ECE',NULL),(74,'CSE',NULL),(75,'IT',NULL),(76,'AIDS',NULL),(77,'ECE',NULL),(78,'CSE',NULL),(79,'IT',NULL),(81,'ECE',NULL),(82,'CSE',NULL),(83,'IT',NULL),(84,'AIDS',NULL),(85,'ECE',NULL),(86,'CSE',NULL),(87,'IT',NULL),(88,'AIDS',NULL),(89,'ECE',NULL),(90,'CSE',NULL),(91,'IT',NULL),(92,'AIDS',NULL),(93,'ECE',NULL),(94,'CSE',NULL),(95,'IT',NULL),(96,'AIDS',NULL),(97,'ECE',NULL),(98,'CSE',NULL),(99,'IT',NULL),(100,'AIDS',NULL),(101,'ECE',NULL),(102,'CSE',NULL),(103,'IT',NULL),(104,'AIDS',NULL),(105,'ECE',NULL),(106,'CSE',NULL),(107,'IT',NULL),(108,'AIDS',NULL),(109,'ECE',NULL),(110,'CSE',NULL),(111,'IT',NULL),(112,'AIDS',NULL),(113,'ECE',NULL),(114,'CSE',NULL),(115,'IT',NULL),(116,'AIDS',NULL),(117,'ECE',NULL),(118,'CSE',NULL),(119,'IT',NULL),(120,'AIDS',NULL),(121,'ECE',NULL),(122,'CSE',NULL),(123,'IT',NULL),(124,'AIDS',NULL),(125,'ECE',NULL),(126,'CSE',NULL),(127,'IT',NULL),(128,'AIDS',NULL),(129,'ECE',NULL),(130,'CSE',NULL),(131,'IT',NULL),(132,'AIDS',NULL),(133,'ECE',NULL),(134,'CSE',NULL),(135,'IT',NULL),(136,'AIDS',NULL),(137,'ECE',NULL),(138,'CSE',NULL),(139,'IT',NULL),(140,'AIDS',NULL),(141,'ECE',NULL),(142,'CSE',NULL),(143,'IT',NULL),(144,'AIDS',NULL),(145,'ECE',NULL),(146,'CSE',NULL),(147,'IT',NULL),(148,'AIDS',NULL),(149,'ECE',NULL),(150,'CSE',NULL),(151,'IT',NULL),(152,'AIDS',NULL),(153,'ECE',NULL),(154,'CSE',NULL),(155,'IT',NULL),(156,'AIDS',NULL),(157,'ECE',NULL),(158,'CSE',NULL),(159,'IT',NULL),(160,'AIDS',NULL),(161,'ECE',NULL),(162,'CSE',NULL),(163,'IT',NULL),(164,'AIDS',NULL),(165,'ECE',NULL),(166,'CSE',NULL),(167,'IT',NULL),(168,'AIDS',NULL),(169,'ECE',NULL),(170,'CSE',NULL),(171,'IT',NULL),(172,'AIDS',NULL),(173,'ECE',NULL),(174,'CSE',NULL),(175,'IT',NULL),(176,'AIDS',NULL),(177,'ECE',NULL),(178,'CSE',NULL),(179,'IT',NULL),(180,'AIDS',NULL),(181,'ECE',NULL),(182,'CSE',NULL),(183,'IT',NULL),(184,'AIDS',NULL),(185,'ECE',NULL),(186,'CSE',NULL),(187,'IT',NULL),(188,'AIDS',NULL),(189,'ECE',NULL),(190,'CSE',NULL),(191,'IT',NULL),(192,'AIDS',NULL),(193,'ECE',NULL),(194,'CSE',NULL),(195,'IT',NULL),(196,'AIDS',NULL),(197,'ECE',NULL),(198,'CSE',NULL),(199,'IT',NULL),(200,'AIDS',NULL),(201,'ECE',NULL),(202,'CSE',NULL),(203,'IT',NULL),(204,'AIDS',NULL),(205,'ECE',NULL),(206,'CSE',NULL),(207,'IT',NULL),(208,'AIDS',NULL),(209,'ECE',NULL),(210,'CSE',NULL),(211,'IT',NULL),(212,'AIDS',NULL),(213,'ECE',NULL),(214,'CSE',NULL),(215,'IT',NULL),(216,'AIDS',NULL),(217,'ECE',NULL),(218,'CSE',NULL),(219,'IT',NULL),(220,'AIDS',NULL),(221,'ECE',NULL),(222,'CSE',NULL),(223,'IT',NULL),(224,'AIDS',NULL),(225,'ECE',NULL),(226,'CSE',NULL),(227,'IT',NULL),(228,'AIDS',NULL),(229,'ECE',NULL),(230,'CSE',NULL),(231,'IT',NULL),(232,'AIDS',NULL),(233,'ECE',NULL),(234,'CSE',NULL),(235,'IT',NULL),(236,'AIDS',NULL),(237,'ECE',NULL),(238,'CSE',NULL),(239,'IT',NULL),(240,'AIDS',NULL),(241,'ECE',NULL),(242,'CSE',NULL),(243,'IT',NULL),(244,'AIDS',NULL),(245,'ECE',NULL),(246,'CSE',NULL),(247,'IT',NULL),(248,'AIDS',NULL),(249,'ECE',NULL),(250,'CSE',NULL),(251,'IT',NULL),(252,'AIDS',NULL),(253,'ECE',NULL),(254,'CSE',NULL),(255,'IT',NULL),(256,'AIDS',NULL),(257,'ECE',NULL),(258,'CSE',NULL),(259,'IT',NULL),(260,'AIDS',NULL),(261,'ECE',NULL),(262,'CSE',NULL),(263,'IT',NULL),(264,'AIDS',NULL),(265,'ECE',NULL),(266,'CSE',NULL),(267,'IT',NULL),(268,'AIDS',NULL),(269,'ECE',NULL),(270,'CSE',NULL),(271,'IT',NULL),(272,'AIDS',NULL),(273,'ECE',NULL),(274,'CSE',NULL),(275,'IT',NULL),(276,'AIDS',NULL),(277,'ECE',NULL),(278,'CSE',NULL),(279,'IT',NULL),(280,'AIDS',NULL),(281,'ECE',NULL),(282,'CSE',NULL),(283,'IT',NULL),(284,'AIDS',NULL),(285,'ECE',NULL),(286,'CSE',NULL),(287,'IT',NULL),(288,'AIDS',NULL),(289,'ECE',NULL),(290,'CSE',NULL),(291,'IT',NULL),(292,'AIDS',NULL),(293,'ECE',NULL),(294,'CSE',NULL),(295,'IT',NULL),(296,'AIDS',NULL),(297,'ECE',NULL),(298,'CSE',NULL),(299,'IT',NULL),(300,'AIDS',NULL),(301,'ECE',NULL),(302,'CSE',NULL),(303,'IT',NULL),(304,'AIDS',NULL),(305,'ECE',NULL),(306,'CSE',NULL),(307,'IT',NULL),(308,'AIDS',NULL),(309,'ECE',NULL),(310,'CSE',NULL),(311,'IT',NULL),(312,'AIDS',NULL),(313,'ECE',NULL),(314,'CSE',NULL),(315,'IT',NULL),(316,'AIDS',NULL),(317,'ECE',NULL),(318,'CSE',NULL),(319,'IT',NULL),(320,'AIDS',NULL),(321,'ECE',NULL),(322,'CSE',NULL),(323,'IT',NULL),(324,'AIDS',NULL),(325,'ECE',NULL),(326,'CSE',NULL),(327,'IT',NULL),(328,'AIDS',NULL),(329,'ECE',NULL),(330,'CSE',NULL),(331,'IT',NULL),(332,'AIDS',NULL),(333,'ECE',NULL),(334,'CSE',NULL),(335,'IT',NULL),(336,'AIDS',NULL),(337,'ECE',NULL),(338,'CSE',NULL),(339,'IT',NULL),(340,'AIDS',NULL),(341,'ECE',NULL),(342,'CSE',NULL),(343,'IT',NULL),(344,'AIDS',NULL),(345,'ECE',NULL),(346,'CSE',NULL),(347,'IT',NULL),(348,'AIDS',NULL),(349,'ECE',NULL),(350,'CSE',NULL),(351,'IT',NULL),(352,'AIDS',NULL),(353,'ECE',NULL),(354,'CSE',NULL),(355,'IT',NULL),(356,'AIDS',NULL),(357,'ECE',NULL),(358,'CSE',NULL),(359,'IT',NULL),(360,'AIDS',NULL),(361,'ECE',NULL),(362,'CSE',NULL),(363,'IT',NULL),(364,'AIDS',NULL),(365,'ECE',NULL),(366,'CSE',NULL),(367,'IT',NULL),(368,'AIDS',NULL),(369,'ECE',NULL),(370,'CSE',NULL),(371,'IT',NULL),(372,'AIDS',NULL),(373,'ECE',NULL),(374,'CSE',NULL),(375,'IT',NULL),(376,'AIDS',NULL),(377,'ECE',NULL),(378,'CSE',NULL),(379,'IT',NULL),(380,'AIDS',NULL),(381,'ECE',NULL),(382,'CSE',NULL),(383,'IT',NULL),(384,'AIDS',NULL),(385,'ECE',NULL),(386,'CSE',NULL),(387,'IT',NULL),(388,'AIDS',NULL),(389,'ECE',NULL),(390,'CSE',NULL),(391,'IT',NULL),(392,'AIDS',NULL),(393,'ECE',NULL),(394,'CSE',NULL),(395,'IT',NULL),(396,'AIDS',NULL),(397,'ECE',NULL),(398,'CSE',NULL),(399,'IT',NULL),(400,'AIDS',NULL),(401,'ECE',NULL),(402,'CSE',NULL),(403,'IT',NULL),(404,'AIDS',NULL),(405,'ECE',NULL),(406,'CSE',NULL),(407,'IT',NULL),(408,'AIDS',NULL),(409,'ECE',NULL),(410,'CSE',NULL),(411,'IT',NULL),(412,'AIDS',NULL),(413,'ECE',NULL),(414,'CSE',NULL),(415,'IT',NULL),(416,'AIDS',NULL),(417,'ECE',NULL),(418,'CSE',NULL),(419,'IT',NULL),(420,'AIDS',NULL),(421,'ECE',NULL),(422,'CSE',NULL),(423,'IT',NULL),(424,'AIDS',NULL),(425,'ECE',NULL),(426,'CSE',NULL),(427,'IT',NULL),(428,'AIDS',NULL),(429,'ECE',NULL),(430,'CSE',NULL),(431,'IT',NULL),(432,'AIDS',NULL),(433,'ECE',NULL),(434,'CSE',NULL),(435,'IT',NULL),(436,'AIDS',NULL),(437,'ECE',NULL),(438,'CSE',NULL),(439,'IT',NULL),(440,'AIDS',NULL),(441,'ECE',NULL),(442,'CSE',NULL),(443,'IT',NULL),(444,'AIDS',NULL),(445,'ECE',NULL),(446,'CSE',NULL),(447,'IT',NULL),(448,'AIDS',NULL),(449,'ECE',NULL),(450,'CSE',NULL),(451,'IT',NULL),(452,'AIDS',NULL),(453,'ECE',NULL),(454,'CSE',NULL),(455,'IT',NULL),(456,'AIDS',NULL),(457,'ECE',NULL),(458,'CSE',NULL),(459,'IT',NULL),(460,'AIDS',NULL),(461,'ECE',NULL),(462,'CSE',NULL),(463,'IT',NULL),(464,'AIDS',NULL),(465,'ECE',NULL),(466,'CSE',NULL),(467,'IT',NULL),(468,'AIDS',NULL),(469,'ECE',NULL),(470,'CSE',NULL),(471,'IT',NULL),(472,'AIDS',NULL),(473,'ECE',NULL),(474,'CSE',NULL),(475,'IT',NULL),(476,'AIDS',NULL),(477,'ECE',NULL),(478,'CSE',NULL),(479,'IT',NULL),(480,'AIDS',NULL),(481,'ECE',NULL),(482,'CSE',NULL),(483,'IT',NULL),(484,'AIDS',NULL),(485,'ECE',NULL),(486,'CSE',NULL),(487,'IT',NULL),(488,'AIDS',NULL),(489,'ECE',NULL),(490,'CSE',NULL),(491,'IT',NULL),(492,'AIDS',NULL),(493,'ECE',NULL),(494,'CSE',NULL),(495,'IT',NULL),(496,'AIDS',NULL),(497,'ECE',NULL),(498,'CSE',NULL),(499,'IT',NULL),(500,'AIDS',NULL),(501,'ECE',NULL),(502,'CSE',NULL),(503,'IT',NULL),(504,'AIDS',NULL),(505,'ECE',NULL),(506,'CSE',NULL),(507,'IT',NULL),(508,'AIDS',NULL),(509,'ECE',NULL),(510,'CSE',NULL),(511,'IT',NULL),(512,'AIDS',NULL),(513,'ECE',NULL),(514,'CSE',NULL),(515,'IT',NULL),(516,'AIDS',NULL),(517,'ECE',NULL),(518,'CSE',NULL),(519,'IT',NULL),(520,'AIDS',NULL),(521,'ECE',NULL),(522,'CSE',NULL),(523,'IT',NULL),(524,'AIDS',NULL),(525,'ECE',NULL),(526,'CSE',NULL),(527,'IT',NULL),(528,'AIDS',NULL),(529,'ECE',NULL),(530,'CSE',NULL),(531,'IT',NULL),(532,'AIDS',NULL),(533,'ECE',NULL),(534,'CSE',NULL),(535,'IT',NULL),(536,'AIDS',NULL),(537,'ECE',NULL),(538,'CSE',NULL),(539,'IT',NULL),(540,'AIDS',NULL),(541,'ECE',NULL),(542,'CSE',NULL),(543,'IT',NULL),(544,'AIDS',NULL),(545,'ECE',NULL),(546,'CSE',NULL),(547,'IT',NULL),(548,'AIDS',NULL),(549,'ECE',NULL),(550,'CSE',NULL),(551,'IT',NULL),(552,'AIDS',NULL),(553,'ECE',NULL),(554,'CSE',NULL),(555,'IT',NULL),(556,'AIDS',NULL),(557,'ECE',NULL),(558,'CSE',NULL),(559,'IT',NULL),(560,'AIDS',NULL),(561,'ECE',NULL),(562,'CSE',NULL),(563,'IT',NULL),(564,'AIDS',NULL),(565,'ECE',NULL),(566,'CSE',NULL),(567,'IT',NULL),(568,'AIDS',NULL),(569,'ECE',NULL),(570,'CSE',NULL),(571,'IT',NULL),(572,'AIDS',NULL),(573,'ECE',NULL),(574,'CSE',NULL),(575,'IT',NULL),(576,'AIDS',NULL),(577,'ECE',NULL),(578,'CSE',NULL),(579,'IT',NULL),(580,'AIDS',NULL),(581,'ECE',NULL),(582,'CSE',NULL),(583,'IT',NULL),(584,'AIDS',NULL),(585,'ECE',NULL),(586,'CSE',NULL),(587,'IT',NULL),(588,'AIDS',NULL),(589,'ECE',NULL),(590,'CSE',NULL),(591,'IT',NULL),(592,'AIDS',NULL),(593,'ECE',NULL),(594,'CSE',NULL),(595,'IT',NULL),(596,'AIDS',NULL),(597,'ECE',NULL),(598,'CSE',NULL),(599,'IT',NULL),(600,'AIDS',NULL),(601,'ECE',NULL),(602,'CSE',NULL),(603,'IT',NULL),(604,'AIDS',NULL),(605,'ECE',NULL),(606,'CSE',NULL),(607,'IT',NULL),(608,'AIDS',NULL),(609,'ECE',NULL),(610,'CSE',NULL),(611,'IT',NULL),(612,'AIDS',NULL),(613,'ECE',NULL),(614,'CSE',NULL),(615,'IT',NULL),(616,'AIDS',NULL),(617,'ECE',NULL),(618,'CSE',NULL),(619,'IT',NULL),(620,'AIDS',NULL),(621,'ECE',NULL),(622,'CSE',NULL),(623,'IT',NULL),(624,'AIDS',NULL),(625,'ECE',NULL),(626,'CSE',NULL),(627,'IT',NULL),(628,'AIDS',NULL),(629,'ECE',NULL),(630,'CSE',NULL),(631,'IT',NULL),(632,'AIDS',NULL),(633,'ECE',NULL),(634,'CSE',NULL),(635,'IT',NULL),(636,'AIDS',NULL),(637,'ECE',NULL),(638,'CSE',NULL),(639,'IT',NULL),(640,'AIDS',NULL),(641,'ECE',NULL),(642,'CSE',NULL),(643,'IT',NULL),(644,'AIDS',NULL),(645,'ECE',NULL),(646,'CSE',NULL),(647,'IT',NULL),(648,'AIDS',NULL),(649,'ECE',NULL),(650,'CSE',NULL),(651,'IT',NULL),(652,'AIDS',NULL),(653,'ECE',NULL),(654,'CSE',NULL),(655,'IT',NULL),(656,'AIDS',NULL),(657,'ECE',NULL),(658,'CSE',NULL),(659,'IT',NULL),(660,'AIDS',NULL),(661,'ECE',NULL),(662,'CSE',NULL),(663,'IT',NULL),(664,'AIDS',NULL),(665,'ECE',NULL),(666,'CSE',NULL),(667,'IT',NULL),(668,'AIDS',NULL),(669,'ECE',NULL),(670,'CSE',NULL),(671,'IT',NULL),(672,'AIDS',NULL),(673,'ECE',NULL),(674,'CSE',NULL),(675,'IT',NULL),(676,'AIDS',NULL),(677,'ECE',NULL);
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `section_id` int DEFAULT NULL,
  `enroll_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Enrolled',
  `grade_mode` varchar(20) DEFAULT 'Letter',
  PRIMARY KEY (`enrollment_id`),
  KEY `student_id` (`student_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollment`
--

LOCK TABLES `enrollment` WRITE;
/*!40000 ALTER TABLE `enrollment` DISABLE KEYS */;
INSERT INTO `enrollment` VALUES (1,'CS2023001',1,'2025-08-15','Enrolled','Letter'),(2,'CS2023002',1,'2025-08-15','Enrolled','Letter'),(3,'CS2023003',1,'2025-08-15','Enrolled','Letter'),(4,'CS2023004',1,'2025-08-15','Enrolled','Letter'),(5,'CS2023005',1,'2025-08-15','Enrolled','Letter'),(6,'CS2023006',1,'2025-08-15','Enrolled','Letter'),(7,'CS2023007',1,'2025-08-15','Enrolled','Letter'),(8,'CS2023008',1,'2025-08-15','Enrolled','Letter'),(9,'CS2023009',1,'2025-08-15','Enrolled','Letter'),(10,'CS2023010',1,'2025-08-15','Enrolled','Letter'),(11,'CS2023011',1,'2025-08-15','Enrolled','Letter'),(12,'CS2023012',1,'2025-08-15','Enrolled','Letter'),(13,'CS2023013',1,'2025-08-15','Enrolled','Letter'),(14,'CS2023014',1,'2025-08-15','Enrolled','Letter'),(15,'CS2023015',1,'2025-08-15','Enrolled','Letter'),(16,'CS2023016',1,'2025-08-15','Enrolled','Letter'),(17,'CS2023017',1,'2025-08-15','Enrolled','Letter'),(18,'CS2023018',1,'2025-08-15','Enrolled','Letter'),(19,'CS2023019',1,'2025-08-15','Enrolled','Letter'),(20,'CS2023020',1,'2025-08-15','Enrolled','Letter'),(21,'IT2023001',2,'2025-08-15','Enrolled','Letter'),(22,'IT2023002',2,'2025-08-15','Enrolled','Letter'),(23,'IT2023003',2,'2025-08-15','Enrolled','Letter'),(24,'IT2023004',2,'2025-08-15','Enrolled','Letter'),(25,'IT2023005',2,'2025-08-15','Enrolled','Letter'),(26,'IT2023006',2,'2025-08-15','Enrolled','Letter'),(27,'IT2023007',2,'2025-08-15','Enrolled','Letter'),(28,'IT2023008',2,'2025-08-15','Enrolled','Letter'),(29,'IT2023009',2,'2025-08-15','Enrolled','Letter'),(30,'IT2023010',2,'2025-08-15','Enrolled','Letter'),(31,'IT2023011',2,'2025-08-15','Enrolled','Letter'),(32,'IT2023012',2,'2025-08-15','Enrolled','Letter'),(33,'IT2023013',2,'2025-08-15','Enrolled','Letter'),(34,'IT2023014',2,'2025-08-15','Enrolled','Letter'),(35,'IT2023015',2,'2025-08-15','Enrolled','Letter');
/*!40000 ALTER TABLE `enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `faculty_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`faculty_id`),
  UNIQUE KEY `email` (`email`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `faculty_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES (1,'Dr. John','Smith','Professor','john.smith@college.edu','9876543210',1),(2,'Dr. Jane','Doe','Associate Professor','jane.doe@college.edu','9876543211',1),(3,'Dr. Robert','Johnson','Assistant Professor','robert.j@college.edu','9876543212',2),(4,'Dr. Sarah','Wilson','Professor','sarah.w@college.edu','9876543213',3),(5,'Dr. Mike','Davis','Associate Professor','mike.d@college.edu','9876543214',1),(6,'manoj','manoj','Professor','manoj@gmail.com',NULL,3),(8,'manoj','manoj','Assistant Professor','manoj12@gmail.com',NULL,4);
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program`
--

DROP TABLE IF EXISTS `program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program` (
  `program_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`program_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `program_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program`
--

LOCK TABLES `program` WRITE;
/*!40000 ALTER TABLE `program` DISABLE KEYS */;
INSERT INTO `program` VALUES (1,'B.Tech Computer Science','Undergraduate',1),(2,'B.Tech Information Technology','Undergraduate',2),(3,'B.Tech AI & Data Science','Undergraduate',3),(4,'M.Tech Computer Science','Postgraduate',1),(5,'M.Tech AI & Data Science','Postgraduate',3);
/*!40000 ALTER TABLE `program` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `score`
--

DROP TABLE IF EXISTS `score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score` (
  `score_id` int NOT NULL AUTO_INCREMENT,
  `assessment_id` int DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`score_id`),
  KEY `assessment_id` (`assessment_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `score_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessment` (`assessment_id`),
  CONSTRAINT `score_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score`
--

LOCK TABLES `score` WRITE;
/*!40000 ALTER TABLE `score` DISABLE KEYS */;
/*!40000 ALTER TABLE `score` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `section`
--

DROP TABLE IF EXISTS `section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `section` (
  `section_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `section_no` varchar(10) DEFAULT NULL,
  `capacity` int DEFAULT '60',
  `faculty_id` int DEFAULT NULL,
  PRIMARY KEY (`section_id`),
  KEY `course_id` (`course_id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `section_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `section_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `section`
--

LOCK TABLES `section` WRITE;
/*!40000 ALTER TABLE `section` DISABLE KEYS */;
INSERT INTO `section` VALUES (1,1,'Fall',2025,'A',60,1),(2,2,'Fall',2025,'B',45,3),(3,3,'Fall',2025,'A',55,2),(4,4,'Spring',2025,'A',50,4),(5,5,'Fall',2025,'C',40,5);
/*!40000 ALTER TABLE `section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `admission_year` int DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `program_id` int DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('24BAD010','rahul','prasad',NULL,NULL,'rahul@gmail.com',NULL,NULL,NULL,'active',1),('24BAD072','Mohamed','Aaashik','2007-07-24','Male','mohamed@gmail.com','9894580287','',2025,'Active',NULL),('24BAD090','praveen','kumar',NULL,NULL,'praveen@gmail.com',NULL,NULL,NULL,'active',3),('24BAD091','midhun','kumar',NULL,NULL,'midhun@gmail.com',NULL,NULL,NULL,'active',NULL),('24BAD100','JOHN','M','2006-07-24','Male','ROHIT@gmail.com','79857967287597','uuaehrsfhaehruuae',2025,'Active',3),('24bad999','rithish','kumar',NULL,NULL,'rithish@gmail.com',NULL,NULL,NULL,'active',3),('24BIT119','Nagella','advik',NULL,NULL,'adik@gmail.com',NULL,NULL,NULL,'active',1),('AI2023001','AIStudent1','AI1','2005-02-02','Female','ai.student1@college.edu','9876545211','1 Pine Road, Coimbatore',2023,'Active',3),('AI2023002','AIStudent2','AI2','2004-03-03','Male','ai.student2@college.edu','9876545212','2 Pine Road, Coimbatore',2023,'Active',3),('AI2023003','AIStudent3','AI3','2005-04-04','Female','ai.student3@college.edu','9876545213','3 Pine Road, Coimbatore',2023,'Active',3),('AI2023004','AIStudent4','AI4','2004-05-05','Male','ai.student4@college.edu','9876545214','4 Pine Road, Coimbatore',2023,'Active',3),('AI2023005','AIStudent5','AI5','2005-06-06','Female','ai.student5@college.edu','9876545215','5 Pine Road, Coimbatore',2023,'Active',3),('AI2023006','AIStudent6','AI6','2004-07-07','Male','ai.student6@college.edu','9876545216','6 Pine Road, Coimbatore',2023,'Active',3),('AI2023007','AIStudent7','AI7','2005-08-08','Female','ai.student7@college.edu','9876545217','7 Pine Road, Coimbatore',2023,'Active',3),('AI2023008','AIStudent8','AI8','2004-09-09','Male','ai.student8@college.edu','9876545218','8 Pine Road, Coimbatore',2023,'Active',3),('AI2023009','AIStudent9','AI9','2005-10-10','Female','ai.student9@college.edu','9876545219','9 Pine Road, Coimbatore',2023,'Active',3),('AI2023010','AIStudent10','AI10','2004-11-11','Male','ai.student10@college.edu','9876545220','10 Pine Road, Coimbatore',2023,'Active',3),('AI2023011','AIStudent11','AI11','2005-12-12','Female','ai.student11@college.edu','9876545221','11 Pine Road, Coimbatore',2023,'Active',3),('AI2023012','AIStudent12','AI12','2004-01-13','Male','ai.student12@college.edu','9876545222','12 Pine Road, Coimbatore',2023,'Active',3),('AI2023013','AIStudent13','AI13','2005-02-14','Female','ai.student13@college.edu','9876545223','13 Pine Road, Coimbatore',2023,'Active',3),('AI2023014','AIStudent14','AI14','2004-03-15','Male','ai.student14@college.edu','9876545224','14 Pine Road, Coimbatore',2023,'Active',3),('AI2023015','AIStudent15','AI15','2005-04-16','Female','ai.student15@college.edu','9876545225','15 Pine Road, Coimbatore',2023,'Active',3),('AI2023016','AIStudent16','AI16','2004-05-17','Male','ai.student16@college.edu','9876545226','16 Pine Road, Coimbatore',2023,'Active',3),('AI2023017','AIStudent17','AI17','2005-06-18','Female','ai.student17@college.edu','9876545227','17 Pine Road, Coimbatore',2023,'Active',3),('AI2023018','AIStudent18','AI18','2004-07-19','Male','ai.student18@college.edu','9876545228','18 Pine Road, Coimbatore',2023,'Active',3),('AI2023019','AIStudent19','AI19','2005-08-20','Female','ai.student19@college.edu','9876545229','19 Pine Road, Coimbatore',2023,'Active',3),('AI2023020','AIStudent20','AI20','2004-09-21','Male','ai.student20@college.edu','9876545230','20 Pine Road, Coimbatore',2023,'Active',3),('AI2023021','AIStudent21','AI21','2005-10-22','Female','ai.student21@college.edu','9876545231','21 Pine Road, Coimbatore',2023,'Active',3),('AI2023022','AIStudent22','AI22','2004-11-23','Male','ai.student22@college.edu','9876545232','22 Pine Road, Coimbatore',2023,'Active',3),('AI2023023','AIStudent23','AI23','2005-12-24','Female','ai.student23@college.edu','9876545233','23 Pine Road, Coimbatore',2023,'Active',3),('AI2023024','AIStudent24','AI24','2004-01-25','Male','ai.student24@college.edu','9876545234','24 Pine Road, Coimbatore',2023,'Active',3),('AI2023025','AIStudent25','AI25','2005-02-26','Female','ai.student25@college.edu','9876545235','25 Pine Road, Coimbatore',2023,'Active',3),('AI2023026','AIStudent26','AI26','2004-03-27','Male','ai.student26@college.edu','9876545236','26 Pine Road, Coimbatore',2023,'Active',3),('AI2023027','AIStudent27','AI27','2005-04-28','Female','ai.student27@college.edu','9876545237','27 Pine Road, Coimbatore',2023,'Active',3),('AI2023028','AIStudent28','AI28','2004-05-01','Male','ai.student28@college.edu','9876545238','28 Pine Road, Coimbatore',2023,'Active',3),('AI2023029','AIStudent29','AI29','2005-06-02','Female','ai.student29@college.edu','9876545239','29 Pine Road, Coimbatore',2023,'Active',3),('AI2023030','AIStudent30','AI30','2004-07-03','Male','ai.student30@college.edu','9876545240','30 Pine Road, Coimbatore',2023,'Active',3),('AI2023031','AIStudent31','AI31','2005-08-04','Female','ai.student31@college.edu','9876545241','31 Pine Road, Coimbatore',2023,'Active',3),('AI2023032','AIStudent32','AI32','2004-09-05','Male','ai.student32@college.edu','9876545242','32 Pine Road, Coimbatore',2023,'Active',3),('AI2023033','AIStudent33','AI33','2005-10-06','Female','ai.student33@college.edu','9876545243','33 Pine Road, Coimbatore',2023,'Active',3),('AI2023034','AIStudent34','AI34','2004-11-07','Male','ai.student34@college.edu','9876545244','34 Pine Road, Coimbatore',2023,'Active',3),('CS2023001','Student1','CS1','2005-02-02','Male','cs.student1@college.edu','9876543211','1 Main Street, Coimbatore',2023,'Active',1),('CS2023002','Student2','CS2','2004-03-03','Female','cs.student2@college.edu','9876543212','2 Main Street, Coimbatore',2023,'Active',1),('CS2023003','Student3','CS3','2005-04-04','Male','cs.student3@college.edu','9876543213','3 Main Street, Coimbatore',2023,'Active',1),('CS2023004','Student4','CS4','2004-05-05','Female','cs.student4@college.edu','9876543214','4 Main Street, Coimbatore',2023,'Active',1),('CS2023005','Student5','CS5','2005-06-06','Male','cs.student5@college.edu','9876543215','5 Main Street, Coimbatore',2023,'Active',1),('CS2023006','Student6','CS6','2004-07-07','Female','cs.student6@college.edu','9876543216','6 Main Street, Coimbatore',2023,'Active',1),('CS2023007','Student7','CS7','2005-08-08','Male','cs.student7@college.edu','9876543217','7 Main Street, Coimbatore',2023,'Active',1),('CS2023008','Student8','CS8','2004-09-09','Female','cs.student8@college.edu','9876543218','8 Main Street, Coimbatore',2023,'Active',1),('CS2023009','Student9','CS9','2005-10-10','Male','cs.student9@college.edu','9876543219','9 Main Street, Coimbatore',2023,'Active',1),('CS2023010','Student10','CS10','2004-11-11','Female','cs.student10@college.edu','9876543220','10 Main Street, Coimbatore',2023,'Active',1),('CS2023011','Student11','CS11','2005-12-12','Male','cs.student11@college.edu','9876543221','11 Main Street, Coimbatore',2023,'Active',1),('CS2023012','Student12','CS12','2004-01-13','Female','cs.student12@college.edu','9876543222','12 Main Street, Coimbatore',2023,'Active',1),('CS2023013','Student13','CS13','2005-02-14','Male','cs.student13@college.edu','9876543223','13 Main Street, Coimbatore',2023,'Active',1),('CS2023014','Student14','CS14','2004-03-15','Female','cs.student14@college.edu','9876543224','14 Main Street, Coimbatore',2023,'Active',1),('CS2023015','Student15','CS15','2005-04-16','Male','cs.student15@college.edu','9876543225','15 Main Street, Coimbatore',2023,'Active',1),('CS2023016','Student16','CS16','2004-05-17','Female','cs.student16@college.edu','9876543226','16 Main Street, Coimbatore',2023,'Active',1),('CS2023017','Student17','CS17','2005-06-18','Male','cs.student17@college.edu','9876543227','17 Main Street, Coimbatore',2023,'Active',1),('CS2023018','Student18','CS18','2004-07-19','Female','cs.student18@college.edu','9876543228','18 Main Street, Coimbatore',2023,'Active',1),('CS2023019','Student19','CS19','2005-08-20','Male','cs.student19@college.edu','9876543229','19 Main Street, Coimbatore',2023,'Active',1),('CS2023020','Student20','CS20','2004-09-21','Female','cs.student20@college.edu','9876543230','20 Main Street, Coimbatore',2023,'Active',1),('CS2023021','Student21','CS21','2005-10-22','Male','cs.student21@college.edu','9876543231','21 Main Street, Coimbatore',2023,'Active',1),('CS2023022','Student22','CS22','2004-11-23','Female','cs.student22@college.edu','9876543232','22 Main Street, Coimbatore',2023,'Active',1),('CS2023023','Student23','CS23','2005-12-24','Male','cs.student23@college.edu','9876543233','23 Main Street, Coimbatore',2023,'Active',1),('CS2023024','Student24','CS24','2004-01-25','Female','cs.student24@college.edu','9876543234','24 Main Street, Coimbatore',2023,'Active',1),('CS2023025','Student25','CS25','2005-02-26','Male','cs.student25@college.edu','9876543235','25 Main Street, Coimbatore',2023,'Active',1),('CS2023026','Student26','CS26','2004-03-27','Female','cs.student26@college.edu','9876543236','26 Main Street, Coimbatore',2023,'Active',1),('CS2023027','Student27','CS27','2005-04-28','Male','cs.student27@college.edu','9876543237','27 Main Street, Coimbatore',2023,'Active',1),('CS2023028','Student28','CS28','2004-05-01','Female','cs.student28@college.edu','9876543238','28 Main Street, Coimbatore',2023,'Active',1),('CS2023029','Student29','CS29','2005-06-02','Male','cs.student29@college.edu','9876543239','29 Main Street, Coimbatore',2023,'Active',1),('CS2023030','Student30','CS30','2004-07-03','Female','cs.student30@college.edu','9876543240','30 Main Street, Coimbatore',2023,'Active',1),('CS2023031','Student31','CS31','2005-08-04','Male','cs.student31@college.edu','9876543241','31 Main Street, Coimbatore',2023,'Active',1),('CS2023032','Student32','CS32','2004-09-05','Female','cs.student32@college.edu','9876543242','32 Main Street, Coimbatore',2023,'Active',1),('CS2023033','Student33','CS33','2005-10-06','Male','cs.student33@college.edu','9876543243','33 Main Street, Coimbatore',2023,'Active',1),('CS2023034','Student34','CS34','2004-11-07','Female','cs.student34@college.edu','9876543244','34 Main Street, Coimbatore',2023,'Active',1),('hggggm','jhghjv','jh','2025-09-01','Male','midhun0770@outlook.com','09489535076','ggfytthgcytdfgcv',2025,'Active',NULL),('IT2023001','ITStudent1','IT1','2005-02-02','Male','it.student1@college.edu','9876544211','1 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023002','ITStudent2','IT2','2004-03-03','Female','it.student2@college.edu','9876544212','2 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023003','ITStudent3','IT3','2005-04-04','Female','it.student3@college.edu','9876544213','3 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023004','ITStudent4','IT4','2004-05-05','Male','it.student4@college.edu','9876544214','4 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023005','ITStudent5','IT5','2005-06-06','Female','it.student5@college.edu','9876544215','5 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023006','ITStudent6','IT6','2004-07-07','Female','it.student6@college.edu','9876544216','6 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023007','ITStudent7','IT7','2005-08-08','Male','it.student7@college.edu','9876544217','7 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023008','ITStudent8','IT8','2004-09-09','Female','it.student8@college.edu','9876544218','8 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023009','ITStudent9','IT9','2005-10-10','Female','it.student9@college.edu','9876544219','9 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023010','ITStudent10','IT10','2004-11-11','Male','it.student10@college.edu','9876544220','10 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023011','ITStudent11','IT11','2005-12-12','Female','it.student11@college.edu','9876544221','11 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023012','ITStudent12','IT12','2004-01-13','Female','it.student12@college.edu','9876544222','12 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023013','ITStudent13','IT13','2005-02-14','Male','it.student13@college.edu','9876544223','13 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023014','ITStudent14','IT14','2004-03-15','Female','it.student14@college.edu','9876544224','14 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023015','ITStudent15','IT15','2005-04-16','Female','it.student15@college.edu','9876544225','15 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023016','ITStudent16','IT16','2004-05-17','Male','it.student16@college.edu','9876544226','16 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023017','ITStudent17','IT17','2005-06-18','Female','it.student17@college.edu','9876544227','17 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023018','ITStudent18','IT18','2004-07-19','Female','it.student18@college.edu','9876544228','18 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023019','ITStudent19','IT19','2005-08-20','Male','it.student19@college.edu','9876544229','19 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023020','ITStudent20','IT20','2004-09-21','Female','it.student20@college.edu','9876544230','20 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023021','ITStudent21','IT21','2005-10-22','Female','it.student21@college.edu','9876544231','21 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023022','ITStudent22','IT22','2004-11-23','Male','it.student22@college.edu','9876544232','22 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023023','ITStudent23','IT23','2005-12-24','Female','it.student23@college.edu','9876544233','23 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023024','ITStudent24','IT24','2004-01-25','Female','it.student24@college.edu','9876544234','24 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023025','ITStudent25','IT25','2005-02-26','Male','it.student25@college.edu','9876544235','25 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023026','ITStudent26','IT26','2004-03-27','Female','it.student26@college.edu','9876544236','26 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023027','ITStudent27','IT27','2005-04-28','Female','it.student27@college.edu','9876544237','27 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023028','ITStudent28','IT28','2004-05-01','Male','it.student28@college.edu','9876544238','28 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023029','ITStudent29','IT29','2005-06-02','Female','it.student29@college.edu','9876544239','29 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023030','ITStudent30','IT30','2004-07-03','Female','it.student30@college.edu','9876544240','30 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023031','ITStudent31','IT31','2005-08-04','Male','it.student31@college.edu','9876544241','31 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023032','ITStudent32','IT32','2004-09-05','Female','it.student32@college.edu','9876544242','32 Oak Avenue, Coimbatore',2023,'Active',2),('IT2023033','ITStudent33','IT33','2005-10-06','Female','it.student33@college.edu','9876544243','33 Oak Avenue, Coimbatore',2023,'Active',2);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` int NOT NULL,
  `course_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(64) DEFAULT NULL,
  `section` varchar(64) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_faculty_day` (`faculty_id`,`day_of_week`,`start_time`),
  KEY `fk_tt_course` (`course_id`),
  CONSTRAINT `fk_tt_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable`
--

LOCK TABLES `timetable` WRITE;
/*!40000 ALTER TABLE `timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `useraccount`
--

DROP TABLE IF EXISTS `useraccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `useraccount` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `person_type` varchar(20) DEFAULT NULL,
  `linked_person_id` varchar(20) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `useraccount`
--

LOCK TABLES `useraccount` WRITE;
/*!40000 ALTER TABLE `useraccount` DISABLE KEYS */;
INSERT INTO `useraccount` VALUES (1,'student@college.edu','$2b$10$E9pP8JZQ8q8w6x8W/.hVz.4Y.kH6./Q6z5W0G5k8W/.f9zYk3z8K.',1,'student','CS2023001',NULL),(2,'faculty@college.edu','$2b$10$E9pP8JZQ8q8w6x8W/.hVz.4Y.kH6./Q6z5W0G5k8W/.f9zYk3z8K.',1,'faculty','F001',NULL),(3,'admin@college.edu','$2b$10$E9pP8JZQ8q8w6x8W/.hVz.4Y.kH6./Q6z5W0G5k8W/.f9zYk3z8K.',1,'admin','A001',NULL);
/*!40000 ALTER TABLE `useraccount` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-02 14:20:33
