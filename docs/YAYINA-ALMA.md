# PassportData – Durum Tespiti, Plan ve Yayına Alma Rehberi

## 1. Başlangıçtaki durum (tespit)

| Alan | Bulgu |
|---|---|
| Veri | 56 ülkeden sadece 30'unun verisi vardı (59 hedef). "Henley" sıralaması elle yazılmıştı. Güncelleme scripti yanlış CSV'yi (ülke adlı) ISO kodu gibi okuyordu → çalışsa bile bozuk veri üretirdi. |
| Dil | 6 dil; karşılaştırma, Schengen hesaplayıcı, iVisa kutusu gibi yerlerde metinler İngilizce sabit kalmıştı. |
| SEO | Kök sayfa JS ile yönlendiriyordu; hreflang olmayan sayfaları gösteriyordu; sitemap entegrasyonu kurulu ama kapalıydı; robots.txt, favicon ve OG görselleri yoktu (404); 4 kategori sayfası aynı tablonun kopyasıydı (thin/duplicate content). |
| AEO/GEO | FAQ / Dataset şeması yok, doğrudan cevap veren metin yok, llms.txt yok, makine-okunur veri yok. |
| Gelir | AdSense `ca-pub-ADSENSE_PUB_ID`, affiliate `REFID`/`MARKER` gibi yer tutucular → boş reklam alanları ve çalışmayan linkler. Gizlilik/Şartlar/Hakkında sayfaları ve ads.txt yoktu (AdSense onayı için şart). Plausible ücretliydi. |
| Hata | Schengen hesaplayıcı kayan 180 gün penceresini yanlış hesaplıyordu. |

## 2. Yapılanlar (tamamı ücretsiz)

