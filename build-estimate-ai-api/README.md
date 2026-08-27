# Build Estimate AI — API

Backend Laravel de **Build Estimate AI**, un SaaS destiné aux architectes, ingénieurs, bureaux
d'études et entrepreneurs BTP : import d'un plan architectural → analyse IA → estimation des
matériaux → rapport PDF. Le frontend React vit dans `../build-estimate-ai-vite`.

Monolithe Laravel modulaire (pas de microservices) : `Controller` mince → `FormRequest` → `Service`
→ `Model`. Voir `app/Services/` pour la logique métier de chaque domaine.

## Stack

- Laravel 12, PHP 8.3+
- Laravel Sanctum en mode **SPA stateful** (cookies + CSRF, pas de tokens Bearer) pour le React
  séparé sur `localhost:5173`
- SQLite en local (voir *Base de données* ci-dessous) — MySQL/PostgreSQL en staging/production
- PHPUnit pour les tests

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # si absent
php artisan migrate --seed
```

### `pdo_sqlite` désactivé dans le PHP système ?

Sur cette machine de dev, l'extension `pdo_sqlite` est désactivée dans le `php.ini` système et
son édition nécessite des droits admin. Un `php.ini` local avec `pdo_sqlite`/`sqlite3` activés
est fourni dans `.phpconfig/php.ini` (copie du php.ini système + ces deux extensions
décommentées). Pour l'utiliser sans toucher au système, préfixe chaque commande `php`/`artisan`/
`composer` par la variable d'environnement `PHPRC` :

```bash
PHPRC="$(pwd)/.phpconfig" php artisan migrate
```

Si `pdo_sqlite` est déjà actif sur ta machine, ignore cette étape et lance les commandes
normalement.

## Environnement

Toutes les variables sont documentées dans `.env.example`. Points notables :

- `FRONTEND_URL` / `SANCTUM_STATEFUL_DOMAINS` — origine du React (défaut `localhost:5173`) ;
  requis pour que Sanctum traite les requêtes du SPA comme "stateful" (session + cookies) et pour
  la config CORS (`config/cors.php`, jamais de wildcard `*`).
- `AI_PROVIDER=mock` — aucune clé API requise en dev/CI ; voir *IA* ci-dessous (Phase 4).
- `PAYMENT_PROVIDER=mock` — idem pour la facturation ; voir *Facturation & usage* ci-dessous
  (Phase 7).
- `BUILD_ESTIMATE_*` — config centralisée du domaine métier dans `config/build_estimate.php`
  (taille max upload, formats acceptés, devise par défaut, seuil de confiance IA, etc.).

## Base de données

**SQLite par défaut en local** (`DB_CONNECTION=sqlite`) : zéro service externe à lancer. Pour
passer en MySQL/PostgreSQL (staging/prod), change `DB_CONNECTION` et renseigne host/port/
database/credentials dans `.env` — le code (migrations, Eloquent) est agnostique du moteur.

```bash
php artisan migrate:fresh --seed
```

Crée un utilisateur de démo : `demo@buildestimate.ai` / `password`, propriétaire de
l'organisation "Cabinet Architecture Dupont", ainsi que le catalogue matériaux et les forfaits
d'abonnement (`free`/`pro`/`business`, voir *Facturation & usage*).

## Storage

Les fichiers (plans, rapports) utilisent le disque `local` (`storage/app/private`, **jamais**
public). Aucun accès direct via `/storage/...` : tout téléchargement passe par un contrôleur qui
vérifie la Policy correspondante puis stream le fichier.

## Queue

`QUEUE_CONNECTION=database` en local. Les traitements longs (analyse IA, génération d'estimation/
rapport, Phases 4-6) passent par des Jobs, jamais dans la requête HTTP. Lancer un worker :

```bash
php artisan queue:work
```

## IA (Phase 4)

`AI_PROVIDER=mock` par défaut : un `MockAIProvider` simule l'analyse sans appel externe, pour que
tout le pipeline (upload → analyse → review → estimation → rapport) soit testable en CI sans clé
API. `AIProviderInterface` permettra de brancher OpenAI/Anthropic/Gemini plus tard sans toucher au
reste de l'application.

## Facturation & usage (Phase 7)

Chaque organisation a au plus un abonnement courant (`Subscription` → `SubscriptionPlan`) ; sans
abonnement actif, elle est traitée comme sur le forfait `free`. Chaque `SubscriptionPlan` définit
des limites configurables (`plans_per_month`, `analyses_per_month`, `reports_per_month`,
`storage_mb`, `team_members` — une clé absente ou `null` = illimité), jamais codées en dur :
`App\Services\UsageService` les lit dynamiquement et lève une `InsufficientUsageException` (HTTP
402) avant qu'un upload/une analyse/un rapport ne dépasse le quota mensuel de l'organisation. Si
aucun forfait n'est seedé (environnement qui n'a pas lancé `SubscriptionPlanSeeder`), les limites
s'ouvrent par défaut plutôt que de bloquer toute action métier sur une ligne de config manquante.

La facturation elle-même est abstraite derrière `App\Services\Payment\PaymentProviderInterface`,
sur le même principe que `AIProviderInterface`. `PAYMENT_PROVIDER=mock` (défaut) ne nécessite
aucune clé API et active l'abonnement de façon synchrone — utile pour les tests/CI. Les classes
`StripePaymentProvider`/`PaystackPaymentProvider`/`FlutterwavePaymentProvider` sont des points
d'extension déclarés mais **non connectés à un compte réel** dans cette base de code ; les
implémenter (SDK + webhook de confirmation) est un travail à part entière, volontairement hors
scope ici.

## Journal d'audit (Phase 8)

`App\Services\AuditLogService` enregistre les événements clés (`project.created`,
`plan.uploaded`, `analysis.confirmed`, `estimate.generated`, `report.downloaded`) dans la table
`audit_logs` (qui, quoi, quand, IP). Sert uniquement de piste d'audit — jamais utilisé pour le
contrôle d'accès (les Policies restent la seule source de vérité pour l'autorisation).

## Notifications (Phase 8)

Canal `database` uniquement (table `notifications`, standard Laravel). Déclenchées quand
l'analyse d'un plan se termine (`AnalysisCompletedNotification`) ou échoue
(`AnalysisFailedNotification`), et quand une estimation (`EstimateReadyNotification`) ou un
rapport (`ReportReadyNotification`) est prêt — toujours vers l'utilisateur à l'origine de l'action
(uploader du plan, créateur de l'estimation, générateur du rapport).

## Lancer en local

```bash
PHPRC="$(pwd)/.phpconfig" php artisan serve   # http://localhost:8000
```

Le frontend React (`../build-estimate-ai-vite`, `npm run dev`) doit tourner sur
`http://localhost:5173` pour que Sanctum reconnaisse les requêtes comme stateful.

