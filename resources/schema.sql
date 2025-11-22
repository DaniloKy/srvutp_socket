DROP TABLE IF EXISTS `players`;
CREATE TABLE `players`(
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `username` TEXT UNIQUE,
    `belong_to` INTEGER NOT NULL,
    `class_name` INTEGER NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `xpToLvl` INTEGER NOT NULL DEFAULT 500,
    `coins` INTEGER NOT NULL DEFAULT 0,
    `stats_id` INTEGER NOT NULL
);

DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes`(
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT UNIQUE,
    `name_compiled` TEXT UNIQUE,
    `tiny_description` TEXT NOT NULL,
    `description` TEXT NULL
);

DROP TABLE IF EXISTS `player_stats`;
CREATE TABLE `player_stats`(
    `stats_id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `kills` INTEGER NOT NULL DEFAULT 0,
    `deaths` INTEGER NOT NULL DEFAULT 0,
    `games_played` INTEGER NOT NULL DEFAULT 0,
    `games_won` INTEGER NOT NULL DEFAULT 0,
    `games_lost` INTEGER NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items`(
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `description` TEXT NULL,
    `icon` TEXT NOT NULL
);

DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills`(
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `description` TEXT NULL,
    `icon` TEXT NOT NULL
);

DROP TABLE IF EXISTS `perks`;
CREATE TABLE `perks`(
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `description` TEXT NULL,
    `icon` TEXT NOT NULL
);