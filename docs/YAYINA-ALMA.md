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

### Tasarım
- Pasaport/seyahat belgesi temalı özgün arayüz: kâğıt dokulu zemin, pasaport laciverti, vize damgası kırmızısı ve pirinç sarısı; başlıklarda editoryal serif (Fraunces, 18 KB), gövdede sistem fontu.
- İmza detaylar: pasaport sayfalarında makine okunur bölge (MRZ) satırı ve mühür şeklinde sıralama rozeti, rota sayfalarında biniş kartı (boarding pass) görünümü, her ülke için 198 hedefin dağılımını gösteren yığılmış çubuk.
- "Pasaportum → Gideceğim ülke" denetleyicisi: cevabı sayfa yenilemeden anında gösterir, son seçilen pasaportu hatırlar, klavyeyle tam kullanılabilir.
- Mobil öncelikli: yapışkan durum sekmeleri + anlık filtre, büyük dokunma alanları; otomatik koyu mod; Arapça/Urduca için tam RTL.

### Otomasyon
- Netlify bu GitHub reposuna bağlıdır: varsayılan dala (`claude/passport-visa-platform-ad7Uv`) yapılan her push siteyi otomatik build edip yayınlar. Ek token/secret gerekmez.
- `update-data.yml`: her pazartesi veriyi günceller, değişiklik varsa commit'ler (→ Netlify otomatik yayınlar) ve ardından IndexNow'a bildirir.

## 3. Senin yapman gerekenler (sırasıyla)

> Tek ücretli (önerilen) kalem: **kendi alan adın** (~10 $/yıl). AdSense `*.netlify.app` gibi paylaşımlı alt alan adlarını pratikte onaylamaz; ads.txt kök alan adında olmalıdır.

1. **Alan adı al** (ör. Cloudflare Registrar / Porkbun – maliyet fiyatına). Netlify → Domain management → *Add a domain* → alan adını ekle, HTTPS otomatik gelir. Sonra Netlify → Site configuration → Environment variables → `SITE_URL` değerini `https://alanadin.com` yap ve yeniden deploy et (Deploys → Trigger deploy).
2. **Google Search Console** (search.google.com/search-console) → *URL prefix* ile site adresini ekle → "HTML tag" yöntemindeki kodu Netlify'da `PUBLIC_GOOGLE_SITE_VERIFICATION` değişkenine yapıştır → yeniden deploy → Doğrula → Sitemaps bölümüne `sitemap-index.xml` yaz ve gönder.
3. **Bing Webmaster Tools** → "Import from Google Search Console" (tek tık). Bing; ChatGPT arama, Copilot ve DuckDuckGo'yu besler. IndexNow anahtarı sitede zaten hazır (`/03dadaeb24b51e7d05988552784a5067.txt`).
4. **Google Analytics 4** (isteğe bağlı) → ölçüm kimliğini (`G-…`) Netlify'da `PUBLIC_GA4_ID` olarak ekle.
5. **İletişim e-postası:** Netlify'da `PUBLIC_CONTACT_EMAIL` ekle (alan adın olunca Cloudflare Email Routing ile ücretsiz `iletisim@alanadin.com`). AdSense iletişim bilgisi arar.
6. **AdSense** (site 2-4 hafta indekslendikten sonra, kendi alan adınla): başvur → onaylanınca `PUBLIC_ADSENSE_CLIENT=ca-pub-…` ekle (ads.txt otomatik oluşur) → AdSense → Privacy & messaging → Avrupa mesajını yayınla → 3 reklam birimi oluşturup slot ID'lerini `PUBLIC_ADSENSE_SLOT_TOP`, `PUBLIC_ADSENSE_SLOT_IN_CONTENT`, `PUBLIC_ADSENSE_SLOT_BOTTOM` olarak ekle.
7. **Affiliate programları (ücretsiz):** SafetyWing, Airalo, Travelpayouts, iVisa → linkleri `.env.example`'daki isimlerle Netlify'a ekle.

> Netlify'da değişken eklemek: app.netlify.com → passportdata → Site configuration → Environment variables → Add a variable. Ekledikten sonra Deploys → Trigger deploy → Deploy site.

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

## 6. Yerel geliştirme (teknik)

```bash
npm ci
cp .env.example .env            # isteğe bağlı
PD_ROUTES=minimal npm run build # hızlı build (~30 bin sayfa, ~2,5 dk)
npm run build                   # tam build (~68 bin sayfa)
npm run data:update             # veriyi manuel güncelle
node --experimental-strip-types scripts/check-i18n.mjs
NODE_PATH=$(npm root -g) node --experimental-strip-types scripts/generate-images.mjs  # OG görselleri (Playwright gerekir)
```
