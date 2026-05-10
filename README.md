# MultiDisciplinaryLLMHallucination

# 🔬 LLM Halüsinasyon Tespit ve Analiz Raporu

Bu çalışma, popüler yerel LLM modellerinin (Mistral, Phi-3 ve Qwen2.5) Türkçe dilindeki halüsinasyon (uydurma) eğilimlerini akademik düzeyde ölçümlemek amacıyla yapılmıştır.

## 🤖 Test Edilen Modeller

Bu araştırma kapsamında aşağıdaki 3 farklı mimari ve parametre büyüklüğündeki model kullanılmıştır:

1.  **Mistral (7B)**: Dengeli ve genel amaçlı 7 milyar parametreli model.
2.  **Qwen 2.5 (3B)**: Alibaba tarafından geliştirilen, modern ve kompakt 3 milyar parametreli model.
3.  **Phi-3 (3.8B)**: Microsoft'un geliştirdiği, SML (Small Language Model) segmentinin en güçlü temsilcilerinden.

---

## 📊 Kategori Bazlı Halüsinasyon Oranları (%)

150 farklı soru üzerinden 3'er tur yapılan testler sonucunda modellerin uzmanlık alanlarına göre yanılma payları aşağıda sunulmuştur:

| Kategori | Mistral (7B) | Qwen 2.5 (3B) | Phi-3 (3.8B) |
| :--- | :---: | :---: | :---: |
| **Matematik** | %31.11 | %24.44 | **%11.11** |
| **Manipulasyon** | %24.44 | %22.22 | **%13.33** |
| **Hukuk ve Felsefe** | **%24.00** | %24.00 | %20.89 |
| **Uluslararası Standartlar** | **%16.44** | %23.56 | %25.11 |

---

## 📈 Görsel İstatistik Analizi

Modellerin genel hata payları ve kategorik bazdaki dağılımları aşağıdaki grafikte detaylandırılmıştır:

![Akademik Karşılaştırma Grafiği](Academic_Reports/Grafik.png)

---

## 🎓 Temel Bulgular ve Sonuç

*   **En Güvenilir Model:** **Phi-3 (3.8B)**, özellikle Matematik ve Mantık/Manipulasyon dallarında diğer modellere kıyasla anlamlı derecede daha düşük halüsinasyon oranı göstermiştir.
*   **Zayıf Alanlar:** Mistral (7B) modelinin en çok zorlandığı alan karmaşık matematiksel işlemler olurken; Qwen 2.5 (3B) tüm dökümlerde ortalama bir performans sergilemiştir.
*   **Akademik Çıktı:** Tüm sonuçlar, projenin `Academic_Reports/Rapor.md` dosyasında soru bazlı olarak detaylandırılmış ve `LLM_Final_Akademik_Rapor.xlsx` dosyasına akademik tablo formatında aktarılmıştır.

---
*Bu çalışma LLM Halüsinasyon Tespit Sistemi aracılığıyla otomatik olarak üretilmiştir.*
