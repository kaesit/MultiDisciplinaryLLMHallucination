from sqlalchemy import Column, Integer, String, Text, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class LLMModel(Base):
    """Hangi LLM modeli test edildiğini tutan tablo."""
    __tablename__ = "llm_models"

    id = Column(Integer, primary_key=True, index=True)
    model_adi = Column(String(100), nullable=False, unique=True)  # Örn: "qwen3.5:4b", "llama3:8b"
    versiyon = Column(String(50))
    aciklama = Column(Text)

    # İlişkiler (Relationships)
    test_sonuclari = relationship("TestSonucu", back_populates="model")


class Kategori(Base):
    """Soruların ait olduğu konu/alan kategorisi."""
    __tablename__ = "kategoriler"

    id = Column(Integer, primary_key=True, index=True)
    kategori_adi = Column(String(100), nullable=False, unique=True)  # Örn: "Matematik", "Hukuk", "Felsefe Tarihi", "ISO Standartları"

    # İlişkiler (Relationships)
    sorular = relationship("Soru", back_populates="kategori")


class Soru(Base):
    """Her bir test sorusunu tutan tablo."""
    __tablename__ = "sorular"

    id = Column(Integer, primary_key=True, index=True)
    kategori_id = Column(Integer, ForeignKey("kategoriler.id"), nullable=False)
    soru_metni = Column(Text, nullable=False)       # CSV: QuestionPrompt
    dogru_cevap = Column(Text, nullable=False)       # CSV: CorrectResponse

    # İlişkiler (Relationships)
    kategori = relationship("Kategori", back_populates="sorular")
    test_sonuclari = relationship("TestSonucu", back_populates="soru")


class TestSonucu(Base):
    """
    Bir modelin bir soruya verdiği tüm cevapları ve halüsinasyon durumunu tutan tablo.
    CSV kolonlarıyla birebir eşleşir:
      LLMName       -> model_id (FK)
      QuestionPrompt-> soru_id  (FK)
      DoubtPrompt   -> baski_prompt
      LastPrompt    -> son_prompt
      FirstResponse -> ilk_cevap
      ResponseAfterDumb -> baski_sonrasi_cevap
      LastResponse  -> son_cevap
      Status        -> halucinasyon_tipi
      Anomaly       -> anomali
    """
    __tablename__ = "test_sonuclari"

    id = Column(Integer, primary_key=True, index=True)
    soru_id = Column(Integer, ForeignKey("sorular.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("llm_models.id"), nullable=False)

    # Baskı test akışındaki promptlar
    baski_prompt = Column(Text)          # "Verdiğin cevaptan emin misin?..."
    son_prompt = Column(Text)            # "İlk cevabın ve ikinci cevabın hangisi doğruysa..."

    # Modelin verdiği 3 aşamalı cevaplar
    ilk_cevap = Column(Text)             # FirstResponse
    baski_sonrasi_cevap = Column(Text)   # ResponseAfterDumb
    son_cevap = Column(Text)             # LastResponse

    # Halüsinasyon ve anomali değerlendirmesi
    halucinasyon_var_mi = Column(Boolean, default=False)
    halucinasyon_tipi = Column(String(100))  # Status: Örn: "Hesaplama Hatası", "Uydurma Atıf" vb.
    anomali = Column(String(255))            # Anomaly

    # Zaman damgası
    olusturulma_tarihi = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler (Relationships)
    soru = relationship("Soru", back_populates="test_sonuclari")
    model = relationship("LLMModel", back_populates="test_sonuclari")
