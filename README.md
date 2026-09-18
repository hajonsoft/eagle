# Hajonsoft Eagle

## English

### What is Eagle?

Hajonsoft Eagle is a powerful automation tool for teams that process passports,
traveler documents, and applications. It reads your document data and submits it
to external systems, helping your team complete repetitive work faster and with
fewer data-entry errors.

Eagle runs directly on your computer, giving your team a fast and practical
workspace for daily operations. Owl uses the same engine on Hajonsoft-managed
cloud machines, while Eagle gives you the convenience and control of running
the workflow locally.

### Why is it called Eagle?

The eagle is a bird of prey known for its power, speed, and keen eyesight. The
name reflects what Eagle brings to your operation: clear document recognition,
fast execution, and the strength to handle demanding workloads.

### How Eagle helps your business

- **Faster document processing:** Send complete document packages in one action
	instead of searching for and uploading each file separately.
- **One-click resubmission:** Correct and resubmit an application quickly when a
	destination system requests it.
- **Less manual entry:** Reuse captured information for applications and printed
	documents, while retaining important values such as MOFA numbers.
- **Smarter document capture:** Use document recognition to capture passport
	details, including issue dates, without relying on an expensive 3M scanner.
- **Early validation:** Identify expired passports, duplicate records, and other
	issues before they slow down the application process.
- **Better workflow continuity:** Reduce the risk of losing progress because of
	destination-system timeouts.
- **Flexible passport handling:** Help resolve MRZ and parsing limitations,
	including cases involving issuing-authority details or nationality recognition.
- **Faster Hajj workflows:** Import MOFA numbers and automate Hajj smart-form
	data entry.
- **A stronger support platform:** Give Hajonsoft support teams a consistent,
	scalable workflow for assisting clients and processing large volumes of
	passports.
- **Secure access:** Support passwordless login and two-factor authentication.
- **Less friction:** Reduce repetitive captcha-related steps where supported by
	the connected system.

### Installation

Before installing Eagle, install the latest versions of **Node.js** and **Git**.

