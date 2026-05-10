"""
CSV verilerini PostgreSQL veritabanına aktaran seed scripti.
halusinasyon_sonuclari.csv dosyasını okur ve veritabanına yazar.

Kullanım:
    python -m backend.db.seed_from_csv
"""

import os
import sys
import pandas as pd

# Proje kökünü path'e ekle
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.db.database import SessionLocal, engine, Base
from backend.db.models import LLMModel, Kategori, Soru, TestSonucu


def seed_database(csv_path: str = "backend/halusinasyon_sonuclari.csv"):
    """CSV dosyasından veritabanını doldurur."""
    
    # Tabloları oluştur
    Base.metadata.create_all(bind=engine)
    
    # CSV'yi oku
    try:
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
    except FileNotFoundError:
        print(f"HATA: {csv_path} dosyası bulunamadı!")
        return
    
    db = SessionLocal()
    
    try:
        print(f"{len(df)} kayıt okundu, veritabanına aktarılıyor...\n")
        
        # 1. Kategorileri ekle
        kategoriler = {}
        for topic in df['Topic'].unique():
            existing = db.query(Kategori).filter(Kategori.kategori_adi == topic).first()
            if existing:
                kategoriler[topic] = existing
            else:
                kat = Kategori(kategori_adi=topic)
                db.add(kat)
                db.flush()
                kategoriler[topic] = kat
        print(f"  ✅ {len(kategoriler)} kategori eklendi: {list(kategoriler.keys())}")
        
        # 2. Modelleri ekle
        modeller = {}
        for model_name in df['LLMName'].unique():
            existing = db.query(LLMModel).filter(LLMModel.model_adi == model_name).first()
            if existing:
                modeller[model_name] = existing
            else:
                model = LLMModel(model_adi=model_name)
                db.add(model)
                db.flush()
                modeller[model_name] = model
        print(f"  ✅ {len(modeller)} model eklendi: {list(modeller.keys())}")
        
        # 3. Soruları ekle (duplicate kontrolü ile)
        sorular = {}
        for _, row in df.drop_duplicates(subset=['QuestionPrompt']).iterrows():
            q_text = str(row['QuestionPrompt'])
            existing = db.query(Soru).filter(Soru.soru_metni == q_text).first()
            if existing:
                sorular[q_text] = existing
            else:
                soru = Soru(
                    kategori_id=kategoriler[row['Topic']].id,
                    soru_metni=q_text,
                    dogru_cevap=str(row['CorrectResponse'])
                )
                db.add(soru)
                db.flush()
                sorular[q_text] = soru
        print(f"  ✅ {len(sorular)} soru eklendi")
        
        # 4. Test sonuçlarını ekle
        sonuc_sayisi = 0
        for _, row in df.iterrows():
            q_text = str(row['QuestionPrompt'])
            model_name = str(row['LLMName'])
            
            # Halüsinasyon kontrolü
            status = str(row.get('Status', ''))
            has_hallucination = bool(status and status.strip() and status.lower() != 'nan')
            
            anomaly = str(row.get('Anomaly', ''))
            if anomaly.lower() == 'nan':
                anomaly = ''
            
            sonuc = TestSonucu(
                soru_id=sorular[q_text].id,
                model_id=modeller[model_name].id,
                baski_prompt=str(row.get('DoubtPrompt', '')),
                son_prompt=str(row.get('LastPrompt', '')),
                ilk_cevap=str(row.get('FirstResponse', '')),
                baski_sonrasi_cevap=str(row.get('ResponseAfterDumb', '')),
                son_cevap=str(row.get('LastResponse', '')),
                halucinasyon_var_mi=has_hallucination,
                halucinasyon_tipi=status if has_hallucination else None,
                anomali=anomaly if anomaly.strip() else None
            )
            db.add(sonuc)
            sonuc_sayisi += 1
        
        db.commit()
        print(f"  ✅ {sonuc_sayisi} test sonucu eklendi")
        print(f"\n🎉 Veritabanı başarıyla dolduruldu!")
        
    except Exception as e:
        db.rollback()
        print(f"HATA: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
