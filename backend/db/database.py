import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# PostgreSQL bağlantı URL'sini ortam değişkeninden (environment variable) alıyoruz.
# Varsayılan bir değer olarak örnek bir URL ekledik. (İleride kendi veritabanı bilgilerinizle değiştirebilirsiniz)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://kullanici_adi:sifre@localhost:5432/llm_halusinasyon_db"
)

# SQLAlchemy engine oluşturulması
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Veritabanı oturumlarını (session) yönetmek için SessionLocal sınıfı
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tüm modellerin miras alacağı temel (Base) sınıf
Base = declarative_base()

# FastAPI bağımlılığı (Dependency) olarak kullanılacak veritabanı oturumu sağlayıcısı
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
