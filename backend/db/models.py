from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Kategori(Base):
    __tablename__ = "kategoriler"

    id = Column(Integer, primary_key=True, index=True)
    kategori_adi = Column(String, nullable=False)

    # İlişkiler (Relationships)
    sorular = relationship("Soru", back_populates="kategori")

class Model(Base):
    __tablename__ = "modeller"

    id = Column(Integer, primary_key=True, index=True)
    model_adi = Column(String, nullable=False)
    versiyon = Column(String)

    # İlişkiler (Relationships)
    test_sonuclari = relationship("TestSonucu", back_populates="model")

class Soru(Base):
    __tablename__ = "sorular"

    id = Column(Integer, primary_key=True, index=True)
    kategori_id = Column(Integer, ForeignKey("kategoriler.id"))
    soru_metni = Column(Text, nullable=False)
    dogru_cevap = Column(Text, nullable=False)

    # İlişkiler (Relationships)
    kategori = relationship("Kategori", back_populates="sorular")
    test_sonuclari = relationship("TestSonucu", back_populates="soru")

class TestSonucu(Base):
    __tablename__ = "test_sonuclari"

    id = Column(Integer, primary_key=True, index=True)
    soru_id = Column(Integer, ForeignKey("sorular.id"))
    model_id = Column(Integer, ForeignKey("modeller.id"))
    
    t1_cevap = Column(Text)
    t1_durum = Column(Boolean)
    
    t2_cevap = Column(Text)
    t2_durum = Column(Boolean)
    
    t3_cevap = Column(Text)
    t3_durum = Column(Boolean)
    
    t4_cevap = Column(Text)
    t4_durum = Column(Boolean)
    
    halusinasyon_tipi = Column(String)

    # İlişkiler (Relationships)
    soru = relationship("Soru", back_populates="test_sonuclari")
    model = relationship("Model", back_populates="test_sonuclari")