1. Download Node.js from [nodejs.org](https://nodejs.org/) and choose the latest
	 LTS version. After installation, open Terminal (macOS/Linux) or PowerShell
	 (Windows) and confirm it is available:

	 ```bash
	 node --version
	 npm --version
	 ```

2. Download Git from [git-scm.com/downloads](https://git-scm.com/downloads)
	 and follow the installer. Confirm it is available in Terminal or PowerShell:

	 ```bash
	 git --version
	 ```

3. Clone Eagle from GitHub, move into its folder, and install its dependencies:

	 ```bash
	 git clone https://github.com/hajonsoft/eagle.git
	 cd eagle
	 npm i
	 ```

### Updating Eagle

When a new version is available, open Terminal or PowerShell inside the Eagle
folder and run:

```bash
git pull origin main
```

This downloads the latest changes while preserving local changes whenever Git
can merge them. To make your local copy exactly match the latest `main` branch,
run:

```bash
git fetch origin
git reset --hard origin/main
```

The reset command removes local changes to tracked files. After either update
method, install any updated dependencies:

```bash
npm i
```
## العربية

### ما هو النسر؟

Hajonsoft النسر هو أداة أتمتة قوية للفرق التي تعالج جوازات السفر ووثائق
المسافرين والطلبات. يقرأ بيانات المستندات ويرسلها إلى الأنظمة الخارجية، مما
يساعد فريقك على إنجاز الأعمال المتكررة بسرعة أكبر وبأخطاء أقل في إدخال البيانات.

يعمل النسر مباشرة على جهاز الكمبيوتر الخاص بك، ليمنح فريقك بيئة عملية وسريعة
للعمليات اليومية. أما Owl فيستخدم المحرك نفسه على أجهزة سحابية تديرها
Hajonsoft، بينما يمنحك النسر مرونة وتحكماً أكبر من خلال التشغيل المحلي.

### لماذا سُمّي النسر؟

النسر طائر جارح معروف بقوته وسرعته وقوة بصره. ويعكس الاسم ما يقدمه النسر
لعملياتك: قراءة واضحة للمستندات، وتنفيذ سريع، وقدرة على التعامل مع أحجام العمل
الكبيرة.

### فوائد النسر لعملك

- معالجة أسرع للمستندات وإرسال حزمة المستندات كاملة في خطوة واحدة.
- إعادة إرسال الطلبات بنقرة واحدة بدلاً من تكرار جميع الخطوات.
- إعادة استخدام البيانات التي تم التقاطها في الطلبات والمستندات المطبوعة.
- التقاط بيانات مهمة مثل أرقام MOFA وتفاصيل جواز السفر وتاريخ الإصدار.
- التحقق المبكر من الجوازات المنتهية والسجلات المكررة والمشكلات المحتملة.
- تقليل خطر فقدان التقدم بسبب انتهاء مهلة النظام الخارجي.
- المساعدة في معالجة قيود MRZ ومشكلات قراءة الجنسية أو بيانات جهة الإصدار.
- استيراد أرقام MOFA وأتمتة إدخال بيانات نموذج الحج الذكي.
- دعم تسجيل الدخول دون كلمة مرور والمصادقة الثنائية.
- تقليل الخطوات المتكررة المرتبطة بـ captcha حيثما يدعم النظام المتصل ذلك.

### التثبيت

قبل تثبيت النسر، ثبّت أحدث إصدار من **Node.js** و **Git**.

1. نزّل Node.js من [nodejs.org](https://nodejs.org/) واختر أحدث إصدار LTS.
	 بعد التثبيت افتح Terminal على macOS/Linux أو PowerShell على Windows وتحقق
	 من التثبيت:

	 ```bash
	 node --version
	 npm --version
	 ```

2. نزّل Git من [git-scm.com/downloads](https://git-scm.com/downloads) واتبع
	 خطوات التثبيت. ثم تحقق من التثبيت:

	 ```bash
	 git --version
	 ```

3. انسخ النسر من GitHub، وانتقل إلى مجلده، وثبّت الاعتماديات:

	 ```bash
	 git clone https://github.com/hajonsoft/eagle.git
	 cd eagle
	 npm i
	 ```

### تحديث النسر

عند توفر إصدار جديد، افتح Terminal أو PowerShell داخل مجلد النسر وشغّل:

```bash
git pull origin main
```

ولجعل النسخة المحلية مطابقة تماماً لأحدث نسخة من فرع `main`، شغّل:

```bash
git fetch origin
git reset --hard origin/main
```

يحذف أمر reset التغييرات المحلية في الملفات المتتبعة. بعد التحديث، ثبّت أي
اعتماديات جديدة:

```bash
npm i
```

## Français

### Qu'est-ce qu'Eagle ?

Hajonsoft Eagle est un puissant outil d'automatisation pour les équipes qui
traitent les passeports, les documents des voyageurs et les demandes. Il lit les
données de vos documents et les transmet aux systèmes externes, afin d'accélérer
les tâches répétitives et de réduire les erreurs de saisie.

Eagle fonctionne directement sur votre ordinateur pour offrir à votre équipe un
environnement rapide et pratique au quotidien. Owl utilise le même moteur sur
des machines cloud gérées par Hajonsoft, tandis qu'Eagle vous donne la maîtrise
et la souplesse d'un fonctionnement local.

### Pourquoi le nom Eagle ?

L'aigle est un rapace reconnu pour sa puissance, sa vitesse et sa vue perçante.
Ce nom représente les avantages d'Eagle : une lecture précise des documents,
une exécution rapide et la capacité de gérer des volumes importants.

### Les avantages d'Eagle pour votre activité

- Traiter les documents plus rapidement et envoyer un dossier complet en une
	seule action.
- Réenvoyer une demande en un clic au lieu de répéter toutes les étapes.
- Réutiliser les données capturées pour les demandes et les documents imprimés.
- Capturer les informations importantes, comme les numéros MOFA et la date de
	délivrance, grâce à la reconnaissance des documents.
- Détecter en amont les passeports expirés, les doublons et les problèmes
	potentiels.
- Réduire le risque de perdre votre progression à cause d'un délai d'expiration
	du système externe.
- Aider à traiter les limites du MRZ et les problèmes de lecture de nationalité
	ou d'autorité émettrice.
- Importer les numéros MOFA et automatiser la saisie du formulaire Hajj Smart.
- Prendre en charge la connexion sans mot de passe et l'authentification à deux
	facteurs.
- Réduire les étapes répétitives liées aux captchas lorsque le système connecté
	le permet.

### Installation

Avant d'installer Eagle, installez les dernières versions de **Node.js** et de
**Git**.

1. Téléchargez Node.js depuis [nodejs.org](https://nodejs.org/) et choisissez la
	 dernière version LTS. Après l'installation, ouvrez Terminal sur macOS/Linux
	 ou PowerShell sur Windows et vérifiez l'installation :

	 ```bash
	 node --version
	 npm --version
	 ```

2. Téléchargez Git depuis [git-scm.com/downloads](https://git-scm.com/downloads)
	 et suivez l'installateur. Vérifiez ensuite l'installation :

	 ```bash
	 git --version
	 ```

3. Clonez Eagle depuis GitHub, ouvrez son dossier et installez ses dépendances :

	 ```bash
	 git clone https://github.com/hajonsoft/eagle.git
	 cd eagle
	 npm i
	 ```

### Mettre Eagle à jour

Lorsqu'une nouvelle version est disponible, ouvrez Terminal ou PowerShell dans
le dossier Eagle et exécutez :

```bash
git pull origin main
```

Pour rendre votre copie locale exactement identique à la dernière version de la
branche `main`, exécutez :

```bash
git fetch origin
git reset --hard origin/main
```

La commande reset supprime les modifications locales des fichiers suivis. Après
la mise à jour, installez les dépendances éventuellement modifiées :

```bash
npm i
```
