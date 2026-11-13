# Hajonsoft Eagle

**Passport and visa workflows with less repetitive work.**

[English](#english) | [Français](#français) | [العربية](#العربية) | [हिन्दी](#हिन्दी)

### Quick install / Installation rapide / التثبيت السريع / एक-कमांड इंस्टॉल

Bash, zsh, or PowerShell 7+:

```sh
git clone https://github.com/hajonsoft/eagle.git && cd eagle && npm install
```

Windows PowerShell 5.1:

```powershell
git clone https://github.com/hajonsoft/eagle.git; if ($?) { Set-Location eagle; npm install }
```

## English

### A clearer workflow for your team

Hajonsoft Eagle helps teams prepare traveler information and complete supported
visa workflows with fewer repetitive steps. It brings passport details and
application tasks into one guided workflow on your computer, with a browser
window you can follow as Eagle works.

Eagle is designed to help teams spend less time re-entering information and
more time reviewing the details that matter. Your team remains responsible for
checking traveler data and following the destination service's requirements.

### Get started

You will need **Node.js LTS** and **Git**:

1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Install Git from [git-scm.com/downloads](https://git-scm.com/downloads).
3. Open Terminal on macOS/Linux or PowerShell on Windows, then run:

   ```bash
   git clone https://github.com/hajonsoft/eagle.git
   cd eagle
   npm install
   ```

### Check your setup

Confirm the tools are available, then check Eagle's installed version:

```bash
node --version
npm --version
git --version
node . -v
```

The version check confirms the local installation. A real workflow also needs
the traveler data, account access, and run instructions provided by your
organization. Do not start a live submission until those are ready.

### Browser help

Eagle prints the Chrome executable path it expects when it starts. If Chrome is
missing, the console shows the matching download version and installation
commands for your computer. Follow those commands exactly; the version and
destination are generated from the installed Puppeteer package.

If the console says Chrome was closed or the page changed, reopen Chrome if
needed, wait for the page to settle, and retry. Restart Eagle if the issue
continues. For help with your organization's setup, contact your team lead or
Hajonsoft representative.

## Français

### Un parcours plus simple pour votre équipe

Hajonsoft Eagle aide les équipes à préparer les informations des voyageurs et
à suivre les démarches de visa prises en charge, avec moins d'étapes répétitives.
Les données du passeport et les tâches de la demande sont réunies dans un parcours
guidé sur votre ordinateur, avec une fenêtre de navigateur que vous pouvez suivre.

Eagle aide votre équipe à passer moins de temps à ressaisir des informations et
plus de temps à vérifier les éléments importants. Votre équipe reste responsable
de la vérification des données des voyageurs et du respect des exigences du service
de destination.

### Installation

Vous aurez besoin de **Node.js LTS** et de **Git** :

1. Installez Node.js depuis [nodejs.org](https://nodejs.org/).
2. Installez Git depuis [git-scm.com/downloads](https://git-scm.com/downloads).
3. Ouvrez Terminal sur macOS/Linux ou PowerShell sur Windows, puis exécutez :

   ```bash
   git clone https://github.com/hajonsoft/eagle.git
   cd eagle
   npm install
   ```

### Vérifier l'installation

Vérifiez que les outils sont disponibles, puis affichez la version d'Eagle :

```bash
node --version
npm --version
git --version
node . -v
```

La vérification de version confirme l'installation locale. Un vrai traitement
nécessite également les données des voyageurs, l'accès au compte et les
instructions fournis par votre organisation. Ne lancez pas de soumission réelle
tant que ces éléments ne sont pas prêts.

### Aide du navigateur

Au démarrage, Eagle affiche le chemin de l'exécutable Chrome attendu. Si Chrome
est absent, la console indique la version à télécharger et les commandes
d'installation adaptées à votre ordinateur. Suivez exactement ces commandes :
la version et le dossier de destination correspondent au paquet Puppeteer installé.

Si la console indique que Chrome a été fermé ou que la page a changé, rouvrez
Chrome si nécessaire, attendez que la page soit stable, puis réessayez. Redémarrez
Eagle si le problème persiste. Pour l'aide liée à votre organisation, contactez
votre responsable d'équipe ou votre interlocuteur Hajonsoft.

## العربية

### سير عمل أوضح لفريقك

يساعد حج اونسوفث الفرق على تجهيز معلومات المسافرين وإكمال إجراءات التأشيرة
المدعومة بخطوات متكررة أقل. يجمع تفاصيل جواز السفر ومهام الطلب في سير عمل موجّه
على جهازك، مع نافذة متصفح يمكنك متابعة العمل من خلالها.

يساعد Eagle فريقك على تقليل وقت إعادة إدخال المعلومات والتركيز أكثر على مراجعة
التفاصيل المهمة. يبقى فريقك مسؤولاً عن التحقق من بيانات المسافرين واتباع متطلبات
الخدمة المقصودة.

### البدء

ستحتاج إلى **Node.js LTS** و **Git**:

1. ثبّت Node.js من [nodejs.org](https://nodejs.org/).
2. ثبّت Git من [git-scm.com/downloads](https://git-scm.com/downloads).
3. افتح Terminal على macOS/Linux أو PowerShell على Windows، ثم نفّذ:

   ```bash
   git clone https://github.com/hajonsoft/eagle.git
   cd eagle
   npm install
   ```

### التحقق من الإعداد

تحقق من توفر الأدوات، ثم اعرض إصدار Eagle المثبّت:

```bash
node --version
npm --version
git --version
node . -v
```

يؤكد فحص الإصدار نجاح التثبيت المحلي. يتطلب التشغيل الفعلي أيضاً بيانات
المسافرين وصلاحية الحساب وتعليمات التشغيل التي توفرها مؤسستك. لا تبدأ إرسالاً
فعلياً قبل تجهيز هذه المتطلبات.

### مساعدة المتصفح

يعرض Eagle عند التشغيل مسار ملف Chrome التنفيذي الذي يتوقع استخدامه. إذا لم يكن
Chrome مثبتاً، تعرض وحدة التحكم إصدار التنزيل وأوامر التثبيت المناسبة لجهازك.
اتبع الأوامر كما هي؛ إذ يتطابق الإصدار ومجلد الوجهة مع إصدار Puppeteer المثبّت.

إذا ظهرت رسالة تفيد بإغلاق Chrome أو تغيّر الصفحة، فأعد فتح Chrome عند الحاجة،
وانتظر استقرار الصفحة ثم أعد المحاولة. أعد تشغيل Eagle إذا استمرت المشكلة.
للمساعدة في إعداد مؤسستك، تواصل مع مسؤول فريقك أو ممثل حج اونسوفث.

## हिन्दी

### आपकी टीम के लिए आसान कार्यप्रवाह

Hajonsoft Eagle टीमों को यात्रियों की जानकारी तैयार करने और समर्थित वीज़ा
प्रक्रियाएँ कम दोहराव वाले चरणों में पूरी करने में मदद करता है। पासपोर्ट का
विवरण और आवेदन के काम आपके कंप्यूटर पर एक निर्देशित कार्यप्रवाह में आते हैं,
जिसे आप ब्राउज़र विंडो में देख सकते हैं।

Eagle का उद्देश्य जानकारी बार-बार दर्ज करने में लगने वाला समय घटाना और ज़रूरी
विवरणों की जाँच पर ध्यान देना है। यात्री की जानकारी जाँचना और संबंधित सेवा की
आवश्यकताओं का पालन करना आपकी टीम की ज़िम्मेदारी है।

### शुरुआत करें

आपको **Node.js LTS** और **Git** की आवश्यकता होगी:

1. [nodejs.org](https://nodejs.org/) से Node.js इंस्टॉल करें।
2. [git-scm.com/downloads](https://git-scm.com/downloads) से Git इंस्टॉल करें।
3. macOS/Linux पर Terminal या Windows पर PowerShell खोलें और चलाएँ:

   ```bash
   git clone https://github.com/hajonsoft/eagle.git
   cd eagle
   npm install
   ```

### इंस्टॉलेशन जाँचें

पुष्टि करें कि टूल उपलब्ध हैं, फिर Eagle का इंस्टॉल किया हुआ संस्करण देखें:

```bash
node --version
npm --version
git --version
node . -v
```

यह संस्करण-जाँच केवल स्थानीय इंस्टॉलेशन की पुष्टि करती है। वास्तविक प्रक्रिया
के लिए आपकी संस्था से मिला यात्री डेटा, खाता-अनुमति और रन करने के निर्देश भी
चाहिए। ये तैयार होने से पहले कोई वास्तविक सबमिशन शुरू न करें।

### ब्राउज़र सहायता

शुरू होते समय Eagle अपेक्षित Chrome executable का path दिखाता है। Chrome न मिलने
पर console आपके कंप्यूटर के लिए सही डाउनलोड संस्करण और इंस्टॉलेशन कमांड दिखाता
है। उन्हीं कमांड का उपयोग करें; संस्करण और destination इंस्टॉल किए गए Puppeteer
पैकेज के अनुसार बनाए जाते हैं।

यदि संदेश आए कि Chrome बंद हो गया है या पेज बदल गया है, तो ज़रूरत पड़ने पर Chrome
फिर खोलें, पेज स्थिर होने दें और दोबारा प्रयास करें। समस्या बनी रहे तो Eagle को
फिर से शुरू करें। संस्था की सेटअप सहायता के लिए अपनी टीम के प्रमुख या Hajonsoft
प्रतिनिधि से संपर्क करें।