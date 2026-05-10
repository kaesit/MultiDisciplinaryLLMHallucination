-- ============================================================
-- MultiDisciplinary LLM Hallucination - PostgreSQL Veritabanı Şeması
-- Amaç: LLM modellerinin halüsinasyon testlerinin sonuçlarını saklamak
-- ============================================================

-- Önceki tabloları temizle (geliştirme ortamı için)
DROP TABLE IF EXISTS test_sonuclari CASCADE;
DROP TABLE IF EXISTS sorular CASCADE;
DROP TABLE IF EXISTS kategoriler CASCADE;
DROP TABLE IF EXISTS llm_models CASCADE;

-- ============================================================
-- 1. LLM Modelleri Tablosu
-- Test edilen yapay zeka modellerini tutar
-- ============================================================
CREATE TABLE llm_models (
    id              SERIAL PRIMARY KEY,
    model_adi       VARCHAR(100) NOT NULL UNIQUE,   -- Örn: "qwen3.5:4b", "llama3:8b"
    versiyon        VARCHAR(50),
    aciklama        TEXT
);

-- ============================================================
-- 2. Kategoriler Tablosu
-- Soruların ait olduğu disiplin/konu alanı
-- ============================================================
CREATE TABLE kategoriler (
    id              SERIAL PRIMARY KEY,
    kategori_adi    VARCHAR(100) NOT NULL UNIQUE     -- Örn: "Matematik", "Hukuk", "Felsefe Tarihi", "ISO Standartları"
);

-- ============================================================
-- 3. Sorular Tablosu
-- Her bir test sorusu ve doğru cevabı
-- ============================================================
CREATE TABLE sorular (
    id              SERIAL PRIMARY KEY,
    kategori_id     INTEGER NOT NULL REFERENCES kategoriler(id) ON DELETE CASCADE,
    soru_metni      TEXT NOT NULL,                    -- CSV: QuestionPrompt
    dogru_cevap     TEXT NOT NULL                     -- CSV: CorrectResponse
);

-- ============================================================
-- 4. Test Sonuçları Tablosu
-- Bir modelin bir soruya verdiği 3 aşamalı cevap ve halüsinasyon durumu
-- ============================================================
CREATE TABLE test_sonuclari (
    id                      SERIAL PRIMARY KEY,
    soru_id                 INTEGER NOT NULL REFERENCES sorular(id) ON DELETE CASCADE,
    model_id                INTEGER NOT NULL REFERENCES llm_models(id) ON DELETE CASCADE,

    -- Baskı test akışındaki promptlar
    baski_prompt            TEXT,                      -- "Verdiğin cevaptan emin misin?..."
    son_prompt              TEXT,                      -- "İlk cevabın ve ikinci cevabın hangisi doğruysa..."

    -- Modelin verdiği 3 aşamalı cevaplar
    ilk_cevap               TEXT,                      -- CSV: FirstResponse
    baski_sonrasi_cevap     TEXT,                      -- CSV: ResponseAfterDumb
    son_cevap               TEXT,                      -- CSV: LastResponse

    -- Halüsinasyon ve anomali değerlendirmesi
    halucinasyon_var_mi     BOOLEAN DEFAULT FALSE,
    halucinasyon_tipi       VARCHAR(100),              -- CSV: Status (Örn: "Hesaplama Hatası", "Uydurma Atıf")
    anomali                 VARCHAR(255),              -- CSV: Anomaly

    -- Zaman damgası
    olusturulma_tarihi      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- İndeksler (Performans için)
-- ============================================================
CREATE INDEX idx_test_sonuclari_model   ON test_sonuclari(model_id);
CREATE INDEX idx_test_sonuclari_soru    ON test_sonuclari(soru_id);
CREATE INDEX idx_sorular_kategori       ON sorular(kategori_id);
CREATE INDEX idx_test_halucinasyon      ON test_sonuclari(halucinasyon_var_mi);

-- ============================================================
-- Örnek Veriler (Seed Data)
-- ============================================================

-- Kategoriler (CSV'deki Topic sütunundan)
INSERT INTO kategoriler (kategori_adi) VALUES
    ('Matematik'),
    ('Felsefe Tarihi'),
    ('Hukuk'),
    ('ISO Standartları');

-- Modeller
INSERT INTO llm_models (model_adi, versiyon, aciklama) VALUES
    ('qwen2.5:3b', '2.5', 'Alibaba Qwen serisi - 3B parametreli'),
    ('qwen3.5:4b', '3.5', 'Alibaba Qwen serisi - 4B parametreli');