### Veri
- **Gerçek, açık veri:** [imorte/passport-index-data](https://github.com/imorte/passport-index-data) (MIT, passportindex.org kaynaklı), yedek kaynak olarak ilyankou veri seti. **199 pasaport × 198 hedef = 39.402 rota.**
- Durumlar: vizesiz (gün sayısıyla), kapıda vize, eTA, e-Vize, vize gerekli, giriş yasak.
- `scripts/update-data.mjs`: veriyi indirir, doğrular (eksik veriyle asla üzerine yazmaz), ülke adlarını 15 dilde CLDR'den (Intl) üretir, URL slug'larını oluşturur.
- Pasaport sıralaması veriden hesaplanır (vizesiz + kapıda vize + eTA = "mobilite skoru"). Henley adı kaldırıldı (marka/yanıltıcılık riski).
- Bayraklar siteye gömülü SVG (MIT, `country-flag-icons`) → dış CDN bağımlılığı yok.

### 15 dil
en, zh (Basitleştirilmiş Çince), hi, es, ar (RTL), fr, bn, pt, ru, ur (RTL), id, de, ja, tr, vi. Arayüz metinleri `src/i18n/ui/*.ts`; `scripts/check-i18n.mjs` tüm dillerin anahtar ve yer tutucu uyumunu CI'da kontrol eder.

### Sayfa tipleri (~68.000 sayfa)
| URL | Amaç / hedef arama |
|---|---|
| `/{dil}/` | Dil ana sayfası |
| `/{dil}/{pasaport}/` | "Türkiye pasaportu vizesiz ülkeler" |
| `/{dil}/{pasaport}/to/{hedef}/` | "Türkiye'den Japonya'ya vize gerekiyor mu" (uzun kuyruk) |
| `/{dil}/visit/{hedef}/` | "Japonya vize şartları – hangi ülkeler vizesiz" |
| `/{dil}/passport-ranking/` | "en güçlü pasaportlar 2026" |
| `/{dil}/compare/` | İki pasaport karşılaştırma aracı |
| `/{dil}/schengen-calculator/` | Schengen 90/180 hesaplayıcı (düzeltilmiş algoritma) |
| `/{dil}/about|privacy|terms/` | AdSense için zorunlu sayfalar |

Rota sayfaları İngilizcede tüm 199 pasaport için, diğer dillerde **o dili konuşan ülkelerin pasaportları** için üretilir (`src/config/site.ts → ROUTE_ORIGINS`). Böylece Türkçe'de "Brezilya → Japonya" gibi kimsenin aramayacağı yüz binlerce kopya sayfa üretilmez (Google "scaled content" politikasına uyum).

### SEO
- Her sayfada benzersiz title/description, self-canonical, **doğru hreflang** (sadece gerçekten var olan karşılıklar + x-default).
- Dil bazlı, 20.000 URL'lik parçalara bölünmüş **sitemap index** (hreflang alternatifleriyle): `/sitemap-index.xml`.
- `robots.txt`, dil bazlı 404 sayfaları, eski URL'lerden 301 yönlendirme, güvenlik ve önbellek başlıkları (`netlify.toml`).
- Open Graph + Twitter kartları, her dil için 1200×630 OG görseli, favicon/PWA manifest.
- Hızlı: statik HTML, web fontu yok, JS minimum, bayraklar lazy-load ve boyutları sabit (CLS yok).

### AEO / GEO (yapay zekâ ve cevap motorları)
- Her sayfanın başında **doğrudan cevap** veren paragraf (ör. "Hayır. Türkiye pasaportu sahipleri Japonya'ya 90 güne kadar vizesiz gidebilir.").
- JSON-LD `@graph`: Organization, WebSite, WebPage (dateModified), BreadcrumbList, **FAQPage**, **Dataset** (Google Dataset Search), ItemList (sıralama).
- `/llms.txt` ve `/llms-full.txt` (199 pasaportun özeti), **açık JSON API**: `/api/v1/visa-requirements.json`, `/api/v1/ranking.json`, `/api/v1/countries.json`, `/api/v1/passports/{ISO2}.json` → atıf ve backlink çeker.
- robots.txt'te GPTBot, ClaudeBot, PerplexityBot, Google-Extended vb. açıkça serbest.
- IndexNow (Bing/Copilot/ChatGPT arama altyapısı, Yandex) otomatik bildirim.

### Gelir altyapısı
- AdSense: ID girilene kadar hiçbir reklam kodu render edilmez. Girildiğinde otomatik: script, `ads.txt`, `google-adsense-account` meta, 3 manuel reklam alanı (üst / içerik / alt), Consent Mode v2 (AB/İngiltere/İsviçre'de varsayılan "reddedildi").
- Affiliate kartları (SafetyWing, Airalo, otel, iVisa) sadece ID girilince görünür; `rel="sponsored"` ve açıklama metni otomatik.
- Analitik: GA4 ve/veya Cloudflare Web Analytics (ikisi de ücretsiz).

### Otomasyon
- `update-data.yml`: her pazartesi veriyi günceller, değişiklik varsa commit'ler.
- `build-deploy.yml`: main'e push, veri güncellemesi veya manuel tetiklemede build + Netlify deploy + (isteğe bağlı) IndexNow.

## 3. Senin yapman gerekenler (sırasıyla)

> Tek ücretli (önerilen) kalem: **kendi alan adın** (~10 $/yıl). AdSense `*.netlify.app` gibi paylaşımlı alt alan adlarını pratikte onaylamaz; ads.txt kök alan adında olmalıdır.

1. **Alan adı al** (ör. Cloudflare Registrar / Porkbun – maliyet fiyatına). Netlify → Domain management → alan adını ekle, HTTPS otomatik.
2. **GitHub → Settings → Secrets and variables → Actions**
   - *Secrets*: `NETLIFY_AUTH_TOKEN` (Netlify → User settings → Applications → Personal access token), `NETLIFY_SITE_ID` (Site configuration → Site ID).
   - *Variables*: `SITE_URL=https://alanadin.com` ve aşağıdaki ID'ler (tam liste: `.env.example`).
3. **Netlify'da çift build'i önle:** Site configuration → Build & deploy → *Stop builds* (deploy'u GitHub Actions yapıyor; Netlify build dakikası harcanmaz).
4. **Google Search Console** → alan adı mülkü ekle → DNS TXT ile doğrula (veya `PUBLIC_GOOGLE_SITE_VERIFICATION`) → Sitemaps → `sitemap-index.xml` gönder.
5. **Bing Webmaster Tools** → Search Console'dan içe aktar (1 tık) → sitemap gönder. `PUBLIC_INDEXNOW_KEY` için `openssl rand -hex 16` çıktısını değişken olarak ekle. (Bing = ChatGPT arama, Copilot, DuckDuckGo görünürlüğü.)
6. **Yandex Webmaster** (Rusça/Türkçe trafik için) – isteğe bağlı.
7. **Google Analytics 4** → ölçüm kimliği `PUBLIC_GA4_ID`. İsteğe bağlı: Cloudflare Web Analytics token'ı.
8. **İletişim e-postası:** `PUBLIC_CONTACT_EMAIL` (ör. alan adında ücretsiz Cloudflare Email Routing ile `iletisim@alanadin.com`). AdSense iletişim bilgisi arar.
9. **AdSense başvurusu** (site 2-4 hafta indekslendikten sonra):
   - `PUBLIC_ADSENSE_CLIENT=ca-pub-…` ekle → deploy → AdSense'te siteyi ekle; `ads.txt` otomatik oluşur.
   - AdSense → **Privacy & messaging → European regulations** mesajını oluştur ve yayınla (Google'ın ücretsiz sertifikalı CMP'si; AB trafiği için zorunlu).
   - Onaydan sonra Ads → By ad unit → 3 adet "Display" birim oluştur → slot ID'lerini `PUBLIC_ADSENSE_SLOT_TOP / _IN_CONTENT / _BOTTOM` olarak ekle. (Alternatif: sadece Auto ads.)
10. **Affiliate programları (ücretsiz):** SafetyWing Ambassador, Airalo Affiliate, Travelpayouts (Booking/otel, eSIM, sigorta hepsi tek panelde), iVisa Partner → linkleri değişkenlere ekle.
11. GitHub → Actions → *Build & deploy* → Run workflow (`indexnow` işaretli) ile ilk yayını yap.

## 4. Sonraki adımlar (hepsi ücretsiz, önerilen sırayla)

1. **İlk 30 gün:** Search Console'da indekslenen sayfa sayısını ve "Keşfedildi – şu anda dizine eklenmedi" oranını izle. Yeni alan adında Google önce ~birkaç bin sayfayı indeksler; bu normaldir.
2. **Backlink / tanınırlık:** açık JSON API'yi Reddit (r/digitalnomad, r/travel, r/datasets), Hacker News "Show HN", GitHub awesome listeleri, Product Hunt'ta paylaş. Wikipedia'ya kaynak olarak değil ama veri blog yazılarına atıf olarak iyi çalışır.
3. **Editoryal içerik (E-E-A-T):** en çok trafik alan 20-30 rota için elle yazılmış kısa rehberler (başvuru adımları, resmi başvuru linki, ücret). Programatik sayfaların üstüne gerçek değer ekler ve AdSense onayını kolaylaştırır.
4. **Resmi link verisi:** ülke bazında resmi e-Vize / eTA başvuru sitelerini (`evisa.gov.tr`, `esta.cbp.dhs.gov` vb.) ekle → hem kullanıcı değeri hem güven sinyali.
5. **Ek araçlar:** "Vizesiz gidebileceğim ülkeler haritası" (SVG dünya haritası), ETIAS / UK ETA rehberleri, pasaport "mobilite değişimi" (veri geçmişi saklanarak).
6. **Core Web Vitals:** PageSpeed Insights ile birkaç sayfa tipini kontrol et; reklam yerleşimlerinde CLS'yi izle.

## 5. Gerçekçi beklenti

- Seyahat/vize nişinde AdSense RPM tipik olarak **1-5 $** (Tier-1 İngilizce trafik daha yüksek, Hindistan/Pakistan/Bangladeş trafiği daha düşük). Asıl gelir potansiyeli **affiliate** (sigorta, eSIM, e-Vize servisleri) tarafındadır.
- Yeni alan adında organik trafik genellikle **3-6 ayda** anlamlı seviyeye çıkar; düzenli veri güncellemesi ve backlink bu süreyi kısaltır.

## 6. Yerel geliştirme

```bash
npm ci
cp .env.example .env            # isteğe bağlı
PD_ROUTES=minimal npm run build # hızlı build (~30 bin sayfa, ~2,5 dk)
npm run build                   # tam build (~68 bin sayfa)
npm run data:update             # veriyi manuel güncelle
node --experimental-strip-types scripts/check-i18n.mjs
NODE_PATH=$(npm root -g) node --experimental-strip-types scripts/generate-images.mjs  # OG görselleri (Playwright gerekir)
```