## Tests

```bash
PHPRC="$(pwd)/.phpconfig" php artisan test
```

`phpunit.xml` utilise SQLite en mémoire (`:memory:`) pour des tests rapides et isolés.

## API

Toutes les routes métier sont sous `/api/v1/`. Réponses au format
`{success, data, message}` / `{success, message, errors}` (voir `app/Support/ApiResponse.php`).
Voir `php artisan route:list --path=api` pour la liste à jour, ou `docs/openapi.yaml`
(OpenAPI 3.0 — schémas + requêtes/réponses de tous les endpoints) pour la référence complète,
consultable dans n'importe quel visualiseur Swagger/Redoc.

### Auth (Sanctum SPA — session + cookies, pas de token à gérer côté React)

| Méthode | Route |
|---|---|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/logout` *(auth)* |
| GET | `/api/v1/auth/me` *(auth)* |
| POST | `/api/v1/auth/forgot-password` |
| POST | `/api/v1/auth/reset-password` |

### Organisations

| Méthode | Route |
|---|---|
| GET | `/api/v1/organizations` *(auth — liste les organisations de l'utilisateur)* |
| POST | `/api/v1/organizations` *(auth — crée, l'utilisateur devient owner)* |
| GET | `/api/v1/organizations/{organization}` *(auth + policy)* |
| GET | `/api/v1/organizations/{organization}/dashboard` *(auth + policy — compteurs, activité récente, usage)* |

### Projets

| Méthode | Route |
|---|---|
| GET | `/api/v1/projects` *(auth — liste, filtrable par `organization_id`/`status`/`search`, triable, paginée)* |
| POST | `/api/v1/projects` *(auth + policy — `organization_id` requis, doit être un membre éditeur)* |
| GET | `/api/v1/projects/{project}` *(auth + policy)* |
| PATCH | `/api/v1/projects/{project}` *(auth + policy — `status` n'est jamais modifiable directement par le client, voir §71)* |
| DELETE | `/api/v1/projects/{project}` *(auth + policy — owner/admin uniquement, soft delete)* |

### Plans

| Méthode | Route |
|---|---|
| GET | `/api/v1/projects/{project}/plans` *(auth + policy)* |
| POST | `/api/v1/projects/{project}/plans` *(auth + policy + `throttle:uploads` — limite d'usage du forfait appliquée)* |
| GET | `/api/v1/plans/{plan}` *(auth + policy)* |
| DELETE | `/api/v1/plans/{plan}` *(auth + policy — soft delete)* |

### Analyse (IA)

| Méthode | Route |
|---|---|
| POST | `/api/v1/plans/{plan}/analyze` *(auth + policy + `throttle:analysis` — limite d'usage du forfait appliquée)* |
| GET | `/api/v1/analyses/{analysis}` |
| POST | `/api/v1/analyses/{analysis}/review` *(applique des corrections de mesures)* |
| POST | `/api/v1/analyses/{analysis}/confirm` |
| PATCH | `/api/v1/analyses/{analysis}/measurements/{measurement}` |

### Estimations

| Méthode | Route |
|---|---|
| GET | `/api/v1/projects/{project}/estimates` |
| POST | `/api/v1/projects/{project}/estimates` *(depuis une analyse confirmée — `certified: false` toujours présent en réponse)* |
| GET | `/api/v1/estimates/{estimate}` |

### Rapports

| Méthode | Route |
|---|---|
| POST | `/api/v1/estimates/{estimate}/reports` *(`throttle:reports` — limite d'usage du forfait appliquée)* |
| GET | `/api/v1/reports/{report}` |
| GET | `/api/v1/reports/{report}/download` *(stream PDF policy-checked, jamais de chemin de stockage exposé)* |

### Facturation & usage

| Méthode | Route |
|---|---|
| GET | `/api/v1/subscription-plans` *(public — pas d'auth requise)* |
| GET | `/api/v1/organizations/{organization}/subscription` *(auth + policy — abonnement courant + usage)* |
| POST | `/api/v1/organizations/{organization}/subscription` *(auth + policy `manageBilling` — owner/admin uniquement)* |
| POST | `/api/v1/organizations/{organization}/subscription/cancel` *(auth + policy `manageBilling`)* |

## Déploiement

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan migrate --force
```

`APP_ENV=production` et `APP_DEBUG=false` obligatoires. Les workers de queue doivent tourner en
processus supervisé (Supervisor/systemd), pas via `php artisan queue:work` en foreground.
