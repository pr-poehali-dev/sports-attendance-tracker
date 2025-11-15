CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(50) NOT NULL DEFAULT 'bg-primary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS athletes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    attendance INTEGER DEFAULT 0 CHECK (attendance >= 0 AND attendance <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'injured', 'rest')),
    last_visit VARCHAR(50) DEFAULT 'Никогда',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_name) REFERENCES groups(name) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    day VARCHAR(50) NOT NULL,
    time VARCHAR(10) NOT NULL,
    duration VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_name) REFERENCES groups(name) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id)
);

CREATE INDEX IF NOT EXISTS idx_athletes_group ON athletes(group_name);
CREATE INDEX IF NOT EXISTS idx_schedules_group ON schedules(group_name);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete ON attendance_records(athlete_id);

INSERT INTO groups (name, color) VALUES 
    ('Боксёры', 'bg-primary'),
    ('Борцы', 'bg-secondary'),
    ('Кроссфит', 'bg-accent')
ON CONFLICT (name) DO NOTHING;

INSERT INTO athletes (name, group_name, attendance, status, last_visit) VALUES
    ('Алексей Смирнов', 'Боксёры', 95, 'active', 'Сегодня'),
    ('Мария Петрова', 'Борцы', 88, 'active', 'Вчера'),
    ('Дмитрий Козлов', 'Боксёры', 72, 'injured', '3 дня назад'),
    ('Анна Волкова', 'Кроссфит', 91, 'active', 'Сегодня'),
    ('Иван Соколов', 'Борцы', 65, 'rest', '5 дней назад'),
    ('Елена Морозова', 'Кроссфит', 98, 'active', 'Сегодня');

INSERT INTO schedules (group_name, day, time, duration) VALUES
    ('Боксёры', 'Понедельник', '18:00', '90 мин'),
    ('Боксёры', 'Среда', '18:00', '90 мин'),
    ('Борцы', 'Вторник', '19:00', '120 мин'),
    ('Кроссфит', 'Понедельник', '17:00', '60 мин');