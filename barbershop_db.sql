-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for barbershop_db
CREATE DATABASE IF NOT EXISTS `barbershop_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `barbershop_db`;

-- Dumping structure for table barbershop_db.access_logs
CREATE TABLE IF NOT EXISTS `access_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `access_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `access_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.access_logs: ~0 rows (approximately)
INSERT INTO `access_logs` (`id`, `user_id`, `method`, `path`, `ip`, `user_agent`, `created_at`, `updated_at`) VALUES
	(1, 1, 'GET', '/test', '127.0.0.1', 'Manual test', '2025-11-29 02:39:42', '2025-11-29 02:39:42');

-- Dumping structure for table barbershop_db.announcements
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `target_role` enum('all','admin','barber','customer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.announcements: ~2 rows (approximately)
INSERT INTO `announcements` (`id`, `title`, `content`, `starts_at`, `ends_at`, `target_role`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Test', 'Test', NULL, NULL, 'all', 0, '2025-11-25 01:59:00', '2025-11-25 01:59:02'),
	(3, 'Test', 'Halo', NULL, NULL, 'all', 0, '2025-11-28 03:21:03', '2025-11-28 20:34:43');

-- Dumping structure for table barbershop_db.barbers
CREATE TABLE IF NOT EXISTS `barbers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `skill_level` enum('junior','senior','master') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'junior',
  `base_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `avg_rating` double NOT NULL DEFAULT '0',
  `total_reviews` int unsigned NOT NULL DEFAULT '0',
  `total_completed_orders` int unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barbers_user_id_foreign` (`user_id`),
  CONSTRAINT `barbers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.barbers: ~4 rows (approximately)
INSERT INTO `barbers` (`id`, `user_id`, `display_name`, `bio`, `skill_level`, `base_price`, `avg_rating`, `total_reviews`, `total_completed_orders`, `is_active`, `created_at`, `updated_at`) VALUES
	(3, 10, 'Sofyan', NULL, 'junior', 20000.00, 0, 0, 0, 1, '2025-11-25 05:32:47', '2025-11-25 05:32:47'),
	(4, 11, 'Rusdi', NULL, 'junior', 25000.00, 0, 0, 0, 1, '2025-11-25 05:34:53', '2025-11-25 05:34:53'),
	(5, 12, 'Arifin', NULL, 'junior', 40000.00, 0, 0, 0, 1, '2025-11-25 05:35:34', '2025-11-25 05:35:34'),
	(6, 13, 'Dafi', NULL, 'junior', 27000.00, 0, 0, 0, 1, '2025-11-25 05:36:48', '2025-11-25 05:36:48');

-- Dumping structure for table barbershop_db.bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `barber_id` bigint unsigned NOT NULL,
  `service_id` bigint unsigned NOT NULL,
  `hairstyle_id` bigint unsigned DEFAULT NULL,
  `queue_number` int unsigned NOT NULL,
  `booking_date` date NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `status` enum('waiting','in_progress','done','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting',
  `total_price` decimal(10,2) NOT NULL,
  `coupon_id` bigint unsigned DEFAULT NULL,
  `payment_status` enum('unpaid','pending','paid','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `finished_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_customer_id_foreign` (`customer_id`),
  KEY `bookings_barber_id_foreign` (`barber_id`),
  KEY `bookings_service_id_foreign` (`service_id`),
  KEY `bookings_hairstyle_id_foreign` (`hairstyle_id`),
  KEY `bookings_coupon_id_foreign` (`coupon_id`),
  KEY `bookings_booking_date_queue_number_index` (`booking_date`,`queue_number`),
  CONSTRAINT `bookings_barber_id_foreign` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_hairstyle_id_foreign` FOREIGN KEY (`hairstyle_id`) REFERENCES `hairstyles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.bookings: ~4 rows (approximately)
INSERT INTO `bookings` (`id`, `customer_id`, `barber_id`, `service_id`, `hairstyle_id`, `queue_number`, `booking_date`, `scheduled_at`, `status`, `total_price`, `coupon_id`, `payment_status`, `finished_at`, `created_at`, `updated_at`) VALUES
	(1, 14, 5, 1, NULL, 1, '2025-11-26', '2025-11-26 17:32:00', 'waiting', 10000.00, NULL, 'pending', NULL, '2025-11-25 06:32:20', '2025-11-25 10:40:46'),
	(2, 15, 4, 1, NULL, 1, '2025-11-27', '2025-11-27 10:00:00', 'waiting', 10000.00, NULL, 'pending', NULL, '2025-11-26 06:55:42', '2025-11-26 06:56:06'),
	(3, 16, 5, 1, NULL, 2, '2025-11-27', '2025-11-27 10:00:00', 'waiting', 10000.00, NULL, 'pending', NULL, '2025-11-26 07:48:59', '2025-11-26 07:49:08'),
	(4, 15, 4, 1, NULL, 1, '2025-12-02', '2025-12-02 10:20:00', 'waiting', 10000.00, NULL, 'paid', NULL, '2025-11-29 20:20:49', '2025-11-30 17:30:46'),
	(5, 17, 4, 1, NULL, 2, '2025-12-02', '2025-12-02 10:00:00', 'waiting', 10000.00, NULL, 'paid', NULL, '2025-11-30 17:45:50', '2025-11-30 17:46:24');

-- Dumping structure for table barbershop_db.business_hours
CREATE TABLE IF NOT EXISTS `business_hours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `day_of_week` tinyint unsigned NOT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `is_override` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_hours_day_of_week_unique` (`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.business_hours: ~7 rows (approximately)
INSERT INTO `business_hours` (`id`, `day_of_week`, `open_time`, `close_time`, `is_closed`, `is_override`, `created_at`, `updated_at`) VALUES
	(1, 0, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 07:22:58'),
	(2, 1, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 06:50:21'),
	(3, 2, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 06:50:21'),
	(4, 3, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 06:50:21'),
	(5, 4, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 06:50:21'),
	(6, 5, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 06:50:21'),
	(7, 6, '07:00:00', '21:00:00', 0, 0, '2025-11-24 19:21:45', '2025-11-28 06:50:21');

-- Dumping structure for table barbershop_db.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.cache: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.cache_locks: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.coupons
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_percent` tinyint unsigned NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `used_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `issued_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`),
  KEY `coupons_user_id_foreign` (`user_id`),
  CONSTRAINT `coupons_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.coupons: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.cs_messages
CREATE TABLE IF NOT EXISTS `cs_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ticket_id` bigint unsigned NOT NULL,
  `sender_id` bigint unsigned NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cs_messages_ticket_id_foreign` (`ticket_id`),
  KEY `cs_messages_sender_id_foreign` (`sender_id`),
  CONSTRAINT `cs_messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cs_messages_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `cs_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.cs_messages: ~7 rows (approximately)
INSERT INTO `cs_messages` (`id`, `ticket_id`, `sender_id`, `message`, `created_at`, `updated_at`) VALUES
	(3, 2, 15, 'tes', '2025-11-26 05:47:36', '2025-11-26 05:47:36'),
	(4, 2, 15, 'halo', '2025-11-26 05:49:48', '2025-11-26 05:49:48'),
	(5, 3, 15, 'tes', '2025-11-26 06:00:38', '2025-11-26 06:00:38'),
	(6, 3, 1, 'iya', '2025-11-26 19:36:46', '2025-11-26 19:36:46'),
	(7, 2, 1, 'iya', '2025-11-28 03:58:24', '2025-11-28 03:58:24'),
	(8, 4, 15, 'potong bebek', '2025-11-29 20:22:02', '2025-11-29 20:22:02'),
	(9, 4, 1, 'iya', '2025-11-29 20:23:16', '2025-11-29 20:23:16');

-- Dumping structure for table barbershop_db.cs_tickets
CREATE TABLE IF NOT EXISTS `cs_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `admin_id` bigint unsigned DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('open','answered','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cs_tickets_user_id_foreign` (`user_id`),
  KEY `cs_tickets_admin_id_foreign` (`admin_id`),
  CONSTRAINT `cs_tickets_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cs_tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.cs_tickets: ~3 rows (approximately)
INSERT INTO `cs_tickets` (`id`, `user_id`, `admin_id`, `subject`, `status`, `created_at`, `updated_at`) VALUES
	(2, 15, 1, 'tes', 'answered', '2025-11-26 05:47:36', '2025-11-28 03:58:24'),
	(3, 15, 1, 'tes2', 'answered', '2025-11-26 06:00:38', '2025-11-26 19:36:46'),
	(4, 15, 1, 'komplen', 'answered', '2025-11-29 20:22:01', '2025-11-29 20:23:16');

-- Dumping structure for table barbershop_db.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.hairstyles
CREATE TABLE IF NOT EXISTS `hairstyles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `default_service_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hairstyles_default_service_id_foreign` (`default_service_id`),
  CONSTRAINT `hairstyles_default_service_id_foreign` FOREIGN KEY (`default_service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.hairstyles: ~8 rows (approximately)
INSERT INTO `hairstyles` (`id`, `name`, `image_url`, `description`, `default_service_id`, `created_at`, `updated_at`) VALUES
	(3, 'Taper Fade', 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Low_Taper_Fade_Fluffy_Hair.png?v=1747859628', 'Potongan rambut bagus', 1, '2025-11-25 06:31:13', '2025-11-25 06:31:13'),
	(4, 'Comma Hair', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwMMMapF4cvNHoqA5B-RofjEx2v3w9Fw0SIQ&s', NULL, NULL, '2025-11-27 20:00:16', '2025-11-27 20:00:16'),
	(5, 'Wolf Cut', 'https://i.pinimg.com/736x/40/06/15/4006152c4e17fc3a5b679cea9d2c7bd3.jpg', NULL, NULL, '2025-11-27 20:03:12', '2025-11-27 20:03:12'),
	(6, 'Buzz Cut', 'https://images.squarespace-cdn.com/content/v1/5702abebd210b8e9fd0df564/6b8edcd5-e0d1-4b2a-8140-230e73725f6b/Swanky-Malone-Buzz-Cut-high-and-tight.jpg', NULL, NULL, '2025-11-27 20:04:36', '2025-11-27 20:04:36'),
	(7, 'Pompadour', 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Short-Pompadour.webp?v=1754905431', NULL, NULL, '2025-11-27 20:06:48', '2025-11-27 20:06:48'),
	(8, 'Quiff', 'https://cdn.shopify.com/s/files/1/0899/2676/2789/files/Quiff_Fade.jpg?v=1746561101', NULL, NULL, '2025-11-27 20:08:22', '2025-11-27 20:08:22'),
	(9, 'Fringe', 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Messy_Textured_Fringe.png?v=1748032612', NULL, NULL, '2025-11-27 20:09:10', '2025-11-27 20:09:10'),
	(10, 'Mullet Cut', 'https://cdn.shopify.com/s/files/1/0613/6292/9724/files/The_Mullet_Haircut_A_Bold_Comeback_in_New_York_City_1.webp?v=1743268851', NULL, NULL, '2025-11-27 20:10:15', '2025-11-27 20:10:15');

-- Dumping structure for table barbershop_db.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.jobs: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.job_batches: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.migrations: ~20 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '0001_01_01_000003_create_personal_access_tokens_table', 1),
	(5, '0001_01_01_000004_create_services_table', 1),
	(6, '0001_01_01_000005_create_barbers_table', 1),
	(7, '0001_01_01_000006_create_coupons_table', 1),
	(8, '0001_01_01_000007_create_hairstyles_table', 1),
	(9, '0001_01_01_000008_create_bookings_table', 1),
	(10, '0001_01_01_000009_create_reviews_table', 1),
	(11, '0001_01_01_000010_create_payments_table', 1),
	(12, '0001_01_01_000011_create_announcements_table', 1),
	(13, '0001_01_01_000012_create_cs_tickets_table', 1),
	(14, '0001_01_01_000013_create_cs_messages_table', 1),
	(15, '0001_01_01_000014_create_promos_table', 1),
	(16, '0001_01_01_000015_create_business_hours_table', 1),
	(17, '0001_01_01_000016_create_access_logs_table', 1),
	(18, '0001_01_01_000017_create_sessions_table', 1),
	(19, '0001_01_01_000018_alter_image_url_length_on_hairstyles', 2),
	(20, '0001_01_01_000019_create_payouts_table', 3),
	(21, '0001_01_01_000020_add_is_override_to_business_hours_table', 4);

-- Dumping structure for table barbershop_db.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `midtrans_order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gross_amount` decimal(10,2) NOT NULL,
  `transaction_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `transaction_time` datetime DEFAULT NULL,
  `fraud_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `snap_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_midtrans_order_id_unique` (`midtrans_order_id`),
  KEY `payments_booking_id_foreign` (`booking_id`),
  CONSTRAINT `payments_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.payments: ~8 rows (approximately)
INSERT INTO `payments` (`id`, `booking_id`, `midtrans_order_id`, `payment_type`, `gross_amount`, `transaction_status`, `transaction_time`, `fraud_status`, `snap_token`, `raw_response`, `created_at`, `updated_at`) VALUES
	(17, 2, 'BOOK-2-1764416302', NULL, 10000.00, 'pending', NULL, NULL, '4ce66e1e-9e1e-4d07-bd12-00af316f12f9', NULL, '2025-11-29 04:38:23', '2025-11-29 04:38:23'),
	(18, 2, 'BOOK-2-1764416442', NULL, 10000.00, 'pending', NULL, NULL, '7477dad5-40c5-4aed-bb8f-356e813ca385', NULL, '2025-11-29 04:40:43', '2025-11-29 04:40:43'),
	(19, 2, 'BOOK-2-1764416552', NULL, 10000.00, 'pending', NULL, NULL, '9b12930e-c21a-48bb-bf81-fd00c095acfe', NULL, '2025-11-29 04:42:32', '2025-11-29 04:42:32'),
	(20, 4, 'BOOK-4-1764472856', NULL, 10000.00, 'pending', NULL, NULL, 'bacc27e8-5107-4fe9-b78c-cf26361bd68c', NULL, '2025-11-29 20:20:58', '2025-11-29 20:20:58'),
	(21, 4, 'BOOK-4-1764545673', NULL, 10000.00, 'pending', NULL, NULL, '35fd96c7-affb-4b47-9d51-fc490eabf492', NULL, '2025-11-30 16:34:34', '2025-11-30 16:34:34'),
	(22, 4, 'BOOK-4-1764545771', NULL, 10000.00, 'pending', NULL, NULL, '6a36a881-78c8-48bc-bd95-28dab0a54d4a', NULL, '2025-11-30 16:36:11', '2025-11-30 16:36:11'),
	(23, 4, 'BOOK-4-1764546832', NULL, 10000.00, 'pending', NULL, NULL, '908fd7e1-2d47-43fe-a688-8f01c8848302', NULL, '2025-11-30 16:53:53', '2025-11-30 16:53:53'),
	(24, 4, 'BOOK-4-1764549016', 'qris', 10000.00, 'settlement', '2025-12-01 07:30:20', 'accept', 'c1a80822-0078-4117-88ab-97bfdba356f9', '{"issuer": "gopay", "acquirer": "gopay", "currency": "IDR", "order_id": "BOOK-4-1764549016", "expiry_time": "2025-12-01 07:45:20", "merchant_id": "G406449669", "status_code": "200", "fraud_status": "accept", "gross_amount": "10000.00", "payment_type": "qris", "signature_key": "58f77159990be19de400af9e74857fd3237d4a3b9415f8f99e707b1cb0b953983de2455ac60533deb4db603a0a73f36a2d397f8c6cccc0a3f0191178e30d20e4", "status_message": "Success, transaction is found", "transaction_id": "76fee131-3908-4611-bafe-a35caf8643fe", "settlement_time": "2025-12-01 07:30:34", "transaction_time": "2025-12-01 07:30:20", "transaction_type": "on-us", "transaction_status": "settlement"}', '2025-11-30 17:30:16', '2025-11-30 17:30:46'),
	(25, 5, 'BOOK-5-1764549956', 'qris', 10000.00, 'settlement', '2025-12-01 07:46:01', 'accept', 'cebf6668-a6c3-433a-a33f-74aef279f3e7', '{"issuer": "gopay", "acquirer": "gopay", "currency": "IDR", "order_id": "BOOK-5-1764549956", "expiry_time": "2025-12-01 08:01:00", "merchant_id": "G406449669", "status_code": "200", "fraud_status": "accept", "gross_amount": "10000.00", "payment_type": "qris", "signature_key": "06830d6063f91fc759857db6667e38d58307c7e1dc7ffccf3940b54acfb8ba081b7c4bbca298e46e8c031abfcb4d4677c5594cd2cdae7ffd804863e5b381c36b", "status_message": "Success, transaction is found", "transaction_id": "80873211-458f-4281-b8b7-3d4809211405", "settlement_time": "2025-12-01 07:46:18", "transaction_time": "2025-12-01 07:46:01", "transaction_type": "on-us", "transaction_status": "settlement"}', '2025-11-30 17:45:57', '2025-11-30 17:46:24');

-- Dumping structure for table barbershop_db.payouts
CREATE TABLE IF NOT EXISTS `payouts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barber_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `channel` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `requested_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payouts_barber_id_foreign` (`barber_id`),
  CONSTRAINT `payouts_barber_id_foreign` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.payouts: ~1 rows (approximately)

-- Dumping structure for table barbershop_db.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.personal_access_tokens: ~17 rows (approximately)
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(2, 'App\\Models\\User', 2, 'auth_token', '768ebe0a021667e45b46e5c1de27eed1d4204699785a77c5a5220eefad3cc896', '["*"]', '2025-11-24 23:15:22', NULL, '2025-11-24 23:15:11', '2025-11-24 23:15:22'),
	(5, 'App\\Models\\User', 4, 'auth_token', '6ff1977fc83b8c0077c081babd7778abebcf6db5bb77832c26ca52df72ed0569', '["*"]', NULL, NULL, '2025-11-24 23:32:48', '2025-11-24 23:32:48'),
	(8, 'App\\Models\\User', 2, 'auth_token', 'bae00d8fec8677db9abf8255a919539b122ba3a08d11ee4564e8917de7105f2b', '["*"]', '2025-11-24 23:35:48', NULL, '2025-11-24 23:35:31', '2025-11-24 23:35:48'),
	(14, 'App\\Models\\User', 5, 'auth_token', 'f11d3bc14f34da97e7ae2bb1ea618a17b0655ecb5f864efcc64dc43ca537fa63', '["*"]', NULL, NULL, '2025-11-25 01:21:51', '2025-11-25 01:21:51'),
	(26, 'App\\Models\\User', 1, 'auth_token', 'a251dd8d38f21c266072d1287568004fd6ba092699ecc0b7d321698dbfacb6b0', '["*"]', '2025-11-25 09:06:54', NULL, '2025-11-25 06:58:51', '2025-11-25 09:06:54'),
	(28, 'App\\Models\\User', 14, 'auth_token', 'd1ef1f9d02c539a42b5edb9f55533d45a496a487a5df47466d9ba47a60f53709', '["*"]', '2025-11-25 10:42:20', NULL, '2025-11-25 09:07:49', '2025-11-25 10:42:20'),
	(31, 'App\\Models\\User', 14, 'auth_token', '9839a3f2c516faaabbdd5080435f3b8cfd9af4f0bff355f713de6d6ff4224805', '["*"]', '2025-11-25 11:56:48', NULL, '2025-11-25 11:43:00', '2025-11-25 11:56:48'),
	(34, 'App\\Models\\User', 15, 'auth_token', 'a8c756d0d798c8284aaaf19427eb1984e995a4b77fd9800e8032d5fe1b1a9052', '["*"]', '2025-11-25 18:48:41', NULL, '2025-11-25 17:04:27', '2025-11-25 18:48:41'),
	(35, 'App\\Models\\User', 17, 'auth_token', 'e481454f542468018186760076cd3821253d69000e8c93a93ae903f1d136c968', '["*"]', NULL, NULL, '2025-11-26 05:30:06', '2025-11-26 05:30:06'),
	(40, 'App\\Models\\User', 16, 'auth_token', 'bd2145c28e98a6b782e29c23679bef41fe312a978f7d46ed2d9cfa183bd50858', '["*"]', '2025-11-26 06:10:54', NULL, '2025-11-26 06:07:47', '2025-11-26 06:10:54'),
	(41, 'App\\Models\\User', 16, 'auth_token', '9c101196c69ed3fc135e7f18f6c6234e9e5c4ce7aaa390f225c4ca3b83057487', '["*"]', '2025-11-26 06:46:35', NULL, '2025-11-26 06:16:33', '2025-11-26 06:46:35'),
	(43, 'App\\Models\\User', 15, 'auth_token', 'ca604ca35f8379c892f05edaef5bac7d48708b971369581b02636df5d69b7b3c', '["*"]', '2025-11-26 07:42:50', NULL, '2025-11-26 06:47:19', '2025-11-26 07:42:50'),
	(47, 'App\\Models\\User', 15, 'auth_token', 'ac2d46877fff459804cfc8f9e156e037d0a550c0cb206757065fe9b50d8d8810', '["*"]', '2025-11-26 15:28:59', NULL, '2025-11-26 12:24:17', '2025-11-26 15:28:59'),
	(49, 'App\\Models\\User', 15, 'auth_token', '425d5556206ba5b80c39707efabf1ac9ea0c9c5c2b85a19f9f8111772515e117', '["*"]', '2025-11-26 18:56:21', NULL, '2025-11-26 18:29:55', '2025-11-26 18:56:21'),
	(60, 'App\\Models\\User', 1, 'auth_token', '66c3a89580e1edda85b4b6427071e79eae569f61e8ee93a0f5402a88ca981c85', '["*"]', '2025-11-28 07:22:59', NULL, '2025-11-28 05:58:03', '2025-11-28 07:22:59'),
	(61, 'App\\Models\\User', 1, 'auth_token', '87673aa4769a51e086f3ef3b525e9fa13366e719832f18a2318c2a403c099e12', '["*"]', '2025-11-28 21:52:41', NULL, '2025-11-28 20:34:16', '2025-11-28 21:52:41'),
	(64, 'App\\Models\\User', 1, 'auth_token', '050f4fa6a13a6be730c394f23d4419b4423aaca3e2b1da6b305333d257626ec4', '["*"]', '2025-11-28 22:00:28', NULL, '2025-11-28 22:00:13', '2025-11-28 22:00:28');

-- Dumping structure for table barbershop_db.promos
CREATE TABLE IF NOT EXISTS `promos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `day_of_week` tinyint unsigned DEFAULT NULL,
  `discount_percent` tinyint unsigned NOT NULL,
  `service_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `promos_service_id_foreign` (`service_id`),
  CONSTRAINT `promos_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.promos: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `barber_id` bigint unsigned NOT NULL,
  `rating_barber` tinyint NOT NULL,
  `rating_shop` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_booking_id_unique` (`booking_id`),
  KEY `reviews_customer_id_foreign` (`customer_id`),
  KEY `reviews_barber_id_foreign` (`barber_id`),
  CONSTRAINT `reviews_barber_id_foreign` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.reviews: ~0 rows (approximately)

-- Dumping structure for table barbershop_db.services
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `base_price` decimal(10,2) NOT NULL,
  `duration_minutes` int unsigned NOT NULL DEFAULT '30',
  `is_bundle` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.services: ~2 rows (approximately)
INSERT INTO `services` (`id`, `name`, `description`, `base_price`, `duration_minutes`, `is_bundle`, `created_at`, `updated_at`) VALUES
	(1, 'Pijat Cukur', 'test', 10000.00, 20, 0, '2025-11-25 02:39:42', '2025-11-25 02:39:42'),
	(2, 'Vitamin & Pomade', 'test', 10000.00, 3, 0, '2025-11-28 01:21:29', '2025-11-28 01:21:29');

-- Dumping structure for table barbershop_db.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_foreign` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.sessions: ~4 rows (approximately)
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('0e2ty4SxZxtp9t2gxc46Zva88XnU8nWjxMJQ3ZUR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/123.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSjY1RDZWN0Y0dXZrdkdzTUI3dWNNdWVoekluSzk1VktHZmt3eTh6biI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764037850),
	('0u0Md9g8Z3FmHTT41j6CsCXn411ymZtM5VLZ8T9c', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZkVSdmFxaDNnUjFTWUVGZ1dWcjNVVWJ3UmZVOFRpaFpHZzJMUlBFMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764132129),
	('1VOEsvTBle4AxSWGoV8CO7Z0u6ebeC4PAbmJdLiQ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWUp3UHBSUExtWDFBRGEycnNHbGt0SGZINnJqdllTUXlnVGJUVjNmOSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764046304),
	('mMfdXEEPdUXswC2x4fkxjRUPeAeq9C13mBvfk3g4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQlQxT0YyTUxlYTZOaWE5cUdMYU0ya1BmUWVtM2lLQk1NdVhubTJHQiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764077426),
	('QWtIsk7de0o8E9DXG4ONQ9hNw0szPBY55CXJGcTR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS1Z6NHo3SFU0SkNvTTNWS0h1ZHFJc0FlVUlYTTlsSThGYmNlcFNIayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764122939),
	('rzPnnZyJQjo6VG7AtHRMclCWSomc8ZRsGrqtjXBV', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZXk0YUQ4SUx6WlczdWVZeW45QXFjbU10TEx3QmtxMFh6YkhKRUU1YSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764084876),
	('zJMs2SHTJFEWcg2ZZReob3nGiOhBKavmkaw93KM8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition std-2)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicnp6SlUwNGxvckZkMHo1WDl5aDZkZlFON2RiQmlCQUVvV1U1VElFOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1764113087);

-- Dumping structure for table barbershop_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','barber','customer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loyalty_count` int unsigned NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table barbershop_db.users: ~9 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `phone`, `loyalty_count`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Admin', 'admin@barber.com', NULL, '$2y$12$2bIwp0oKS/ZIgH7Qmp1.I.wvKeigP6BDwGUe3tuyvvxqhS.YWIIWO', 'admin', '081234567890', 0, NULL, '2025-11-24 19:21:44', '2025-11-29 04:05:16'),
	(10, 'Ananda Sofyan', 'sofyan1@barber.com', NULL, '$2y$12$K8sOdiaYHSR5VO2aU/UiZO1ZTlB9iMfXXb4LWXwNI3rsBTUlJc5EW', 'barber', '0823645317982', 0, NULL, '2025-11-25 05:32:47', '2025-11-28 03:32:54'),
	(11, 'Rusdi Fahrozi', 'rusdi1@barber.com', NULL, '$2y$12$ObOqnzOqzVtTGT58CH4TvuHnup4A/MuT4Bx2/29dKbtHhC9oZrzrG', 'barber', '082272398261', 0, NULL, '2025-11-25 05:34:53', '2025-11-25 05:34:53'),
	(12, 'Arifin Ilham', 'arifin1@barber.com', NULL, '$2y$12$/YIUnP8BLOON3c0NUmxmU.NYWmzjzOXuqOmdCjw6bCtdRR1g4v1AW', 'barber', '08212837492381', 0, NULL, '2025-11-25 05:35:34', '2025-11-25 05:35:34'),
	(13, 'Ahmad Khadafi', 'dafi1@barber.com', NULL, '$2y$12$eRb7TLt7Q5CwxBTKbo0/DOqwAcVGVFug66tQoREPuOEGdZKrUpT3i', 'barber', '082382392831', 0, NULL, '2025-11-25 05:36:48', '2025-11-25 05:36:48'),
	(14, 'Bagus Achmad', 'bagusachmadsyahputra@barber.com', NULL, '$2y$12$9GI/4majErak9tx7ICX0F.y/OLfDLkcbghape1amVy22SG32yalwu', 'customer', '082133729286', 0, NULL, '2025-11-25 05:37:30', '2025-11-28 03:52:06'),
	(15, 'Rifqy Azhar', 'rifqy1@barber.com', NULL, '$2y$12$9pjZRpjeJx8oUwZldgdlfeMR9YUfSjuwHCfFIjUNWKSrL.wjKNqX2', 'customer', '082237283827', 0, NULL, '2025-11-25 05:38:26', '2025-11-25 05:38:26'),
	(16, 'Taufiq Lutfi', 'taufiq1@barber.com', NULL, '$2y$12$As06XsQ3cTak1Uh0O30/3.4l/8lZP.GhTqPm9mkXYGuipO8TrTSiu', 'customer', '082132738725', 0, NULL, '2025-11-25 05:39:37', '2025-11-25 05:39:37'),
	(17, 'Luqman Al Hakim', 'luqman@barber.com', NULL, '$2y$12$PCDgtKRyJQuJiCXw8ddgreoO2W58hcOmynWulBusTY46sdI8EOVTG', 'customer', '08233427327', 0, NULL, '2025-11-26 05:30:06', '2025-11-26 05:30:06');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
